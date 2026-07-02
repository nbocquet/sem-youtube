const conteneurVideo = document.querySelector('#conteneur-video')
const masque = document.querySelector('#masque')
const masqueTransparent = document.querySelector('#masque-transparent')
const masqueLecture = document.querySelector('#masque-lecture')
const masqueRelecture = document.querySelector('#masque-relecture')
const masqueVideo = document.querySelector('#masque-video')
const video = document.querySelector('#video')
const videoIframe = video.querySelector('iframe')

const niveauEl = document.querySelector('#niveau')
const controlesEl = document.querySelector('#controles')
const dureeEl = document.querySelector('#duree')
const ecouleEl = document.querySelector('#ecoule')
const chargeEl = document.querySelector('#charge')
const luEl = document.querySelector('#lu')
const volumeEl = document.querySelector('#volume')
const tooltip = document.querySelector('#tooltip')
const barreRecherche = document.querySelector('#contenu-recherche')

const boutonLecture = document.querySelector('#bouton-lecture')
const boutonSousTitres = document.querySelector('#bouton-sous-titres')
const boutonVitesse = document.querySelector('#bouton-vitesse')
const boutonRatio = document.querySelector('#bouton-ratio')
const boutonImage = document.querySelector('#bouton-image')
const boutonVolume = document.querySelector('#bouton-volume')
const boutonPleinEcran = document.querySelector('#bouton-plein-ecran')

const iconeLancer = document.querySelector('#icone-lancer')
const iconePause = document.querySelector('#icone-pause')
const iconeRejouer = document.querySelector('#icone-rejouer')
const iconeMuet = document.querySelector('#icone-muet')
const iconeVolume = document.querySelector('#icone-volume')
const iconePleinEcran = document.querySelector('#icone-plein-ecran')
const iconeSortirPleinEcran = document.querySelector('#icone-sortir-plein-ecran')

const listeRatio = document.querySelector('#liste-ratio')
const listeVitesses = document.querySelector('#liste-vitesses')
const listeSousTitres = document.querySelector('#liste-sous-titres')

const options = {
	iv_load_policy: 3,
	cc_load_policy: 1,
	origin: 'https://www.youtube-nocookie.com',
	playsinline: 1,
	rel: 0,
	controls: 0,
	autoplay: 0,
	start: debut,
	end: fin
}

let player, chargement, statut, niveauVolume, mettreAJourTemps, masquerControlesAuto
let temps = 0
let duree = fin - debut
let pleinEcran = false
let videoLancee = false
let blink = false
if (window.chrome || (window.Intl && Intl.v8BreakIterator)) {
	blink = true
}

document.body.classList.add(ratio)
document.querySelector('.ratio[data-ratio=' + ratio + ']').classList.add('active')

document.body.dispatchEvent(new Event('click'))

window.addEventListener('resize', redimensionnerListes)

window.addEventListener('message', function (event) {
    if (event.data.message === 'evenement' && (event.data.type === 'click' || event.data.type === 'keydown')) {
		masquerControles()
	}
})

window.addEventListener('blur', function () {
	masquerControles()
})

function redimensionnerListes () {
	const hauteur = conteneurVideo.offsetHeight
    if (hauteur < 257) {
		listeRatio.style.maxHeight = (hauteur - 60) + 'px'
		listeSousTitres.style.maxHeight = (hauteur - 60) + 'px'
		listeVitesses.style.maxHeight = (hauteur - 60) + 'px'
    } else {
		listeRatio.style.maxHeight = '257px'
        listeSousTitres.style.maxHeight = '257px'
		listeVitesses.style.maxHeight = '257px'
	}
}
redimensionnerListes()

if (vignette === '') {
	masqueTransparent.classList.add('sans-vignette')
}

