# Plan MVP — Plateforme centralisée de gestion des stocks multi-agences

> **Objectif du document** : décrire de façon exhaustive la **première version livrable (MVP)** de la plateforme.
> Ce plan se concentre sur la valeur métier essentielle : **consulter une pièce et voir instantanément la quantité disponible dans chaque agence**, avec **import / export Excel à chaque couche**.

---

## 1. Résumé exécutif

| Élément | Choix MVP |
|---|---|
| Type d'application | Web (SPA + API REST) |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js 20 + Express + TypeScript |
| Base de données | PostgreSQL 16 |
| Authentification | JWT maison (bcrypt + jsonwebtoken) |
| Import/Export | Excel `.xlsx` via SheetJS (`xlsx`) |
| Organisation du code | Monorepo (`/frontend` + `/backend`) |
| Langue de l'UI | Français |
| Déploiement | Docker Compose (1 VPS) + Nginx reverse proxy |

---

## 2. Périmètre du MVP

### ✅ Inclus dans le MVP

1. **Authentification** par e-mail / mot de passe (JWT) avec 3 rôles : `admin`, `responsable`, `vendeur`.
2. **Gestion des agences** (création/lecture par l'admin).
3. **Consultation d'une pièce** → quantité par agence + **total** (cœur métier).
4. **Liste des pièces & stocks** avec recherche et filtres simples.
5. **Import Excel** de stock (création automatique des pièces inconnues, ajout cumulatif des quantités).
6. **Export Excel** des pièces et des stocks.
7. **Mouvements de base** : entrée (manuelle + import), sortie, transfert entre agences, **annulation**.
8. **Historique** simple des mouvements (consultable, filtrable, exportable).
9. **Permissions par rôle** (l'admin voit tout, le responsable est limité à son agence, le vendeur consulte + déclare des sorties).

### ❌ Reporté à la version complète (voir `../full/`)

- Gestion fine des prix multi-devises (USD/DZD/HT/TTC) avec historique de prix.
- Marques compatibles avancées (recherche par marque, multi-sélection riche).
- Justificatifs / pièces jointes (upload de factures) — version simplifiée seulement.
- Tableau de bord analytique, alertes de stock bas, notifications.
- Journalisation d'audit complète, 2FA, rate limiting avancé.
- Multilingue (FR/AR), thème sombre, accessibilité AA complète.
- CI/CD complet, monitoring/observabilité, sauvegardes automatisées avancées.

---

## 3. Structure des documents de ce plan

| Fichier | Contenu |
|---|---|
| [00-README.md](00-README.md) | Vue d'ensemble (ce document) |
| [01-architecture.md](01-architecture.md) | Architecture technique, arborescence du monorepo |
| [02-database.md](02-database.md) | Modèle de données, migrations, seed |
| [03-backend.md](03-backend.md) | API REST, endpoints, services, validation |
| [04-frontend.md](04-frontend.md) | Pages, composants, routing, state |
| [05-theme-ui.md](05-theme-ui.md) | Thème, design system, couleurs, typographie |
| [06-security.md](06-security.md) | Sécurité, auth, permissions, OWASP |
| [07-excel.md](07-excel.md) | Import/export Excel détaillé |
| [08-deployment.md](08-deployment.md) | Déploiement, Docker, Nginx, environnement |
| [09-roadmap.md](09-roadmap.md) | Découpage en sprints, tâches, critères d'acceptation |

---

## 4. Règles métier clés (rappel)

1. **Le stock n'est jamais modifié directement.** Il évolue uniquement via des **mouvements** (entrée / sortie / transfert / annulation).
2. **Import additif** : si `CAT001 = 20` et import `CAT001 = 10` → résultat `30`.
3. **Création automatique** : une référence inconnue à l'import crée la pièce **et** la ligne de stock automatiquement (pas de bouton « Ajouter une pièce »).
4. **Transfert** `Alger → Oran` de `10` → `Alger −10`, `Oran +10`, appliqué atomiquement.
5. **Annulation** : restaure l'état précédent (ex. sortie de `5` annulée → `+5`).
6. **Excel reste l'outil de facturation** ; la plateforme ne le remplace pas.
