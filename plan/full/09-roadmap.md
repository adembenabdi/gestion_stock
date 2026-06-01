# Full — Feuille de route & exigences non-fonctionnelles

> Étend `../mvp/09-roadmap.md`. Suppose le **MVP livré** comme socle, puis industrialisation et options complètes.

## 1. Phases

### Phase A — Industrialisation du socle
- Migration vers ORM (Prisma/Drizzle) + migrations typées.
- Monorepo `pnpm` + Turborepo + `shared-types` (Zod partagés).
- Refresh tokens (cookies httpOnly) + rotation ; durcissement sécurité (helmet/CSP/CORS/rate limit Redis).
- CI (lint, tests, scans) + conteneurs durcis.

**Sortie** : base solide, sécurisée, testée en continu.

---

### Phase B — Pièces, marques & prix avancés
- Marques compatibles (N-N) + recherche par marque.
- Prix multi-devises (USD/DZD/EUR) + HT/TTC/TVA + historisation prix.
- Recherche avancée (pg_trgm), pagination/tri serveur.
- Détail pièce enrichi côté front.

**Sortie** : catalogue complet et recherche puissante.

---

### Phase C — Mouvements avancés & justificatifs
- Justificatifs (factures) → stockage objet + URLs signées.
- Annulation groupée par `import_batch_id`.
- Seuils d'alerte (stock bas) + calcul automatique.
- Audit append-only complet.

**Sortie** : traçabilité et conformité opérationnelle.

---

### Phase D — Excel industriel (async)
- Import multi-feuilles (pièces/marques/stock), validation riche.
- Traitement **asynchrone** (BullMQ) + **mode aperçu (dry-run)** + suivi de job.
- Exports volumineux async + modèles téléchargeables.

**Sortie** : imports massifs fiables, réversibles, traçables.

---

### Phase E — Dashboard, notifications & i18n
- Dashboard analytique (KPIs, graphiques, alertes).
- Notifications in-app + e-mail (jobs).
- i18n FR/AR (RTL) + thème clair/sombre + accessibilité AA.

**Sortie** : pilotage, communication et expérience complète.

---

### Phase F — Observabilité, scaling & Go-Live
- OpenTelemetry (logs/métriques/traces) + alerting + dashboards.
- Réplica lecture, cache Redis, jobs scalables.
- CD complet (staging→prod), sauvegardes/PITR testées, runbooks.
- 2FA généralisée, pentest, checklist Go-Live.

**Sortie** : production robuste, observable, scalable.

---

## 2. Exigences non-fonctionnelles (cibles)

| Domaine | Cible |
|---|---|
| **Performance** | consultation référence < 300 ms (P95) ; recherche < 500 ms |
| **Import** | 50 000 lignes traitées en async sans bloquer l'UI |
| **Disponibilité** | 99,5 %+ ; déploiements sans coupure (rolling) |
| **Sécurité** | OWASP Top 10 couvert, 2FA admin, audit, scans CI verts |
| **Scalabilité** | API & workers horizontaux ; réplica lecture |
| **Observabilité** | logs+métriques+traces corrélés, alerting actif |
| **Sauvegarde** | quotidienne chiffrée + PITR, restauration testée |
| **Accessibilité** | WCAG 2.1 AA (FR & AR/RTL) |
| **i18n** | FR + AR complets, formats localisés |
| **Qualité** | couverture tests significative, e2e parcours clés |

---

## 3. Définition de « terminé » (renforcée)

- Code typé, lint/typecheck OK, tests (unit/intégration/e2e) verts.
- Validation Zod partagée ; permissions (RBAC + scope + IDOR) testées.
- Scans sécurité (SCA, secrets, image) sans critique.
- Observabilité et alerting branchés sur les nouveaux flux.
- Documentation (API, runbook, ADR) à jour.

---

## 4. Risques & mitigations

| Risque | Mitigation |
|---|---|
| Gros imports lents/instables | async + lots + reprise + dry-run |
| Incohérence stock concurrente | transactions + `FOR UPDATE` + contraintes |
| Fuite de données / accès indu | RBAC + scope + IDOR checks + audit + chiffrement |
| Indisponibilité DB | réplica + sauvegardes + PITR + PRA testé |
| Dérive de qualité | CI bloquante, revues, ADR, feature flags |
| Adoption (langue/UX) | i18n FR/AR, modèles Excel, formations courtes |

---

## 5. Évolutions futures possibles

- App mobile (consultation/vente terrain).
- Connecteur direct au logiciel de facturation.
- Prévisions de réassort (analytique/ML).
- Multi-entreprise (multi-tenant).
- Lecture code-barres / QR sur les références.