if (sousTitres !== '') {
	let liste = ''
	const items = sousTitres.split(',')
	items.forEach(function (item) {
		if (item !== '') {
			liste += '<span class="langue" role="button" tabindex="0" title="Activer les sous-titres ' + item + '" data-langue="' + item + '" aria-label="Activer les sous-titres ' + item + '" data-langue="' + item + '">' + item.toUpperCase() + '</span>'
		}
	})
	if (liste !== '') {
		boutonSousTitres.style.display = 'inline-block'
		listeSousTitres.innerHTML = '<span>Sous-titres</span><span class="langue active" role="button" title="Désactiver les sous-titres" aria-label="Désactiver les sous-titres" tabindex="0" data-langue="off">Aucun</span>' + liste
		
		const sousTitres = document.querySelectorAll('#liste-sous-titres span.langue')
		sousTitres.forEach(function (item) {
			item.addEventListener('click', function (event) {
				if (listeSousTitres.querySelector('.active')) {
					listeSousTitres.querySelector('.active').classList.remove('active')
				}
				const langue = event.target.getAttribute('data-langue')
				if (langue === 'off') {
					videoIframe.style.height = 'calc(100% + 460px)'
					videoIframe.style.top = '-230px'
					boutonSousTitres.classList.remove('active')
				} else {
					if (statut === 1) {
						videoIframe.style.height = '100%'
						videoIframe.style.top = '0'
					}
					player.setOption('captions', 'track', { 'languageCode': langue })
					boutonSousTitres.classList.add('active')
				}
				event.target.classList.add('active')
			})

			item.addEventListener('keydown', function (event) {
				if (event.key === 'Enter') {
					if (listeSousTitres.querySelector('.active')) {
						listeSousTitres.querySelector('.active').classList.remove('active')
					}
					const langue = event.target.getAttribute('data-langue')
					if (langue === 'off') {
						videoIframe.style.height = 'calc(100% + 460px)'
						videoIframe.style.top = '-230px'
						boutonSousTitres.classList.remove('active')
					} else {
						if (statut === 1) {
							videoIframe.style.height = '100%'
							videoIframe.style.top = '0'
						}
						player.setOption('captions', 'track', { 'languageCode': langue })
						boutonSousTitres.classList.add('active')
					}
					event.target.classList.add('active')
				}
			})
		})

		boutonSousTitres.addEventListener('click', function () {
			if (boutonVitesse.classList.contains('visible')) {
				boutonVitesse.classList.remove('visible')
			}
			if (boutonRatio.classList.contains('visible')) {
				boutonRatio.classList.remove('visible')
			}
			if (boutonSousTitres.classList.contains('visible')) {
				boutonSousTitres.classList.remove('visible')
			} else {
				boutonSousTitres.classList.add('visible')
			}
		})

		boutonSousTitres.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				if (boutonVitesse.classList.contains('visible')) {
					boutonVitesse.classList.remove('visible')
				}
				if (boutonRatio.classList.contains('visible')) {
					boutonRatio.classList.remove('visible')
				}
				if (boutonSousTitres.classList.contains('visible')) {
					boutonSousTitres.classList.remove('visible')
				} else {
					boutonSousTitres.classList.add('visible')
				}
			}
		})
	}
}

const script = document.createElement('script')
script.src = 'https://www.youtube.com/iframe_api'
const premierScript = document.getElementsByTagName('script')[0]
premierScript.parentNode.insertBefore(script, premierScript)

function onYouTubeIframeAPIReady () {
    player = new YT.Player('lecteur', {
        height: '100%',
        width: '100%',
        videoId: videoId,
		host: 'https://www.youtube-nocookie.com',
		suggestedQuality: 'default',
        events: {
            'onReady': lecteurCharge,
            'onStateChange': statutLecteurModifie
        },
        playerVars: options
    })
}

