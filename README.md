# PokéFlex - Exercice CSS Flexbox

Un exercice pour appliquer les connaissances CSS Flexbox en stylisant une application de cartes Pokémon.

## Objectif

Utiliser **CSS Flexbox** pour mettre en page l'application. Tu dois uniquement modifier le fichier `style.css`.

## Règles

- ✅ Tu peux modifier : `style.css`
- ❌ Ne touche pas : `app.js` et `index.html` (pas trop)

## Démarrer l'exercice

1. Ouvre `index.html` dans ton navigateur
2. Tu verras une page fonctionnelle mais sans mise en page
3. Ouvre `style.css` dans ton éditeur de code
4. Ajoute tes règles CSS pour styliser l'application

## Classes à cibler

Les classes avec `-flex` dans leur nom sont des conteneurs qui devraient utiliser `display: flex` :

| Classe               | Description                               |
| -------------------- | ----------------------------------------- |
| `.header-flex`       | En-tête de la page                        |
| `.main-flex`         | Conteneur principal                       |
| `.search-flex`       | Section de recherche                      |
| `.search-form-flex`  | Formulaire de recherche                   |
| `.search-input-flex` | Groupe input + bouton                     |
| `.cards-flex`        | Conteneur des cartes Pokémon              |
| `.card-flex`         | Une carte Pokémon                         |
| `.card-image-flex`   | Conteneur de l'image                      |
| `.card-info-flex`    | Infos principales (nom, id, génération)   |
| `.card-types-flex`   | Conteneur des badges de type              |
| `.card-stats-flex`   | Conteneur des statistiques                |
| `.stat-row-flex`     | Une ligne de statistique (label + valeur) |

## Fonctionnalités de l'application

- Recherche de Pokémon par nom (ex: Pikachu, Salamèche, Gruikui)
- Affiche les informations : image, nom, numéro, génération, types, statistiques
- Les cartes s'accumulent à chaque recherche
- Les données sont mises en cache pour éviter les requêtes répétées

## Configuration

Dans `app.js`, tu peux changer le Pokémon affiché par défaut :

```js
const DEFAULT_POKEMON = "Gruikui";
```

Change le nom ou mets `null` pour ne rien afficher au démarrage.

## API utilisée

[PokeBuild API](https://pokebuildapi.fr/) - API Pokémon en français.
