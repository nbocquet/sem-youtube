const { app, BrowserWindow, shell, Menu, ipcMain, clipboard } = require('electron')
const path = require('path')
const { demarrerServeurLocal } = require('./server')

ipcMain.handle('read-clipboard', function () {
	return clipboard.readText()
})

let fenetrePrincipale = null
let baseURL = null

function urlDepuisArgv (argv) {
	return argv.find(function (arg) {
		return arg.startsWith('http://') || arg.startsWith('https://')
	})
}

function chargerAccueil (fenetre, lienInitial) {
	const url = lienInitial
		? baseURL + '/index.html#lien=' + encodeURIComponent(lienInitial)
		: baseURL + '/index.html'
	fenetre.loadURL(url)
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
		if (!url.startsWith(baseURL)) {
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

app.whenReady().then(async function () {
	const serveur = await demarrerServeurLocal(path.join(__dirname, 'renderer'))
	baseURL = 'http://127.0.0.1:' + serveur.address().port

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