function lecteurCharge () {
	masqueLecture.style.display = 'block'
	masqueRelecture.style.display = 'none'
	masque.style.display = 'block'
	masque.classList.remove('vignette')
	dureeEl.textContent = formatTime(duree)

	// Chromium/Electron : on démarre en muet, l'interaction de lecture démasque le son
	// (contrairement à Digiview embarqué dans une page tierce, cette appli n'a pas
	// besoin de faire passer le clic à travers l'iframe YouTube brute : on garde donc
	// notre propre overlay cliquable plutôt que de désactiver ses pointer-events).
	if (blink === true) {
		player.mute()
	}

	masqueTransparent.focus()

	document.addEventListener('keydown', function (event) {
		if (event.key === ' ') {
			lecture()
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			temps = player.getCurrentTime() - debut
			if (event.key === 'ArrowLeft') {
				player.seekTo(temps - 1, true)
				ecouleEl.textContent = formatTime(temps)
			} else if (event.key === 'ArrowRight') {
				player.seekTo(temps + 1, true)
				ecouleEl.textContent = formatTime(temps)
			}
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const largeur = volumeEl.offsetWidth
			const rect1 = volumeEl.getBoundingClientRect()
			const rect2 = niveauEl.getBoundingClientRect()
			let vol = ((rect2.right - rect1.left) / largeur) * 100
			if (event.key === 'ArrowDown') {
				niveauVolume = Math.round(vol) - 10
			} else if (event.key === 'ArrowUp') {
				niveauVolume = Math.round(vol) + 10
			}
			if (niveauVolume > 100) {
				niveauVolume = 100
			} else if (niveauVolume < 0) {
				niveauVolume = 0
			}
			player.setVolume(niveauVolume)
			volumeEl.setAttribute('data-volume', niveauVolume)
			niveauEl.style.width = niveauVolume + '%'
		}
		if (pleinEcran) {
			clearTimeout(masquerControlesAuto)
			afficherControles()
		}
	})

	masqueTransparent.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			lecture()
		}
	})

	boutonLecture.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			lecture()
		}
	})

	boutonVolume.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			definirStatutVolume()
		}
	})

	boutonPleinEcran.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			ouvrirPleinEcran()
		}
	})

	barreRecherche.addEventListener('mousemove', function (event) {
		event.stopPropagation()
		const largeur = barreRecherche.offsetWidth
		const rect = barreRecherche.getBoundingClientRect()
		tooltip.textContent = formatTime(Math.round(((event.pageX - rect.left) / largeur) * duree))
		tooltip.style.display = 'block'
		const position = event.pageX - rect.left
		const largeurTooltip = tooltip.offsetWidth
		if (position + largeurTooltip > largeur) {
			tooltip.style.left = largeur - (largeurTooltip / 2) + 'px'
		} else if (position < 10) {
			tooltip.style.left = '10px'
		} else {
			tooltip.style.left = position + 'px'
		}
	})

	barreRecherche.addEventListener('mouseout', function () {
		tooltip.style.display = 'none'
	})

	barreRecherche.addEventListener('click', function (event) {
		const largeur = barreRecherche.offsetWidth
		const rect = barreRecherche.getBoundingClientRect()
		const secondes = Math.round(((event.pageX - rect.left) / largeur) * duree) + debut
		player.seekTo(secondes, true)
	})

	barreRecherche.addEventListener('keydown', function (event) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			temps = player.getCurrentTime() - debut
			if (event.key === 'ArrowLeft') {
				player.seekTo(temps - 1, true)
				ecouleEl.textContent = formatTime(temps)
			} else if (event.key === 'ArrowRight') {
				player.seekTo(temps + 1, true)
				ecouleEl.textContent = formatTime(temps)
			}
		} else if (event.key === ' ') {
			lecture()
		}
	})

	volumeEl.addEventListener('click', function (event) {
		const largeur = volumeEl.offsetWidth
		const rect = volumeEl.getBoundingClientRect()
		let vol = ((event.pageX - rect.left) / largeur) * 100
		if (vol > 94) {
			vol = 100
		}
		niveauVolume = Math.round(vol)
		player.setVolume(niveauVolume)
		volumeEl.setAttribute('data-volume', niveauVolume)
		niveauEl.style.width = niveauVolume + '%'
	})

	volumeEl.addEventListener('keydown', function (event) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			const largeur = volumeEl.offsetWidth
			const rect1 = volumeEl.getBoundingClientRect()
			const rect2 = niveauEl.getBoundingClientRect()
			let vol = ((rect2.right - rect1.left) / largeur) * 100
			if (event.key === 'ArrowLeft') {
				niveauVolume = Math.round(vol) - 10
			} else if (event.key === 'ArrowRight') {
				niveauVolume = Math.round(vol) + 10
			}
			if (niveauVolume > 100) {
				niveauVolume = 100
			} else if (niveauVolume < 0) {
				niveauVolume = 0
			}
			player.setVolume(niveauVolume)
			volumeEl.setAttribute('data-volume', niveauVolume)
			niveauEl.style.width = niveauVolume + '%'
		}
	})

	boutonVitesse.addEventListener('click', function () {
		if (boutonRatio.classList.contains('visible')) {
			boutonRatio.classList.remove('visible')
		}
		if (boutonSousTitres.classList.contains('visible')) {
			boutonSousTitres.classList.remove('visible')
		}
		if (boutonVitesse.classList.contains('visible')) {
			boutonVitesse.classList.remove('visible')
		} else {
			boutonVitesse.classList.add('visible')
		}
	})

	boutonVitesse.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			if (boutonRatio.classList.contains('visible')) {
				boutonRatio.classList.remove('visible')
			}
			if (boutonSousTitres.classList.contains('visible')) {
				boutonSousTitres.classList.remove('visible')
			}
			if (boutonVitesse.classList.contains('visible')) {
				boutonVitesse.classList.remove('visible')
			} else {
				boutonVitesse.classList.add('visible')
			}
		}
	})
	
	const elementsVitesse = listeVitesses.querySelectorAll('span.vitesse')
	elementsVitesse.forEach(function (elementVitesse) {
		elementVitesse.addEventListener('click', function (event) {
			if (listeVitesses.querySelector('.active')) {
				listeVitesses.querySelector('.active').classList.remove('active')
			}
			const vitesse = parseFloat(event.target.getAttribute('data-vitesse'))
			player.setPlaybackRate(vitesse)
			if (vitesse === 1) {
				boutonVitesse.classList.remove('active')
			} else {
				boutonVitesse.classList.add('active')
			}
			event.target.classList.add('active')
		})

		elementVitesse.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				if (listeVitesses.querySelector('.active')) {
					listeVitesses.querySelector('.active').classList.remove('active')
				}
				const vitesse = parseFloat(event.target.getAttribute('data-vitesse'))
				player.setPlaybackRate(vitesse)
				if (vitesse === 1) {
					boutonVitesse.classList.remove('active')
				} else {
					boutonVitesse.classList.add('active')
				}
				event.target.classList.add('active')
			}
		})
	})

	boutonRatio.addEventListener('click', function () {
		if (boutonVitesse.classList.contains('visible')) {
			boutonVitesse.classList.remove('visible')
		}
		if (boutonSousTitres.classList.contains('visible')) {
			boutonSousTitres.classList.remove('visible')
		}
		if (boutonRatio.classList.contains('visible')) {
			boutonRatio.classList.remove('visible')
		} else {
			boutonRatio.classList.add('visible')
		}
	})

	boutonRatio.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			if (boutonVitesse.classList.contains('visible')) {
				boutonVitesse.classList.remove('visible')
			}
			if (boutonSousTitres.classList.contains('visible')) {
				boutonSousTitres.classList.remove('visible')
			}
			if (boutonRatio.classList.contains('visible')) {
				boutonRatio.classList.remove('visible')
			} else {
				boutonRatio.classList.add('visible')
			}
		}
	})

	const elementsRatio = listeRatio.querySelectorAll('span.ratio')
	elementsRatio.forEach(function (elementRatio) {
		elementRatio.addEventListener('click', function (event) {
			if (listeRatio.querySelector('.active')) {
				listeRatio.querySelector('.active').classList.remove('active')
			}
			document.body.classList.remove(ratio)
			ratio = event.target.getAttribute('data-ratio')
			document.body.classList.add(ratio)
			event.target.classList.add('active')
		})

		elementRatio.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				if (listeRatio.querySelector('.active')) {
					listeRatio.querySelector('.active').classList.remove('active')
				}
				document.body.classList.remove(ratio)
				ratio = event.target.getAttribute('data-ratio')
				document.body.classList.add(ratio)
				event.target.classList.add('active')
			}
		})
	})

	boutonImage.addEventListener('click', function () {
		if (masqueTransparent.classList.contains('noir')) {
			masqueTransparent.classList.remove('noir')
			boutonImage.classList.remove('active')
			boutonImage.title = "Masquer la vidéo (audio uniquement)"
			boutonImage.setAttribute('aria-label', 'Masquer la vidéo (audio uniquement)')
		} else {
			masqueTransparent.classList.add('noir')
			boutonImage.classList.add('active')
			boutonImage.title = "Afficher la vidéo"
			boutonImage.setAttribute('aria-label', 'Afficher la vidéo')
		}
	})

	boutonImage.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			if (masqueTransparent.classList.contains('noir')) {
				masqueTransparent.classList.remove('noir')
				boutonImage.classList.remove('active')
				boutonImage.title = "Masquer la vidéo (audio uniquement)"
				boutonImage.setAttribute('aria-label', 'Masquer la vidéo (audio uniquement)')
			} else {
				masqueTransparent.classList.add('noir')
				boutonImage.classList.add('active')
				boutonImage.title = "Afficher la vidéo"
				boutonImage.setAttribute('aria-label', 'Afficher la vidéo')
			}
		}
	})

    chargement = setInterval(definirTampon, 1000)
    definirVolume(-1)
}

