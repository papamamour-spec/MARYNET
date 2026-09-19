# MARYNET — La maison, en confiance 🇸🇳

**MARYNET** est un réseau social de proximité pour le personnel de maison au Sénégal. Il relie six acteurs dans un seul espace, aussi intuitif qu'un fil d'actualité, avec une agence et une mutuelle « à l'intérieur » :

| Acteur | Ce qu'il y trouve |
|---|---|
| 🏠 **Familles** | La bonne personne au bon modèle (permanent, à l'heure, partagé, abonnement, urgence), contrat en 1 clic, paiement mobile money, remplacement garanti |
| ⭐ **Professionnel·les** | Contrat, salaire garanti à date, cotisations IPRES/CSS, tirelire automatique, mutuelle, formation, passeport de compétences, réputation portable |
| 🏢 **Entreprises (B2B)** | Module Équipes : contrat cadre, pointage QR, facture unique, remplacement sous 48 h, reporting de conformité |
| 🏛️ **Institutions** | Formalisation du secteur, programmes de formation ciblés, tableau de bord d'impact, médiation |
| 🤝 **Agences de placement** | Vitrine, paie, mutuelle et suivi des placements dans un back-office, commission partagée |
| ✈️ **Diaspora** | *Sama Kër* : payer depuis l'étranger, suivre chaque passage chez ses proches au pays |

## Ce qui est innovant

1. **Formule Partagée (Mbokk)** : 2 ou 3 foyers voisins se partagent une professionnelle à temps plein. Chacun paie moins, elle gagne un salaire complet avec un seul contrat.
2. **Indice Kóllëre, scoring à double sens** : les professionnel·les *et* les clients (familles, entreprises, institutions) sont notés avec les mêmes règles. Symétrique, transparent, contestable, réparable. Niveaux Bronze → Platine avec avantages concrets (commission réduite, sans acompte, accès Urgence, micro-crédit).
3. **Protection sociale intégrée** : cotisations calculées et versées, tirelire de 5 % automatique, mutuelle de groupe.
4. **MaryMatch** : moteur de compatibilité (besoin, quartier, horaires, langues, indice).
5. **Web + WhatsApp + USSD**, en français et en wolof : fonctionne sans smartphone.
6. **Passeport de compétences** avec QR code, qui suit la personne même hors plateforme.

## Modèle économique

Comme une agence immobilière, MARYNET prélève une commission sur chaque transaction, retenue à la source par le back-office avant tout versement (séquestre + mobile money) :

- **10 %** sur les missions à l'heure (8 % / 7 % pour les pros Or / Platine), majoration Urgence
- **Frais de placement** de 50 % du premier salaire sur les contrats permanents et partagés
- **Sérénité** : 9 500 F / contrat / mois (paie, remplacement garanti, mutuelle), récurrent
- **12 % → 8 %** sur les factures B2B sous contrat cadre
- **3 %** sur les paiements diaspora (Sama Kër)
- **6 %** + licence back-office pour les agences partenaires, **6 %** de frais de gestion sur les programmes institutionnels
- Commissions d'apporteur sur mutuelle, micro-crédit et formations premium

La page `modele-economique.html` détaille le mécanisme et propose un simulateur de revenus ; `backoffice.html` montre le grand livre des commissions perçues.

## Structure du site

```
index.html          Accueil : concept, acteurs, formules, innovations, FAQ
reseau.html         Le réseau (fil d'actualité type réseau social, composer, filtres, réactions, commentaires, MaryMatch, messages)
profil.html?id=…    Profils vérifiés avec indice Kóllëre détaillé, services, disponibilités, avis
scoring.html        Barème du scoring agent / client + simulateur interactif
familles.html       Familles & diaspora : garanties, test MaryMatch, tarifs, Sama Kër
professionnels.html Professionnel·les : statut, protection sociale, portefeuille, USSD
entreprises.html    B2B : module Équipes, secteurs, tarification cadre
institutions.html   Institutions, agences, écosystème de partenaires
simulateur.html     Recommandation de formule + budget mensuel détaillé
espace.html         Tableaux de bord de démonstration (6 rôles)
inscription.html    Inscription adaptative par rôle
modele-economique.html  Sources de revenus, commissions par transaction, simulateur de revenus
backoffice.html     Démonstration publique du back-office (données fictives statiques)
admin.html          Vrai back-office (/admin, protégé) : vue d'ensemble, reporting, transactions, opérations, paramétrage
admin-login.html    Page de connexion du back-office
assets/css/style.css, assets/js/*.js, assets/img/
server.js           Serveur Node sans dépendance : site, API, authentification, stockage JSON (Railway)
```

Le site est **100 % statique** (HTML/CSS/JS, aucune étape de build). Les données (profils, publications) sont fictives et vivent dans `assets/js/data.js`. Les interactions (publications, réactions, inscription) sont conservées dans le `localStorage` du navigateur.

## Back-office : paramétrage et reporting

Le back-office de pilotage est à l'adresse **`/admin`** (par exemple `https://votre-app.up.railway.app/admin`). Il est protégé par un mot de passe.

| Vue | Ce qu'on y fait |
|---|---|
| **Vue d'ensemble** | Volume traité, revenu MARYNET, prise moyenne, clients et pros actifs sur 30 jours avec variation, revenu mensuel, alertes (litiges, KYC en retard, séquestre) |
| **Reporting** | Activité globale filtrable par période, ville, type de flux, acteur, canal de paiement et statut ; graphiques mensuels, répartitions, tableaux ; **export CSV** pour Excel |
| **Transactions** | Grand livre paginé : chaque paiement avec le taux et la commission retenue à la source |
| **Opérations** | File de vérification d'identité (valider / rejeter) et litiges en médiation (trancher, décision tracée) |
| **Paramétrage** | Taux de commission par flux, abonnements, planchers de salaire, seuils des niveaux Kóllëre, formules actives, canaux de paiement, villes ouvertes, seuils d'alerte |

Les paramètres enregistrés sont exposés sur `/api/settings` et **appliqués au simulateur public** (commission, Sérénité, frais de placement, plancher, majoration Urgence, formules désactivées).

### Accès et sécurité

- Le mot de passe est la variable d'environnement **`ADMIN_PASSWORD`**. Sur Railway : *Variables → New Variable → `ADMIN_PASSWORD`*. Sans cette variable en production, `/admin` reste désactivé.
- En local sans variable, le mot de passe de développement est `marynet2026`.
- Session de 12 h par cookie `HttpOnly` ; 5 échecs de connexion bloquent l'adresse IP 15 minutes ; l'API `/api/admin/*` refuse toute requête non authentifiée.

### Persistance des données

Paramètres, transactions et opérations sont stockés en JSON dans `DATA_DIR` (défaut : `./data`, ignoré par git). Sur Railway, le disque est effacé à chaque déploiement : montez un **Volume** (*Service → Volumes → Add Volume*, chemin `/data`) et définissez `DATA_DIR=/data` pour conserver le paramétrage. Sans volume, tout revient aux valeurs par défaut et au jeu de démonstration à chaque redéploiement.

Le jeu de transactions (6 mois, ~1 600 opérations) est **fictif et généré automatiquement** au premier démarrage ; le bouton *Réinitialiser les données de démo* le régénère. En production, il sera remplacé par les flux réels des agrégateurs de paiement.

### API

```
GET  /api/settings                 paramètres publics (lecture)
POST /api/admin/login              { password }
POST /api/admin/logout
GET  /api/admin/me
GET  /api/admin/report?from&to&ville&type&acteur&canal&statut
GET  /api/admin/report.csv?...     export des transactions filtrées
GET  /api/admin/transactions?page&limit&...
GET  /api/admin/settings  ·  PUT /api/admin/settings
GET  /api/admin/ops  ·  POST /api/admin/kyc/:id  ·  POST /api/admin/litiges/:id
POST /api/admin/reset
```

## Lancer en local

```bash
npm start
# → http://localhost:3000
```

Ou n'importe quel serveur statique (`python3 -m http.server`), les pages fonctionnant aussi en ouvrant directement les fichiers `.html`.

## Déployer sur Railway

1. Poussez ce dépôt sur GitHub.
2. Sur [railway.app](https://railway.app) : **New Project → Deploy from GitHub repo → MARYNET**.
3. Railway détecte `package.json` (Nixpacks) et lance `npm start`. Le serveur écoute sur la variable `PORT` fournie par Railway ; le healthcheck est sur `/health` (configuré dans `railway.json`).
4. **Settings → Networking → Generate Domain** pour obtenir l'URL publique.

Ajoutez la variable `ADMIN_PASSWORD` pour activer le back-office `/admin` et, idéalement, un Volume sur `/data` avec `DATA_DIR=/data` (voir ci-dessous). Chaque `git push` redéploie automatiquement.

## Feuille de route (backend)

Le prototype est front-end. Pour passer en production :

- API (Node/NestJS ou Django) + PostgreSQL : comptes, publications, contrats, missions, paiements, scoring
- Paiements : Wave, Orange Money, Free Money (agrégateurs type PayDunya/Bictorys), Stripe pour la diaspora
- Contrats : génération PDF, signature par OTP SMS, archivage
- Scoring : calcul par événements (pointage, paiement, avis), décroissance temporelle, médiation
- Canaux : passerelle USSD/SMS opérateurs, WhatsApp Business API
- Institutions : exports anonymisés, tableau de bord d'impact

## Licence

MIT — voir `LICENSE`.
