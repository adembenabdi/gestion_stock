# MVP — Sécurité

## 1. Authentification (JWT maison)

- Mots de passe **hachés avec bcrypt** (coût ≥ 10/12). Jamais stockés en clair.
- À la connexion : vérification e-mail + `bcrypt.compare`, génération d'un **JWT** signé (`HS256`) avec secret fort (`JWT_SECRET` ≥ 32 caractères, en `.env`).
- **Payload JWT minimal** : `{ sub: userId, role, agenceId }` + `exp` (ex. 8h).
- Vérification du token à chaque requête via `authMiddleware`.

### Stockage du token côté client (MVP)
- Option simple : token en mémoire + `localStorage` pour la persistance.
- ⚠️ Risque XSS si stocké en `localStorage` → atténué par CSP + sanitation + pas d'injection HTML.
- **Recommandation** (préparée pour la version complète) : cookie `httpOnly` + `Secure` + `SameSite=Strict` + refresh token. Au MVP, on peut commencer simple et documenter la dette.

---

## 2. Autorisation (RBAC)

| Rôle | Portée | Droits clés |
|---|---|---|
| `admin` | global | tout : users, agences, tous stocks, exports, historique |
| `responsable` | **son agence** | import, entrée manuelle, sortie, transfert (depuis son agence), consultation |
| `vendeur` | son agence (limité) | déclaration de vente (sortie), consultation limitée |

- Contrôle en **deux niveaux** :
  1. `requireRole(...)` sur la route.
  2. `scopeAgence` dans le service : un responsable/vendeur ne peut agir/voir que sur `req.user.agenceId`.
- **Ne jamais** se fier au frontend pour les droits : tout est revérifié côté API.

---

## 3. Validation des entrées

- **Zod** sur tous les `body`, `params`, `query`.
- Typage strict : quantités entières > 0, références non vides, UUID valides.
- Rejet précoce avec `400` + détails.

---

## 4. OWASP Top 10 — mesures MVP

| Risque | Mesure |
|---|---|
| **A01 Broken Access Control** | RBAC + scope agence revérifiés côté serveur |
| **A02 Cryptographic Failures** | bcrypt pour mdp, HTTPS, secrets en `.env` (hors Git) |
| **A03 Injection** | requêtes **paramétrées** (`pg` `$1,$2`), jamais de concaténation SQL ; validation Zod |
| **A04 Insecure Design** | stock modifiable uniquement via mouvements + transactions |
| **A05 Security Misconfig** | `helmet`, CORS restreint, pas de stack trace en prod, `.env.example` sans secrets |
| **A06 Vulnerable Components** | `npm audit`, versions à jour, lockfile |
| **A07 Auth Failures** | rate limit sur `/login`, messages d'erreur génériques, expiration JWT |
| **A08 Data Integrity** | validation des fichiers Excel (type, taille), contraintes DB |
| **A09 Logging Failures** | logs `pino` (connexions, imports, mouvements) sans données sensibles |
| **A10 SSRF** | pas d'appel sortant basé sur entrée utilisateur |

---

## 5. Sécurité des uploads (Excel)

- **Type MIME** + extension `.xlsx` vérifiés (`multer` fileFilter).
- **Taille max** (ex. 5 Mo) via `multer limits`.
- Parsing en mémoire, **pas d'exécution**, pas de stockage du fichier brut (ou stockage temporaire nettoyé).
- Validation ligne par ligne avant écriture en base ; rapport d'erreurs sans planter l'import complet.

---

## 6. En-têtes & transport

- **HTTPS obligatoire** (TLS via Nginx / Let's Encrypt).
- `helmet` : `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **CORS** limité à l'origine du frontend (configurable par env).
- `express.json` avec limite de taille.

---

## 7. Gestion des secrets

- Tous les secrets en variables d'environnement (`.env` non versionné).
- `.env.example` documenté **sans valeurs**.
- Rotation possible de `JWT_SECRET` (invalide les sessions — acceptable au MVP).

### Variables d'environnement (backend)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://user:pass@db:5432/stocks
JWT_SECRET=...               # >= 32 chars
JWT_EXPIRES_IN=8h
SEED_ADMIN_EMAIL=admin@plateforme.dz
SEED_ADMIN_PASSWORD=...
CORS_ORIGIN=https://app.exemple.dz
UPLOAD_MAX_MB=5
```

---

## 8. Bonnes pratiques de code

- Pas de secret en dur, pas de log de mot de passe / token.
- Dépendances minimales et maintenues.
- Revues de code orientées sécurité sur l'auth et les mouvements.
- Tests de permission inclus dans la CI (voir backend).