function definirTampon () {
    let fraction = (player.hasOwnProperty('getVideoLoadedFraction') ? player.getVideoLoadedFraction() : 0)
    if (fraction > 0) {
        fraction = parseInt(fraction * 100)
		chargeEl.style.width = fraction + '%'
        if (fraction === 100) {
            clearInterval(chargement)
		}
    }
}

function definirTemps () {
    if (player && player.getCurrentTime && player.getCurrentTime() > 0) {
        temps = player.getCurrentTime() - debut
        if (player.getCurrentTime() >= fin) {
            player.pauseVideo()
			ecouleEl.textContent = formatTime(0)
			clearInterval(mettreAJourTemps)
        } else {
			ecouleEl.textContent = formatTime(temps)
		}
		if ((temps / duree) * 100 <= 100) {
			luEl.style.width = Math.round((temps / duree) * 100) + '%'
		}
    }
}


function lecture () {
    if (statut !== 1) {
		setTimeout(function () {
			masque.style.display = 'none'
		}, 500)
		iconeLancer.style.display = 'none'
		iconeRejouer.style.display = 'none'
		iconePause.style.display = 'inline-block'
		boutonLecture.title = 'Pause'
		boutonLecture.setAttribute('aria-label', 'Pause')
		if (boutonSousTitres.classList.contains('active')) {
            setTimeout(function () {
				videoIframe.style.height = '100%'
				videoIframe.style.top = '0'
            }, 500)
		}
		if (player.getCurrentTime() === 0 || player.getCurrentTime() >= fin) {
			player.seekTo(debut, true)
			player.playVideo()
        } else {
			player.playVideo()
		}
		if (blink === true && videoLancee === false) {
			videoLancee = true
			player.unMute()
		}
    } else {
		videoIframe.style.height = 'calc(100% + 460px)'
		videoIframe.style.top = '-230px'
		iconeLancer.style.display = 'inline-block'
		iconePause.style.display = 'none'
		iconeRejouer.style.display = 'none'
		boutonLecture.title = 'Lecture'
		boutonLecture.setAttribute('aria-label', 'Lecture')
		player.pauseVideo()
    }
}

