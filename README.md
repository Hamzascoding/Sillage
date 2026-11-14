# Sillage — Plateforme de stages et de PFE

> Trouver le bon stage, grâce à ceux qui y sont passés.

Sillage est une application web destinée à faciliter la recherche de
stages et de projets de fin d'études (PFE). Elle met en relation les
étudiants et les entreprises à travers un catalogue d'offres, un espace
de candidature et des pages de présentation des entreprises.

Le projet est réalisé dans le cadre du module **Projet Web — Objectif
3**.

## Sommaire

1. [Choix des technologies](#1-choix-des-technologies)
2. [Fonctionnalités développées](#2-fonctionnalités-développées)
3. [Pages principales](#3-pages-principales)
4. [Architecture du projet](#4-architecture-du-projet)
5. [Prérequis et dépendances](#5-prérequis-et-dépendances)
6. [Installation et lancement](#6-installation-et-lancement)
7. [Comptes de démonstration](#7-comptes-de-démonstration)
8. [Tests backend](#8-tests-backend)
9. [Dépannage](#9-dépannage)
10. [Limites actuelles et évolutions possibles](#10-limites-actuelles-et-évolutions-possibles)

## 1. Choix des technologies

### Frontend

-   **Angular 19** : framework frontend structuré, basé sur TypeScript
    et adapté aux applications à plusieurs pages et à plusieurs rôles.
-   **TypeScript** : typage des données et meilleure maintenabilité du
    code.
-   **Angular Router** : navigation entre les pages et protection de
    certaines routes selon le rôle de l'utilisateur.
-   **Reactive Forms** : formulaires de connexion et de saisie.
-   **Tailwind CSS** : mise en forme responsive et centralisation des
    couleurs et styles de l'identité visuelle.

### Backend

-   **Node.js et Express** : création d'une API REST légère.
-   **JWT** : authentification et contrôle d'accès aux routes protégées.
-   **bcryptjs** : hachage des mots de passe.
-   **Stockage JSON** : persistance locale des données de démonstration
    dans `backend/data/db.json`, sans installation d'un serveur de base
    de données.

Le stockage JSON et certaines fonctionnalités conservées dans le
`localStorage` du navigateur constituent une solution de démonstration.
Ils ne remplacent pas une base de données et un stockage de fichiers
adaptés à une mise en production.

## 2. Fonctionnalités développées

L'application comprend plusieurs pages dynamiques et des espaces adaptés
aux différents rôles.

### Visiteur et étudiant

-   Page d'accueil avec accès au catalogue des offres.
-   Consultation et filtrage des offres de stage et de PFE.
-   Consultation de la fiche détaillée d'une offre.
-   Annuaire des entreprises et consultation de leurs fiches.
-   Connexion avec redirection vers la page demandée.
-   Enregistrement d'offres dans les favoris.
-   Consultation et suivi des candidatures envoyées.
-   Gestion du profil étudiant : informations personnelles et
    académiques, compétences et langues.
-   Ajout, téléchargement et suppression d'un CV au format PDF (dans la
    limite prévue par l'interface).

### Entreprise

-   Espace entreprise avec consultation de ses offres.
-   Formulaire de création d'une offre.
-   Affichage des offres créées dans le catalogue et mise à jour du
    nombre d'offres affiché sur la page des entreprises.

**Limite de démonstration :** les offres créées depuis le formulaire
entreprise sont actuellement conservées dans le `localStorage` du
navigateur. Elles sont donc visibles dans le même navigateur/profil
utilisateur, mais ne sont pas partagées entre différents appareils ou
navigateurs et ne sont pas enregistrées dans l'API.

### Sécurité et navigation

-   Navigation et affichage adaptés au rôle connecté.
-   Protection des pages réservées aux utilisateurs authentifiés ou à un
    rôle précis.
-   Gestion des états de chargement, d'erreur et de listes vides.
-   Interface responsive adaptée aux écrans de différentes tailles.

### Fonctionnalités utilisant le stockage local du navigateur

Les favoris, les informations du profil étudiant et le CV sont conservés
dans le `localStorage`. Cette solution facilite la démonstration
frontend, mais ces informations restent propres au navigateur utilisé.

## 3. Pages principales

| Page                    | Route                                 | Description                                         |
| ----------------------- | ------------------------------------- | --------------------------------------------------- |
| Accueil                 | `/`                                   | Présentation de la plateforme et accès aux offres   |
| Offres                  | `/offres`                             | Catalogue, filtres et pagination                    |
| Détail d'une offre      | `/offres/:id`                         | Informations et actions liées à une offre           |
| Entreprises             | `/entreprises`                        | Annuaire des entreprises et nombre d'offres         |
| Détail d'une entreprise | `/entreprises/:id`                    | Présentation, offres et avis                        |
| Connexion               | `/connexion`                          | Authentification                                    |
| Mes candidatures        | `/suivi`                              | Suivi des candidatures de l'étudiant                |
| Mes favoris             | `/favoris`                            | Liste des offres enregistrées                       |
| Mon profil              | `/profil`                             | Gestion des informations et du CV                   |
| Espace entreprise       | `/espace-entreprise`                  | Tableau de bord de l'entreprise                     |
| Créer une offre         | `/espace-entreprise/nouvelle-offre`   | Formulaire de création d'offre                      |

Certaines pages nécessitent une connexion et/ou un rôle particulier.

## 4. Architecture du projet

``` text
sillage/
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── core/       # API, authentification, modèles, guards
│   │       ├── pages/      # Pages de l'application
│   │       └── shared/     # En-tête, pied de page et composants réutilisables
│   ├── angular.json
│   ├── package.json
│   ├── proxy.conf.json     # Proxy de développement (/api → backend)
│   └── tailwind.config.js
│
├── backend/
│   ├── data/               # Base JSON locale générée/utilisée à l'exécution
│   ├── src/
│   │   ├── controllers/    # Contrôleurs de l'API
│   │   ├── middleware/     # Authentification et autorisations
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Routes REST
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── seed.js         # Données initiales de démonstration
│   │   └── server.js
│   ├── test/
│   └── package.json
│
└── README.md
```

## 5. Prérequis et dépendances

### Prérequis système

| Outil       | Version minimale | Rôle                                         | Vérification |
| ----------- | ---------------- | -------------------------------------------- | ------------ |
| **Node.js** | 20 ou supérieur  | Exécution du backend et des outils Angular   | `node -v`    |
| **npm**     | Fourni avec Node | Installation des dépendances et des scripts  | `npm -v`     |
| Navigateur  | Version récente  | Utilisation de l'application                 | —            |

Optionnel : l'**Angular CLI** peut être installé globalement pour
utiliser directement la commande `ng`. Ce n'est pas obligatoire, car les
scripts npm du projet utilisent la version installée localement.

``` bash
npm install -g @angular/cli
```

### Dépendances du projet

Les dépendances sont déclarées dans les fichiers `package.json` de
chaque dossier et s'installent automatiquement avec `npm install`. Les
versions exactes se trouvent dans ces fichiers.

**Frontend** (`frontend/package.json`)

| Dépendance           | Utilité                                              |
| -------------------- | ---------------------------------------------------- |
| Angular 19           | Framework de l'application (composants, DI, HTTP)    |
| Angular Router       | Navigation et guards de routes                       |
| Angular Forms        | Reactive Forms (connexion, saisie)                   |
| RxJS                 | Gestion des flux asynchrones (requêtes HTTP)         |
| TypeScript           | Typage et compilation                                |
| Tailwind CSS         | Styles utilitaires et identité visuelle              |
| Angular CLI          | Serveur de développement et compilation (`ng`)       |

**Backend** (`backend/package.json`)

| Dépendance     | Utilité                                                |
| -------------- | ------------------------------------------------------ |
| Express        | Serveur et routes de l'API REST                        |
| jsonwebtoken   | Création et vérification des jetons JWT                |
| bcryptjs       | Hachage des mots de passe                              |

## 6. Installation et lancement

Le frontend et le backend doivent être lancés séparément, dans deux
terminaux. **Démarrer le backend en premier**, car le frontend en a
besoin pour récupérer les données.

### Récapitulatif rapide

| Terminal   | Commandes                                          | Adresse                       |
| ---------- | -------------------------------------------------- | ----------------------------- |
| Terminal 1 | `cd backend` → `npm install` → `npm start`         | http://localhost:3000/api     |
| Terminal 2 | `cd frontend` → `npm install` → `npm start`        | http://localhost:4200         |

`npm install` n'est nécessaire qu'à la première utilisation (ou après
une modification des dépendances).

### Étape 1 — Lancer le backend (serveur API)

Depuis le dossier racine du projet :

``` bash
cd backend
npm install
npm start
```

L'API est alors disponible à l'adresse :

``` text
http://localhost:3000/api
```

Pour vérifier que le serveur fonctionne, ouvrir :

``` text
http://localhost:3000/api/health
```

En développement, le serveur peut être lancé avec :

``` bash
npm run dev
```

Pour arrêter le serveur, utiliser `Ctrl + C` dans le terminal.

### Étape 2 — Lancer le frontend

Ouvrir un deuxième terminal, depuis le dossier racine :

``` bash
cd frontend
npm install
npm start
```

L'application Angular est accessible à l'adresse :

``` text
http://localhost:4200
```

Le frontend utilise le proxy de développement configuré dans
`frontend/proxy.conf.json` pour transmettre les requêtes `/api` au
backend local.

### Scripts disponibles

| Dossier     | Commande         | Description                                         |
| ----------- | ---------------- | --------------------------------------------------- |
| `backend`   | `npm start`      | Lance le serveur API                                |
| `backend`   | `npm run dev`    | Lance le serveur API en mode développement          |
| `backend`   | `npm test`       | Exécute les tests automatisés du backend            |
| `frontend`  | `npm start`      | Lance le serveur de développement Angular           |
| `frontend`  | `npm run build`  | Compile l'application pour la production            |

### Réinitialiser les données de démonstration

Le fichier `backend/data/db.json` contient les données persistées
localement. S'il est supprimé, le backend peut le recréer à partir des
données initiales prévues par le projet au prochain démarrage.

**Attention :** cette opération réinitialise les données enregistrées
dans cette base. Les données stockées dans le `localStorage` du
navigateur (favoris, profil, offres de démonstration créées côté
entreprise) sont indépendantes et doivent être effacées séparément si
une remise à zéro complète est souhaitée.

## 7. Comptes de démonstration

Les comptes ci-dessous sont les comptes de démonstration configurés pour
le projet :

| Rôle           | Adresse e-mail         | Mot de passe     |
| -------------- | ---------------------- | ---------------- |
| Étudiant       | `aziz@demo.tn`         | `demo1234`       |
| Administrateur | `admin@demo.tn`        | `admin1234`      |
| Entreprise     | `entreprise@demo.tn`   | `entreprise1234` |

Si les identifiants ne fonctionnent pas après une modification ou une
réinitialisation de la base, vérifier les comptes définis dans
`backend/src/seed.js`.

## 8. Tests backend

Pour lancer les tests automatisés du backend :

``` bash
cd backend
npm test
```

## 9. Dépannage

| Problème                                              | Solution                                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `node` ou `npm` n'est pas reconnu                     | Installer Node.js 20+ depuis nodejs.org, puis rouvrir le terminal.                                              |
| Erreur pendant `npm install`                          | Vérifier la version de Node (`node -v`). En dernier recours, supprimer `node_modules` et relancer `npm install`. |
| Le port 3000 ou 4200 est déjà utilisé                 | Fermer l'autre programme qui utilise ce port, ou arrêter l'ancienne instance avec `Ctrl + C`.                    |
| Le frontend s'affiche mais les données sont vides     | Vérifier que le backend est démarré (`http://localhost:3000/api/health`) et que `proxy.conf.json` est présent.   |
| Connexion impossible avec les comptes de démonstration | Vérifier `backend/src/seed.js` ou réinitialiser `backend/data/db.json`.                                         |
| Les favoris, le profil ou le CV ont disparu           | Ces données sont dans le `localStorage` : elles sont liées au navigateur et au profil utilisés.                  |

## 10. Limites actuelles et évolutions possibles

-   Les données principales du backend sont stockées dans un fichier
    JSON ; une migration vers PostgreSQL pourra être réalisée
    ultérieurement.
-   La création des offres depuis l'espace entreprise est actuellement
    une simulation frontend reposant sur `localStorage`, et non une
    création persistée via l'API.
-   Les favoris et le profil étudiant sont également conservés
    localement dans le navigateur.
-   Le CV est stocké localement sous forme de données navigateur ; il
    n'est pas encore envoyé vers un service de stockage de fichiers.
-   Les données enregistrées localement ne sont pas synchronisées entre
    plusieurs navigateurs ou appareils.

Ces choix permettent de présenter et tester les principaux parcours de
l'application tout en gardant une architecture pouvant évoluer vers une
persistance centralisée.

------------------------------------------------------------------------

Projet Sillage — Projet Web, Objectif 3.