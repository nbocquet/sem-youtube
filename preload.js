const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('semyoutube', {
	readClipboard: async () => ipcRenderer.invoke('read-clipboard')
})