function statutLecteurModifie (event) {
    statut = event.data
	if (statut === 1) { // lecture
		mettreAJourTemps = setInterval(definirTemps, 100)
		masque.style.display = 'none'
        iconeLancer.style.display = 'none'
		iconeRejouer.style.display = 'none'
		iconePause.style.display = 'inline-block'
		boutonLecture.title = 'Pause'
		boutonLecture.setAttribute('aria-label', 'Pause')
		masqueTransparent.classList.remove('sans-vignette')
	} else if (statut === 0) { // finie
		ecouleEl.textContent = dureeEl.textContent
        masque.style.display = 'block'
		if (vignette !== '') {
			masque.classList.add('vignette')
		} else {
			masqueTransparent.classList.add('sans-vignette')
		}
		iconeRejouer.style.display = 'inline-block'
		iconeLancer.style.display = 'none'
		iconePause.style.display = 'none'
		masqueLecture.style.display = 'none'
		masqueRelecture.style.display = 'block'
		boutonLecture.title = 'Relancer'
		boutonLecture.setAttribute('aria-label', 'Relancer')
	} else if (statut === 2) { // en pause
		masqueLecture.style.display = 'block'
		masqueRelecture.style.display = 'none'
		masque.style.display = 'block'
		if (vignette !== '') {
			masque.classList.remove('vignette')
		} else {
			masqueTransparent.classList.remove('sans-vignette')
		}
    } else {
        clearInterval(mettreAJourTemps)
    }

    if (statut !== 1) {
        document.body.style.cursor = ''
		controlesEl.style.bottom = '0'
		const boutonsControles = document.querySelectorAll('#controles [tabindex="-1"]')
		boutonsControles.forEach(function (bouton) {
			bouton.setAttribute('tabindex', '0')
		})
    }
	if (statut === 1 && blink === true && videoLancee === false) {
		videoLancee = true
		player.unMute()
	}
}

