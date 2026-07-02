const { app, BrowserWindow, shell, Menu, ipcMain, clipboard } = require('electron')
const path = require('path')

ipcMain.handle('read-clipboard', function () {
	return clipboard.readText()
})

let fenetrePrincipale = null

function urlDepuisArgv (argv) {
	return argv.find(function (arg) {
		return arg.startsWith('http://') || arg.startsWith('https://')
	})
}

function chargerAccueil (fenetre, lienInitial) {
	if (lienInitial) {
		fenetre.loadFile(path.join(__dirname, 'renderer', 'index.html'), {
			hash: 'lien=' + encodeURIComponent(lienInitial)
		})
	} else {
		fenetre.loadFile(path.join(__dirname, 'renderer', 'index.html'))
	}
}

function creerFenetre (lienInitial) {
	fenetrePrincipale = new BrowserWindow({
		width: 1100,
		height: 720,
		backgroundColor: '#001d1d',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	chargerAccueil(fenetrePrincipale, lienInitial)

	fenetrePrincipale.webContents.setWindowOpenHandler(function (details) {
		if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
			shell.openExternal(details.url)
		}
		return { action: 'deny' }
	})

	fenetrePrincipale.webContents.on('will-navigate', function (evenement, url) {
		const estFichierLocal = url.startsWith('file://') && url.includes(path.join(__dirname, 'renderer'))
		if (!estFichierLocal) {
			evenement.preventDefault()
			shell.openExternal(url)
		}
	})
}

function construireMenu () {
	const modeles = [
		{
			label: 'sem-youtube',
			submenu: [
				{
					label: 'Nouvelle vidéo',
					accelerator: 'CmdOrCtrl+N',
					click: function () {
						if (fenetrePrincipale) {
							chargerAccueil(fenetrePrincipale, null)
						}
					}
				},
				{ role: 'togglefullscreen' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		},
		{
			label: 'Édition',
			submenu: [
				{ role: 'copy' },
				{ role: 'paste' }
			]
		}
	]
	Menu.setApplicationMenu(Menu.buildFromTemplate(modeles))
}

app.whenReady().then(function () {
	construireMenu()
	creerFenetre(urlDepuisArgv(process.argv.slice(1)))

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			creerFenetre()
		}
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
