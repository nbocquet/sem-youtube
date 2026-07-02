# sem-youtube

Application de bureau (Electron) pour regarder rapidement une vidéo YouTube **sans distraction** : pas de vidéos suggérées, pas de commentaires, pas d'interface YouTube — juste un lecteur minimal avec ses propres contrôles (lecture, volume, vitesse, ratio, sous-titres, plein écran).

Collez un lien YouTube, la vidéo se lance. Aucun compte, aucun backend, aucun serveur local requis.

## Ce projet est un fork/dérivé de Digiview

Ce projet **n'est pas affilié à La Digitale**. Il réutilise et adapte le lecteur vidéo du projet [Digiview](https://codeberg.org/ladigitale/digiview), développé par Emmanuel ZIMMERT pour [La Digitale](https://ladigitale.dev) et distribué sous licence **GNU AGPLv3**.

Digiview est à l'origine un service en ligne complet (SPA Vue + backend PHP) qui permet, entre autres, de créer et partager des liens de vidéos découpées. **sem-youtube** n'en reprend qu'une partie : le lecteur vidéo autonome de Digiview (`inc/video.php` + `inc/video.css` + `inc/video.js`), qui ne dépendait déjà d'aucun appel serveur pour fonctionner. Ce lecteur a été adapté ici pour :

- lire ses paramètres (`videoId`, temps de départ, etc.) directement depuis l'URL en JavaScript, à la place du `$_GET` PHP,
- tourner en local dans une fenêtre Electron via `file://`, sans serveur PHP ni base de données,
- se passer entièrement de la partie "création de lien partageable" de Digiview (SPA Vue, `inc/api.php`, `inc/generer_video.php`, SQLite), non nécessaire ici.

La page d'accueil (champ pour coller un lien) et la coquille Electron (`main.js`, `preload.js`) sont propres à ce projet.

Fichiers vendorés/adaptés depuis Digiview : `renderer/player.css`, `renderer/player.js` (copies conformes), `renderer/player.html` (adapté depuis `inc/video.php`).

## Fonctionnement

1. Vous collez un lien YouTube (`youtube.com/watch?v=...`, `youtu.be/...`, `shorts/...`, avec ou sans `?t=`).
2. L'app en extrait l'identifiant de vidéo et ouvre le lecteur, qui charge la vidéo via `youtube-nocookie.com` (`rel=0`, pas d'UI YouTube).
3. Aucune requête n'est faite vers un serveur tiers autre que YouTube — pas de tracking, pas de backend.

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm start
```

## Construire les paquets (macOS + Linux)

```bash
npm run dist
```

Génère dans `dist/` :
- macOS : `.dmg` et `.zip` (arm64)
- Linux : `.AppImage`

Le support Windows n'est pas encore configuré.

## Licence

AGPLv3, comme Digiview. Voir [LICENSE](./LICENSE).