function definirVolume (vol) {
	if (vol !== -1) {
		volumeEl.setAttribute('data-volume', vol)
		niveauEl.style.width = vol + '%'
    	player.setVolume(vol)
	} else {
		niveauVolume = volumeEl.getAttribute('data-volume')
		player.setVolume(niveauVolume)
		if (niveauVolume === 0) {
			boutonVolume.setAttribute('data-statut', 'off')
			boutonVolume.title = 'Réactiver le son'
			boutonVolume.setAttribute('aria-label', 'Réactiver le son')
			iconeMuet.style.display = 'inline-block'
			iconeVolume.style.display = 'none'
		} else {
			boutonVolume.setAttribute('data-statut', 'on')
			boutonVolume.title = 'Désactiver le son'
			boutonVolume.setAttribute('aria-label', 'Désactiver le son')
			iconeMuet.style.display = 'none'
			iconeVolume.style.display = 'inline-block'
		}
	}
}

function definirStatutVolume () {
    if (boutonVolume.getAttribute('data-statut') === 'on') {
        definirVolume(0)
		boutonVolume.setAttribute('data-statut', 'off')
		boutonVolume.title = 'Réactiver le son'
		boutonVolume.setAttribute('aria-label', 'Réactiver le son')
        iconeMuet.style.display = 'inline-block'
		iconeVolume.style.display = 'none'
    } else {
        definirVolume(niveauVolume)
        boutonVolume.setAttribute('data-statut', 'on')
		boutonVolume.title = 'Désactiver le son'
		boutonVolume.setAttribute('aria-label', 'Désactiver le son')
		iconeMuet.style.display = 'none'
		iconeVolume.style.display = 'inline-block'
    }
}

masqueTransparent.addEventListener('mousemove', function () {
	afficherControles()
	if (pleinEcran) {
		clearTimeout(masquerControlesAuto)
		masquerControlesAuto = setTimeout(function () {
			masquerControles()
		}, 2000)
	}
}, false)
masqueTransparent.addEventListener('focus', afficherControles, false)

controlesEl.addEventListener('mouseover', function () {
	if (pleinEcran) {
		clearTimeout(masquerControlesAuto)
		afficherControles()
	}
})

controlesEl.addEventListener('mouseout', function () {
	if (pleinEcran) {
		clearTimeout(masquerControlesAuto)
		masquerControlesAuto = setTimeout(function () {
			masquerControles()
		}, 2000)
	}
})

function afficherControles () {
	setTimeout(function () {
		document.body.style.cursor = ''
		controlesEl.style.bottom = '0'
		const boutonsControles = document.querySelectorAll('#controles [tabindex="-1"]')
		boutonsControles.forEach(function (bouton) {
			bouton.setAttribute('tabindex', '0')
		})
	}, 10)
}

