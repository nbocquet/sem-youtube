const REGEX_ID = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/

function extraireVideoId (lien) {
	const correspondance = lien.match(REGEX_ID)
	if (!correspondance || !correspondance[2] || correspondance[2].length !== 11) {
		return null
	}
	return correspondance[2]
}

function extraireDebut (lien) {
	const correspondance = lien.match(/[?&](?:t|start)=([0-9]+)/)
	if (!correspondance) {
		return 0
	}
	return parseInt(correspondance[1], 10) || 0
}

function ouvrirVideo (lien) {
	const videoId = extraireVideoId(lien.trim())
	if (!videoId) {
		document.querySelector('#erreur').textContent = "Ce lien ne semble pas être une vidéo YouTube valide."
		return
	}
	const debut = extraireDebut(lien.trim())
	const parametres = new URLSearchParams({ videoId: videoId })
	if (debut > 0) {
		parametres.set('debut', String(debut))
	}
	window.location.href = './player.html?' + parametres.toString()
}

document.querySelector('#formulaire').addEventListener('submit', function (evenement) {
	evenement.preventDefault()
	document.querySelector('#erreur').textContent = ''
	ouvrirVideo(document.querySelector('#lien').value)
})

if (window.location.hash.startsWith('#lien=')) {
	const lienInitial = decodeURIComponent(window.location.hash.slice('#lien='.length))
	if (lienInitial) {
		ouvrirVideo(lienInitial)
	}
}

window.addEventListener('focus', function () {
	if (!window.semyoutube || document.querySelector('#lien').value !== '') {
		return
	}
	window.semyoutube.readClipboard().then(function (texte) {
		if (texte && extraireVideoId(texte.trim())) {
			document.querySelector('#lien').value = texte.trim()
		}
	})
})
