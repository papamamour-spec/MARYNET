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
backoffice.html     Back-office de démonstration : finances, grand livre des commissions, KYC, litiges, paie
assets/css/style.css, assets/js/*.js, assets/img/
server.js           Serveur Node sans dépendance (Railway)
```

Le site est **100 % statique** (HTML/CSS/JS, aucune étape de build). Les données (profils, publications) sont fictives et vivent dans `assets/js/data.js`. Les interactions (publications, réactions, inscription) sont conservées dans le `localStorage` du navigateur.

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

Aucune variable d'environnement n'est nécessaire. Chaque `git push` redéploie automatiquement.

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