function masquerControles () {
	document.body.style.cursor = 'none'
	controlesEl.style.bottom = '-100px'
	const boutonsControles = document.querySelectorAll('#controles [tabindex="0"]')
	boutonsControles.forEach(function (bouton) {
		bouton.setAttribute('tabindex', '-1')
	})
	if (boutonVitesse.classList.contains('visible')) {
		boutonVitesse.classList.remove('visible')
	}
	if (boutonRatio.classList.contains('visible')) {
		boutonRatio.classList.remove('visible')
	}
	if (boutonSousTitres.classList.contains('visible')) {
		boutonSousTitres.classList.remove('visible')
	}
	clearTimeout(masquerControlesAuto)
}

function ouvrirPleinEcran () {
    if (pleinEcran) {
        fermerPleinEcran()
        return false
    }
    if (conteneurVideo.requestFullscreen) {
        conteneurVideo.requestFullscreen()
		conteneurVideo.classList.add('plein-ecran')
	} else if (conteneurVideo.mozRequestFullScreen) {
        conteneurVideo.mozRequestFullScreen()
		conteneurVideo.classList.add('plein-ecran')
	} else if (conteneurVideo.webkitRequestFullscreen) {
        conteneurVideo.webkitRequestFullscreen()
		conteneurVideo.classList.add('plein-ecran')
	} else if (conteneurVideo.msRequestFullscreen) {
        conteneurVideo.msRequestFullscreen()
		conteneurVideo.classList.add('plein-ecran')
    } else {
        conteneurVideo.classList.add('plein-ecran-ios')
	}
    pleinEcran = true
	iconePleinEcran.style.display = 'none'
	iconeSortirPleinEcran.style.display = 'inline-block'
	boutonPleinEcran.title = 'Sortir du plein écran'
	boutonPleinEcran.setAttribute('aria-label', 'Sortir du plein écran')
	masquerControlesAuto = setTimeout(function () {
		masquerControles()
	}, 2000)
}

function fermerPleinEcran () {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
        conteneurVideo.classList.remove('plein-ecran')
    } else {
        conteneurVideo.classList.remove('plein-ecran-ios')
	}
    pleinEcran = false
	iconePleinEcran.style.display = 'inline-block'
	iconeSortirPleinEcran.style.display = 'none'
	boutonPleinEcran.title = 'Mettre en plein écran'
	boutonPleinEcran.setAttribute('aria-label', 'Mettre en plein écran')
}

document.addEventListener('webkitfullscreenchange', gererSortiePleinEcran, false)
document.addEventListener('mozfullscreenchange', gererSortiePleinEcran, false)
document.addEventListener('fullscreenchange', gererSortiePleinEcran, false)
document.addEventListener('MSFullscreenChange', gererSortiePleinEcran, false)

function gererSortiePleinEcran () {
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        conteneurVideo.classList.remove('plein-ecran-ios')
		pleinEcran = false
		iconePleinEcran.style.display = 'inline-block'
		iconeSortirPleinEcran.style.display = 'none'
    }
}

Date.prototype.addMilliseconds = function (value) {
    this.setMilliseconds(this.getMilliseconds() + value)
    return this
}

Date.prototype.addSeconds = function (value) {
    return this.addMilliseconds(value * 1000)
}

Date.prototype.toString = function (format) {
    const self = this
    const p = function p (s) {
        return (s.toString().length == 1) ? '0' + s : s
    }
    return format ? format.replace(/HH?|mm?|ss?/g, function (format) {
        switch (format) {
            case 'H':
                return self.getHours()
            case 'mm':
                return p(self.getMinutes())
            case 'ss':
                return p(self.getSeconds())

        }
    }) : this._toString()
}

Date.prototype.clearTime = function () {
    this.setHours(0)
    this.setMinutes(0)
    this.setSeconds(0)
    this.setMilliseconds(0)
    return this
}

Date.prototype._toString = Date.prototype.toString

function formatTime (t) {
    t = new Date().clearTime().addSeconds(t).toString('H:mm:ss')
    if (t.substring(0, 2) == '0:')
        t = t.substring(2, t.length)
    return t
}
