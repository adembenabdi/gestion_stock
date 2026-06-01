# Full — Sécurité avancée

> Étend `../mvp/06-security.md`. Objectif : sécurité de niveau production, conformité OWASP, traçabilité, protection des données.

## 1. Authentification

- **Hachage** : `argon2id` (ou bcrypt coût ≥ 12).
- **Access token** JWT court (5–15 min) + **refresh token** long (rotatif) stocké :
  - côté client en **cookie `httpOnly` + `Secure` + `SameSite=Strict`**,
  - côté serveur **haché** en base (`refresh_tokens.token_hash`) → révocable.
- **Rotation des refresh tokens** : à chaque refresh, l'ancien est révoqué (détection de réutilisation = compromission → invalider la session).
- **2FA (TOTP)** optionnelle via `otplib` : secret chiffré au repos, QR code, codes de secours.
- **Réinitialisation mot de passe** : token à usage unique, expirant, envoyé par e-mail.

---

## 2. Autorisation (RBAC fin + scope)

| Rôle | Portée | Capacités |
|---|---|---|
| `admin` | global | tout, gestion users/agences, audit, exports globaux |
| `responsable` | son agence | import, entrée, sortie, transfert (depuis son agence), seuils, justificatifs |
| `vendeur` | son agence (limité) | déclaration vente (sortie), consultation limitée |

- **Permissions granulaires** possibles (matrice action × ressource) si besoin d'évolution.
- **Double contrôle** : `requireRole` + `scopeAgence` revérifiés systématiquement côté serveur.
- **Object-level authorization** : vérifier que la ressource (mouvement, stock) appartient bien au périmètre de l'utilisateur (anti IDOR).

---

## 3. Validation & assainissement

- **Zod** partagé pour toute entrée (body/params/query), typage strict.
- Normalisation/échappement des données affichées (anti-XSS).
- Limites strictes (taille payload, longueur champs, bornes numériques).

---

## 4. OWASP Top 10 — mesures complètes

| Risque | Mesures |
|---|---|
| **A01 Access Control** | RBAC + scope agence + object-level checks (anti IDOR) + tests |
| **A02 Cryptographic** | argon2/bcrypt, TLS 1.2+, secrets chiffrés (2FA), cookies Secure |
| **A03 Injection** | ORM paramétré, requêtes préparées, validation Zod, pas de SQL dynamique |
| **A04 Insecure Design** | mouvements transactionnels, audit, threat modeling, feature flags |
| **A05 Misconfig** | helmet + CSP stricte, headers durcis, pas de debug en prod, images minimales |
| **A06 Vulnerable Comp.** | `npm audit`, Dependabot/Renovate, scan SCA en CI, pinning |
| **A07 Auth Failures** | rate limit distribué (Redis), lockout progressif, 2FA, rotation refresh |
| **A08 Data Integrity** | validation Excel, contraintes DB, audit append-only, signatures images CI |
| **A09 Logging/Monitoring** | logs structurés + audit + alerting (tentatives, échecs import) |
| **A10 SSRF** | pas d'appels sortants pilotés par l'utilisateur ; egress restreint |

---

## 5. Protection réseau & en-têtes

- **HTTPS obligatoire** (TLS, HSTS).
- **CSP stricte** (sources scripts/styles/connexions allow-list), `frame-ancestors 'none'`.
- `helmet` : `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **CORS** strict (origines, méthodes, credentials).
- **Rate limiting** par IP + par compte (store Redis) sur login, refresh, import, reset.
- Protection **CSRF** : SameSite + token anti-CSRF pour les mutations basées cookie.

---

## 6. Sécurité des fichiers (Excel & justificatifs)

- Vérif **type MIME + extension + magic bytes**, taille max, antivirus (ClamAV) optionnel.
- Justificatifs stockés en **stockage objet privé** ; accès via **URLs signées** à durée limitée.
- Pas d'exécution, parsing isolé ; nettoyage des fichiers temporaires.
- Limite de débit sur les uploads.

---

## 7. Gestion des secrets

- Secrets via **gestionnaire dédié** (Docker secrets / Vault / variables CI chiffrées), jamais en Git.
- Rotation planifiée (JWT, DB, SMTP, clés stockage).
- `.env.example` documenté sans valeurs ; scan de secrets en CI (gitleaks).

---

## 8. Audit & traçabilité

- **`audit_logs` append-only** : connexions, imports, mouvements, changements de rôle, exports.
- Conservation paramétrable ; export pour conformité.
- Corrélation via `traceId` (OpenTelemetry).

---

## 9. Confidentialité & conformité (RGPD-like)

- Données personnelles limitées (nom, e-mail) → minimisation.
- Droit d'accès/suppression utilisateur (désactivation + anonymisation).
- Politique de conservation des logs/justificatifs.
- Chiffrement au repos (DB volume, stockage objet) et en transit.

---

## 10. Tests & vérifications sécurité

- Tests automatisés RBAC / scope / IDOR.
- **SAST** (lint sécurité), **SCA** (dépendances), **secret scanning** en CI.
- **DAST**/scan léger (OWASP ZAP) sur l'environnement de staging.
- Revue de menace (threat model) sur auth, import, transferts.
- Pentest avant mise en production majeure (recommandé).
