#!/usr/bin/env node
// electron-builder délègue la génération du .deb à `fpm`, qui construit l'archive
// finale avec `ar`. Sur macOS, l'`ar` système (BSD, avec ranlib intégré) corrompt
// silencieusement cette archive dès qu'elle contient des membres non Mach-O
// (résultat : un .deb de 96 octets). On reconstruit donc le paquet à la main à
// partir du dossier déjà produit par `electron-builder --linux AppImage`, avec
// une implémentation minimale du format `ar` GNU (celui qu'attend dpkg).
//
// Prérequis : avoir lancé `npm run dist` (ou `electron-builder --linux`) au
// préalable, pour que dist/linux-arm64-unpacked existe.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const racine = path.resolve(import.meta.dirname, '..')
const pkg = JSON.parse(fs.readFileSync(path.join(racine, 'package.json'), 'utf-8'))
const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
const unpackedDir = path.join(racine, 'dist', `linux-${arch}-unpacked`)

if (!fs.existsSync(unpackedDir)) {
	console.error(`Introuvable : ${unpackedDir}. Lance d'abord "npm run dist" (cible linux AppImage).`)
	process.exit(1)
}

const nomPaquet = pkg.name
const version = pkg.version
const maintainer = `${pkg.author.name} <${pkg.author.email}>`
const iconesDir = path.join(racine, 'node_modules', 'app-builder-lib', 'templates', 'icons', 'electron-linux')
const tailles = ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256']

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sem-youtube-deb-'))
const pkgRoot = path.join(workDir, 'pkg')

fs.mkdirSync(path.join(pkgRoot, 'opt', nomPaquet), { recursive: true })
fs.mkdirSync(path.join(pkgRoot, 'usr', 'bin'), { recursive: true })
fs.mkdirSync(path.join(pkgRoot, 'usr', 'share', 'applications'), { recursive: true })

execFileSync('cp', ['-R', unpackedDir + '/.', path.join(pkgRoot, 'opt', nomPaquet)])
fs.symlinkSync(`../../opt/${nomPaquet}/${nomPaquet}`, path.join(pkgRoot, 'usr', 'bin', nomPaquet))

for (const taille of tailles) {
	const dest = path.join(pkgRoot, 'usr', 'share', 'icons', 'hicolor', taille, 'apps')
	fs.mkdirSync(dest, { recursive: true })
	fs.copyFileSync(path.join(iconesDir, `${taille}.png`), path.join(dest, `${nomPaquet}.png`))
}

fs.writeFileSync(
	path.join(pkgRoot, 'usr', 'share', 'applications', `${nomPaquet}.desktop`),
	`[Desktop Entry]
Name=${nomPaquet}
Comment=${pkg.description}
Exec=/opt/${nomPaquet}/${nomPaquet} %U
Terminal=false
Type=Application
Icon=${nomPaquet}
StartupWMClass=${nomPaquet}
Categories=AudioVideo;
`
)

const tailleInstalleeKo = parseInt(execFileSync('du', ['-sk', pkgRoot]).toString().split('\t')[0], 10)

const controleDir = path.join(workDir, 'control-root')
fs.mkdirSync(controleDir, { recursive: true })
fs.writeFileSync(
	path.join(controleDir, 'control'),
	`Package: ${nomPaquet}
Version: ${version}
Section: video
Priority: optional
Architecture: ${arch === 'arm64' ? 'arm64' : 'amd64'}
Maintainer: ${maintainer}
Installed-Size: ${tailleInstalleeKo}
Homepage: ${pkg.homepage}
Description: ${pkg.description}
`
)

const debianBinary = path.join(workDir, 'debian-binary')
fs.writeFileSync(debianBinary, '2.0\n')

const controlTarGz = path.join(workDir, 'control.tar.gz')
execFileSync('tar', ['--numeric-owner', '--owner=0', '--group=0', '-czf', controlTarGz, './control'], { cwd: controleDir })

const dataTarXz = path.join(workDir, 'data.tar.xz')
execFileSync('tar', ['--numeric-owner', '--owner=0', '--group=0', '-cJf', dataTarXz, '.'], { cwd: pkgRoot })

// Format `ar` GNU minimal : "!<arch>\n" puis, par membre, un header fixe de 60
// octets (nom/13 champs texte alignés) suivi des données, paddées à une taille paire.
function pad (valeur, longueur) {
	const s = String(valeur)
	if (s.length > longueur) throw new Error(`champ trop long: ${s}`)
	return s + ' '.repeat(longueur - s.length)
}

function enteteMembre (nom, taille) {
	const champs = pad(nom + '/', 16) + pad('0', 12) + pad('0', 6) + pad('0', 6) + pad('100644', 8) + pad(taille, 10) + '`\n'
	return Buffer.from(champs, 'ascii')
}

const membres = [debianBinary, controlTarGz, dataTarXz]
const morceaux = [Buffer.from('!<arch>\n', 'ascii')]
for (const membre of membres) {
	const donnees = fs.readFileSync(membre)
	morceaux.push(enteteMembre(path.basename(membre), donnees.length))
	morceaux.push(donnees)
	if (donnees.length % 2 === 1) {
		morceaux.push(Buffer.from('\n', 'ascii'))
	}
}

const sortie = path.join(racine, 'dist', `${nomPaquet}_${version}_${arch}.deb`)
fs.writeFileSync(sortie, Buffer.concat(morceaux))
fs.rmSync(workDir, { recursive: true, force: true })

console.log(`.deb généré : ${sortie} (${(fs.statSync(sortie).size / 1024 / 1024).toFixed(1)} Mo)`)
