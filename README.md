# Sillage --- Plateforme de stages et de PFE

> Trouver le bon stage, grâce à ceux qui y sont passés.

Sillage est une application web destinée à faciliter la recherche de
stages et de projets de fin d'études (PFE). Elle met en relation les
étudiants et les entreprises à travers un catalogue d'offres, un espace
de candidature et des pages de présentation des entreprises.

Le projet est réalisé dans le cadre du module **Projet Web --- Objectif
3**.

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

  -------------------------------------------------------------------------------------
  Page                    Route                                 Description
  ----------------------- ------------------------------------- -----------------------
  Accueil                 `/`                                   Présentation de la
                                                                plateforme et accès aux
                                                                offres

  Offres                  `/offres`                             Catalogue, filtres et
                                                                pagination

  Détail d'une offre      `/offres/:id`                         Informations et actions
                                                                liées à une offre

  Entreprises             `/entreprises`                        Annuaire des
                                                                entreprises et nombre
                                                                d'offres

  Détail d'une entreprise `/entreprises/:id`                    Présentation, offres et
                                                                avis

  Connexion               `/connexion`                          Authentification

  Mes candidatures        `/suivi`                              Suivi des candidatures
                                                                de l'étudiant

  Mes favoris             `/favoris`                            Liste des offres
                                                                enregistrées

  Mon profil              `/profil`                             Gestion des
                                                                informations et du CV

  Espace entreprise       `/espace-entreprise`                  Tableau de bord de
                                                                l'entreprise

  Créer une offre         `/espace-entreprise/nouvelle-offre`   Formulaire de création
                                                                d'offre
  -------------------------------------------------------------------------------------

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

## 5. Prérequis

-   **Node.js 20 ou supérieur**
-   **npm**
-   Un navigateur web récent

Vérifier les installations :

``` bash
node -v
npm -v
```

## 6. Installation et lancement

Le frontend et le backend doivent être lancés séparément, dans deux
terminaux.

### Étape 1 --- Lancer le backend

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

### Étape 2 --- Lancer le frontend

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

  Rôle             Adresse e-mail         Mot de passe
  ---------------- ---------------------- ------------------
  Étudiant         `aziz@demo.tn`         `demo1234`
  Administrateur   `admin@demo.tn`        `admin1234`
  Entreprise       `entreprise@demo.tn`   `entreprise1234`

Si les identifiants ne fonctionnent pas après une modification ou une
réinitialisation de la base, vérifier les comptes définis dans
`backend/src/seed.js`.

## 8. Tests backend

Pour lancer les tests automatisés du backend :

``` bash
cd backend
npm test
```

## 9. Limites actuelles et évolutions possibles

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

Projet Sillage --- Projet Web, Objectif 3.
