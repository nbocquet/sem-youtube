# sem-youtube

Application de bureau (Electron) pour regarder rapidement une vidéo YouTube **sans distraction** : pas de vidéos suggérées, pas de commentaires, pas d'interface YouTube — juste un lecteur minimal avec ses propres contrôles (lecture, volume, vitesse, ratio, sous-titres, plein écran).

Collez un lien YouTube, la vidéo se lance. Aucun compte, aucun backend distant, aucune configuration de serveur.

## Ce projet est un fork/dérivé de Digiview

Ce projet **n'est pas affilié à La Digitale**. Il réutilise et adapte le lecteur vidéo du projet [Digiview](https://codeberg.org/ladigitale/digiview), développé par Emmanuel ZIMMERT pour [La Digitale](https://ladigitale.dev) et distribué sous licence **GNU AGPLv3**.

Digiview est à l'origine un service en ligne complet (SPA Vue + backend PHP) qui permet, entre autres, de créer et partager des liens de vidéos découpées. **sem-youtube** n'en reprend qu'une partie : le lecteur vidéo autonome de Digiview (`inc/video.php` + `inc/video.css` + `inc/video.js`), qui ne dépendait déjà d'aucun appel serveur pour fonctionner. Ce lecteur a été adapté ici pour :

- lire ses paramètres (`videoId`, temps de départ, etc.) directement depuis l'URL en JavaScript, à la place du `$_GET` PHP,
- se passer entièrement de la partie "création de lien partageable" de Digiview (SPA Vue, `inc/api.php`, `inc/generer_video.php`, SQLite), non nécessaire ici,
- désactiver un contournement spécifique à Chrome présent dans `inc/video.js` (routage forcé du clic vers l'iframe YouTube brute) : inutile et contre-productif dans une appli Electron, où il empêchait le gros bouton de lecture central de fonctionner.

Deux petits fichiers propres à ce projet complètent le lecteur :
- `main.js` / `preload.js` : la coquille Electron (fenêtre, presse-papiers, ouverture des liens externes).
- `server.js` : un micro-serveur HTTP interne, voir ci-dessous.

### Pourquoi un petit serveur local (`server.js`) alors qu'il ne devait pas y en avoir ?

En chargeant les pages directement en `file://` (l'approche initiale), l'API YouTube IFrame charge bien la vidéo et s'initialise (`onReady` se déclenche), mais **les commandes envoyées à l'iframe (lecture, pause...) n'aboutissent jamais** : le canal `postMessage` que l'API utilise en interne n'accepte pas une page parente d'origine `file://`. Résultat : le lecteur semblait chargé mais ne démarrait jamais, quel que soit le clic.

La seule solution fiable est de servir la page via `http://`. `server.js` démarre donc, au lancement de l'appli, un serveur HTTP minimal (module `http` natif de Node, aucune dépendance) sur `127.0.0.1` avec un port aléatoire, qui sert uniquement les fichiers du dossier `renderer/`. Il n'écoute que sur la boucle locale, ne nécessite aucune configuration, et reste invisible pour l'utilisateur — ce n'est pas un "backend" au sens où l'entendait la demande initiale (pas de PHP, pas de base de données, pas de compte, rien à installer ni démarrer soi-même).

Fichiers vendorés/adaptés depuis Digiview : `renderer/player.css` (copie conforme), `renderer/player.js` (copie adaptée, voir ci-dessous), `renderer/player.html` (adapté depuis `inc/video.php`).

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

### Paquet `.deb`

`electron-builder` délègue la génération du `.deb` à `fpm`, qui assemble l'archive finale avec `ar`. Sur macOS, l'`ar` système corrompt silencieusement cette archive (elle contient des membres non Mach-O, ce que le `ranlib` intégré à l'`ar` de macOS ne gère pas correctement) — le `.deb` produit fait alors 96 octets et ne s'installe pas. `npm run dist` ne construit donc pas de `.deb` sur macOS.

Un script maison contourne le problème en reconstruisant le paquet à la main (format `ar` GNU minimal) à partir du dossier `dist/linux-arm64-unpacked` déjà généré :

```bash
npm run dist        # build d'abord la cible linux (AppImage), qui prépare le dossier unpacked
npm run dist:deb     # reconstruit un .deb valide à partir de ce dossier
```

Si vous buildez directement sur une machine Linux, `npm run dist` avec la cible `deb` ajoutée dans `package.json` (`"linux": { "target": ["AppImage", "deb"] }`) fonctionnera nativement sans ce contournement.

## Licence

AGPLv3, comme Digiview. Voir [LICENSE](./LICENSE).
