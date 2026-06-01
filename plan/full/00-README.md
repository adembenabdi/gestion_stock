# Plan COMPLET (Full) — Plateforme centralisée de gestion des stocks multi-agences

> **Objectif** : décrire la **version complète et industrialisée** de la plateforme, couvrant **toutes les options** du cahier des charges et les exigences non-fonctionnelles (sécurité avancée, observabilité, CI/CD, multilingue, thème, etc.).
> Ce plan **étend** le MVP (`../mvp/`) : tout ce qui est dans le MVP reste valable et est enrichi ici.

---

## 1. Résumé exécutif

| Élément | Choix version complète |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui (Radix) |
| Backend | Node.js 20 + Express (ou Fastify) + TypeScript, architecture modulaire |
| ORM | Prisma **ou** Drizzle (migrations typées) |
| Base de données | PostgreSQL 16 (+ réplica lecture optionnel) |
| Cache / files | Redis (sessions/refresh, rate limit, file d'import) |
| Auth | JWT access + refresh (cookies httpOnly), 2FA optionnel, RBAC fin |
| Import/Export | Excel `.xlsx` avancé (multi-feuilles, marques, validation riche, async) |
| Fichiers/justificatifs | Stockage objet (S3-compatible / MinIO) |
| Observabilité | OpenTelemetry + logs structurés + métriques + alerting |
| CI/CD | GitHub Actions (lint, test, build, scan, déploiement) |
| Déploiement | Docker + orchestrateur (Compose prod durci ou Kubernetes) |
| i18n | Français + Arabe (RTL), thème clair/sombre |

---

## 2. Périmètre complet (toutes options)

1. **Gestion des pièces enrichie** : prix multi-devises (USD/DZD/EUR), prix HT/TTC, pays d'origine & d'importation, **marques compatibles (N-N)** avec recherche par marque.
2. **Compatibilité marques** : ajout/suppression, recherche « toutes les pièces compatibles Caterpillar ».
3. **Stock multi-agences** complet + seuils d'alerte (stock bas) par pièce/agence.
4. **Mouvements complets** : entrée, sortie, transfert, **annulation**, avec **justificatifs (factures)** uploadés.
5. **Import Excel avancé** : multi-feuilles (pièces, marques, stock), validation riche, mode aperçu (dry-run), traitement **asynchrone** des gros fichiers, rapport téléchargeable.
6. **Export Excel** de tout (pièces, stocks, mouvements, historiques, audit).
7. **Gestion des utilisateurs & agences** complète (CRUD, activation, réinitialisation mdp).
8. **RBAC fin** + scope agence + permissions granulaires.
9. **Historique & audit** complet (qui a fait quoi, quand) avec traçabilité immuable.
10. **Tableau de bord** analytique : totaux, top mouvements, alertes, graphiques.
11. **Notifications** (in-app + e-mail) : stock bas, transfert reçu, import terminé.
12. **i18n FR/AR (RTL)**, **thème clair/sombre**, accessibilité **WCAG 2.1 AA**.
13. **Sécurité avancée** : refresh tokens, 2FA, rate limiting distribué, audit, CSP stricte.
14. **Observabilité** : traces, métriques, logs corrélés, alerting.
15. **CI/CD** + tests (unitaires, intégration, e2e) + scans de sécurité.

---

## 3. Documents de ce plan

| Fichier | Contenu |
|---|---|
| [00-README.md](00-README.md) | Vue d'ensemble (ce document) |
| [01-architecture.md](01-architecture.md) | Architecture cible, modules, scalabilité |
| [02-database.md](02-database.md) | Modèle complet (marques, justificatifs, audit, seuils) |
| [03-backend.md](03-backend.md) | API complète, services, jobs async, notifications |
| [04-frontend.md](04-frontend.md) | Pages avancées, dashboard, i18n, RTL |
| [05-theme-ui.md](05-theme-ui.md) | Design system complet, dark mode, accessibilité |
| [06-security.md](06-security.md) | Sécurité avancée (refresh, 2FA, audit, OWASP, RGPD) |
| [07-excel.md](07-excel.md) | Import/export Excel industriel (async, multi-feuilles) |
| [08-deployment.md](08-deployment.md) | CI/CD, conteneurs, observabilité, scaling, sauvegardes |
| [09-roadmap.md](09-roadmap.md) | Phases, jalons, critères, exigences non-fonctionnelles |

---

## 4. Principes directeurs

- **Source de vérité = mouvements** : le stock est toujours dérivé/maintenu par des mouvements transactionnels (jamais d'édition directe).
- **Tout est traçable** : audit immuable de chaque opération sensible.
- **Tout s'importe et s'exporte en Excel** à chaque couche.
- **Sécurité par défaut** : moindre privilège, validation systématique, secrets gérés.
- **Internationalisation native** (FR/AR, RTL) dès la conception.
- **Observable et testable** : métriques, traces, tests automatisés en CI.
