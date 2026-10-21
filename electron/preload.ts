import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity: number) => ipcRenderer.invoke('set-opacity', opacity),
  toggleContentProtection: (enable: boolean) => ipcRenderer.invoke('toggle-content-protection', enable),
  toggleTeleprompter: () => ipcRenderer.invoke('toggle-teleprompter'),
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.invoke('set-ignore-mouse', ignore),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Event listeners
  onTriggerScreenSnip: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('trigger-screen-snip', listener);
    return () => ipcRenderer.removeListener('trigger-screen-snip', listener);
  },
  onTriggerVoiceRecord: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('trigger-voice-record', listener);
    return () => ipcRenderer.removeListener('trigger-voice-record', listener);
  },
  onOpacityChanged: (callback: (opacity: number) => void) => {
    const listener = (_e: any, val: number) => callback(val);
    ipcRenderer.on('opacity-changed', listener);
    return () => ipcRenderer.removeListener('opacity-changed', listener);
  },
});
