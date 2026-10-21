import { app, BrowserWindow, ipcMain, globalShortcut, desktopCapturer, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance flags: disable throttling, hardware acceleration on macOS
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar');
app.commandLine.appendSwitch('high-dpi-support', '1');

let mainWindow: BrowserWindow | null = null;
let isTeleprompter = false;
let currentOpacity = 0.95;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const initialWidth = 760;
  const initialHeight = 620;
  const initialX = Math.round((screenWidth - initialWidth) / 2);
  const initialY = 40; // Position near top / camera for natural eye contact

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    hasShadow: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    minWidth: 480,
    minHeight: 140,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      spellcheck: false, // Performance boost
      webSecurity: false, // Allows renderer to make direct HTTPS API calls to Gemini, Groq, OpenAI, Claude
    },
  });

  // Keep window on top even over fullscreen apps & spaces
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // STEALTH MODE: Native macOS NSWindowSharingNone
  // Prevents the window from appearing in Zoom, Google Meet, MS Teams, Discord screen sharing
  try {
    mainWindow.setContentProtection(true);
    console.log('[xGhost] Content protection (stealth cloak) enabled successfully');
  } catch (err) {
    console.error('[xGhost] Failed to enable content protection:', err);
  }

  // Load URL or local build
  const distIndexPath = path.join(__dirname, '../dist/index.html');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(distIndexPath)) {
    mainWindow.loadFile(distIndexPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerHotkeys() {
  // Toggle HUD visibility
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Panic button: Instantly hide window
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    }
  });

  // Trigger screen capture for Vision AI
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow) {
      mainWindow.webContents.send('trigger-screen-snip');
    }
  });

  // Toggle voice recording
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.webContents.send('trigger-voice-record');
    }
  });

  // Increase opacity
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    if (mainWindow) {
      currentOpacity = Math.min(1.0, currentOpacity + 0.05);
      mainWindow.setOpacity(currentOpacity);
      mainWindow.webContents.send('opacity-changed', currentOpacity);
    }
  });

  // Decrease opacity
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    if (mainWindow) {
      currentOpacity = Math.max(0.2, currentOpacity - 0.05);
      mainWindow.setOpacity(currentOpacity);
      mainWindow.webContents.send('opacity-changed', currentOpacity);
    }
  });
}

// IPC Handlers
ipcMain.handle('set-opacity', (_event, opacity: number) => {
  if (mainWindow) {
    currentOpacity = Math.max(0.15, Math.min(1.0, opacity));
    mainWindow.setOpacity(currentOpacity);
    return currentOpacity;
  }
  return 1.0;
});

ipcMain.handle('toggle-content-protection', (_event, enable: boolean) => {
  if (mainWindow) {
    mainWindow.setContentProtection(enable);
    return enable;
  }
  return false;
});

ipcMain.handle('toggle-teleprompter', () => {
  if (!mainWindow) return false;
  isTeleprompter = !isTeleprompter;
  
  const bounds = mainWindow.getBounds();
  if (isTeleprompter) {
    mainWindow.setBounds({
      x: bounds.x,
      y: 25,
      width: Math.max(bounds.width, 680),
      height: 160,
    });
  } else {
    mainWindow.setBounds({
      x: bounds.x,
      y: 60,
      width: bounds.width,
      height: 620,
    });
  }
  return isTeleprompter;
});

ipcMain.handle('set-ignore-mouse', (_event, ignore: boolean) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    return ignore;
  }
  return false;
});

ipcMain.handle('capture-screen', async () => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    });

    if (sources.length > 0) {
      const primarySource = sources[0];
      const dataUrl = primarySource.thumbnail.toDataURL();
      return { success: true, image: dataUrl };
    }
    return { success: false, error: 'Экран не найден' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Ошибка захвата экрана' };
  }
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('hide-window', () => {
  mainWindow?.hide();
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
});

app.whenReady().then(() => {
  createWindow();
  registerHotkeys();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
