# MVP — Feuille de route (sprints)

Découpage indicatif en sprints. Chaque sprint produit un incrément testable.

---

## Sprint 0 — Fondations
**But** : socle technique prêt.
- [ ] Init monorepo (`/backend`, `/frontend`), ESLint/Prettier, TypeScript strict.
- [ ] `docker-compose` Postgres + `.env.example`.
- [ ] Squelette Express (`app`, `server`, `errorHandler`, `/api/health`).
- [ ] Squelette React (Vite + Tailwind + routing + AuthContext vide).

**Critère d'acceptation** : `docker compose up` lance API + DB ; front affiche une page d'accueil.

---

## Sprint 1 — Base de données & Auth *(bloquant)*
**But** : connexion et rôles fonctionnels.
- [ ] Migration `001_init.sql` (toutes les tables).
- [ ] Seed (admin + 3 agences).
- [ ] `POST /auth/login`, `GET /auth/me`, JWT, `authMiddleware`, `requireRole`.
- [ ] Page Login + routes protégées par rôle côté front.

**Critère** : login admin OK → token ; route protégée refuse sans token (401) et selon rôle (403).

---

## Sprint 2 — Consultation & catalogue *(cœur métier)*
**But** : écran phare opérationnel.
- [ ] `GET /pieces`, `GET /pieces/:reference` (stock par agence + total).
- [ ] `GET /stocks` (filtré par rôle/agence).
- [ ] Page **Recherche pièce** (tableau agence/quantité + total).
- [ ] Page Liste pièces + Stocks.

**Critère** : rechercher `CAT001` affiche la répartition par agence et le total.

---

## Sprint 3 — Import / Export Excel
**But** : alimenter et extraire les données.
- [ ] `POST /excel/import/stock` (création auto + cumul + rapport).
- [ ] `GET /excel/export/{stock,pieces}` + `template/stock`.
- [ ] Composant ExcelImport (drag & drop + rapport) + boutons export.
- [ ] Tests : cumul `20+10=30`, création auto.

**Critère** : import d'un `.xlsx` met à jour les stocks et crée les pièces inconnues ; export réimportable.

---

## Sprint 4 — Mouvements
**But** : entrées/sorties/transferts/annulations.
- [ ] `POST /mouvements/{entree,sortie,transfert}` + `/:id/annuler` (transactions).
- [ ] `GET /mouvements` (historique filtrable) + export.
- [ ] Pages Mouvements + Historique.
- [ ] Tests : transfert (somme conservée), annulation (restauration), stock non négatif.

**Critère** : transfert Alger→Oran applique −/+ ; annulation restaure le stock.

---

## Sprint 5 — Rôles, admin & finitions
**But** : permissions complètes + gestion.
- [ ] Pages admin Users / Agences.
- [ ] Scope agence appliqué partout (responsable/vendeur).
- [ ] Rate limit login, helmet, CORS, audit `npm audit`.
- [ ] Tests permissions (vendeur ≠ import, responsable limité).

**Critère** : chaque rôle ne voit/agit que sur son périmètre.

---

## Sprint 6 — Déploiement & recette
**But** : mise en production.
- [ ] Dockerfiles, Nginx, TLS.
- [ ] Migrations + seed en prod, sauvegarde testée.
- [ ] Recette fonctionnelle (login 3 rôles, import, recherche, mouvements).

**Critère** : application accessible en HTTPS, scénarios métier validés.

---

## Définition de « terminé » (Definition of Done)
- Code typé, lint OK, tests verts.
- Validation Zod sur les entrées.
- Permissions vérifiées côté serveur.
- Pas de secret commité.
- Documentation minimale (README backend/frontend).

---

## Risques & mitigations
| Risque | Mitigation |
|---|---|
| Format Excel hétérogène des agences | modèle imposé + normalisation en-têtes + rapport d'erreurs |
| Stocks négatifs / incohérents | transactions + contrainte `quantite >= 0` + `FOR UPDATE` |
| Mauvaise gestion des droits | double contrôle rôle + scope agence + tests |
| Perte de données | sauvegardes quotidiennes testées |
