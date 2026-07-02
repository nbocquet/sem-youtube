const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const TYPES_MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml'
}

// L'API YouTube IFrame ne répond pas aux commandes postMessage (playVideo, etc.)
// lorsque la page parente est chargée en file:// — le message vers l'iframe n'aboutit
// jamais (la vidéo s'affiche mais ne démarre jamais). On sert donc le renderer via un
// petit serveur HTTP local en boucle (127.0.0.1), invisible pour l'utilisateur et sans
// aucune configuration : pas de PHP, pas de dépendance, pas d'accès réseau externe.
function demarrerServeurLocal (racineRenderer) {
	return new Promise(function (resolve, reject) {
		const serveur = http.createServer(function (requete, reponse) {
			const cheminDemande = decodeURIComponent(requete.url.split('?')[0])
			const cheminAbsolu = path.normalize(path.join(racineRenderer, cheminDemande))
			const relatif = path.relative(racineRenderer, cheminAbsolu)
			if (relatif.startsWith('..') || path.isAbsolute(relatif)) {
				reponse.writeHead(403)
				reponse.end()
				return
			}
			fs.readFile(cheminAbsolu, function (erreur, contenu) {
				if (erreur) {
					reponse.writeHead(404)
					reponse.end()
					return
				}
				const type = TYPES_MIME[path.extname(cheminAbsolu)] || 'application/octet-stream'
				reponse.writeHead(200, { 'Content-Type': type })
				reponse.end(contenu)
			})
		})
		serveur.on('error', reject)
		serveur.listen(0, '127.0.0.1', function () {
			resolve(serveur)
		})
	})
}

module.exports = { demarrerServeurLocal }
