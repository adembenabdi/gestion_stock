# Plans — Plateforme centralisée de gestion des stocks multi-agences

Ce dossier contient **deux plans complets et détaillés** pour le projet.

## 📁 [`mvp/`](mvp/00-README.md) — Première version livrable (MVP)
Périmètre réduit centré sur la valeur métier : consulter une pièce et voir la quantité par agence + total, avec import/export Excel, mouvements de base, rôles et déploiement simple (Docker Compose + Nginx).

| # | Document |
|---|---|
| 00 | [Vue d'ensemble](mvp/00-README.md) |
| 01 | [Architecture](mvp/01-architecture.md) |
| 02 | [Base de données](mvp/02-database.md) |
| 03 | [Backend (API)](mvp/03-backend.md) |
| 04 | [Frontend](mvp/04-frontend.md) |
| 05 | [Thème & UI](mvp/05-theme-ui.md) |
| 06 | [Sécurité](mvp/06-security.md) |
| 07 | [Import/Export Excel](mvp/07-excel.md) |
| 08 | [Déploiement](mvp/08-deployment.md) |
| 09 | [Feuille de route](mvp/09-roadmap.md) |

## 📁 [`full/`](full/00-README.md) — Version complète (toutes options)
Étend le MVP avec : marques compatibles, prix multi-devises, justificatifs, dashboard, notifications, i18n FR/AR (RTL), thème clair/sombre, import Excel asynchrone, sécurité avancée (refresh tokens, 2FA, audit), observabilité, CI/CD et scaling.

| # | Document |
|---|---|
| 00 | [Vue d'ensemble](full/00-README.md) |
| 01 | [Architecture](full/01-architecture.md) |
| 02 | [Base de données](full/02-database.md) |
| 03 | [Backend (API)](full/03-backend.md) |
| 04 | [Frontend](full/04-frontend.md) |
| 05 | [Thème & UI](full/05-theme-ui.md) |
| 06 | [Sécurité](full/06-security.md) |
| 07 | [Import/Export Excel](full/07-excel.md) |
| 08 | [Déploiement & CI/CD](full/08-deployment.md) |
| 09 | [Feuille de route](full/09-roadmap.md) |

---

## Stack commune
- **Frontend** : React + Vite + TypeScript + Tailwind
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL
- **Auth** : JWT (maison), bcrypt/argon2
- **Excel** : SheetJS (`xlsx`) — import & export à chaque couche

## Règles métier fondamentales (les deux plans)
1. Le stock n'est jamais modifié directement → uniquement via des **mouvements** (entrée/sortie/transfert/annulation).
2. Import **additif** : `20 + import 10 = 30`.
3. **Création automatique** d'une pièce + stock pour une référence inconnue à l'import.
4. **Transfert** A→B : −X sur A, +X sur B, atomique.
5. **Annulation** : restaure l'état précédent.
6. **Excel reste l'outil de facturation** ; la plateforme ne le remplace pas.

## Recommandation
Démarrer par le **MVP** (`mvp/`), le mettre en production, puis dérouler la **version complète** (`full/`) par phases.
