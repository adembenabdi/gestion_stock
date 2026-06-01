# Full — Backend (API complète)

> Étend `../mvp/03-backend.md`. API versionnée `/api/v1`. Architecture modulaire orientée domaine + jobs asynchrones.

## 1. Modules

```
auth · users · agences · pieces · marques · stocks · mouvements
justificatifs · excel · notifications · dashboard · audit · health
```

---

## 2. Endpoints (en plus du MVP)

### Auth avancée — `/api/v1/auth`
| Méthode | Route | Description |
|---|---|---|
| POST | `/login` | e-mail + mdp → access (court) + refresh (cookie httpOnly) |
| POST | `/refresh` | renouvelle l'access token via refresh |
| POST | `/logout` | révoque le refresh token |
| POST | `/2fa/setup` | génère secret TOTP + QR |
| POST | `/2fa/verify` | active la 2FA |
| POST | `/2fa/challenge` | valide le code à la connexion |
| POST | `/password/forgot` | envoie un e-mail de réinitialisation |
| POST | `/password/reset` | réinitialise via token |

### Marques — `/api/v1/marques`
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | liste des marques |
| POST | `/` | créer (admin) |
| GET | `/:id/pieces` | pièces compatibles avec la marque |
| POST | `/pieces/:pieceId/marques` | associer marques à une pièce |
| DELETE | `/pieces/:pieceId/marques/:marqueId` | dissocier |

### Pièces (enrichies) — `/api/v1/pieces`
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | recherche avancée (`q`, `marque`, `pays`, pagination, tri) |
| GET | `/:reference` | détail + stock par agence + total + marques + prix |
| POST | `/` | création manuelle (admin) — en plus de l'import |
| PATCH | `/:id` | mise à jour (prix, infos) + historisation prix |

### Mouvements + justificatifs — `/api/v1/mouvements`
| Méthode | Route | Description |
|---|---|---|
| POST | `/entree` `/sortie` `/transfert` | comme MVP, transactions |
| POST | `/:id/annuler` | annulation tracée |
| POST | `/:id/justificatifs` | upload facture (multipart → stockage objet) |
| GET | `/:id/justificatifs` | liste / liens signés |
| GET | `/` | historique filtrable avancé (export possible) |

### Seuils & alertes — `/api/v1/seuils`
| Méthode | Route | Description |
|---|---|---|
| GET | `/alertes` | stocks sous seuil (selon portée) |
| PUT | `/:pieceId` | définir seuil min (global ou par agence) |

### Dashboard — `/api/v1/dashboard`
| Méthode | Route | Description |
|---|---|---|
| GET | `/summary` | totaux, nb pièces, alertes, mouvements récents |
| GET | `/charts` | séries pour graphiques (mouvements/temps, par agence) |

### Notifications — `/api/v1/notifications`
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | mes notifications (pagination) |
| POST | `/:id/lue` | marquer comme lue |
| POST | `/lues` | tout marquer lu |

### Excel async — `/api/v1/excel`
| Méthode | Route | Description |
|---|---|---|
| POST | `/import` | dépose fichier → crée un **job** → renvoie `jobId` |
| GET | `/import/:jobId` | statut + rapport (en cours / terminé / erreurs) |
| POST | `/import/:jobId/confirm` | (mode dry-run) confirmer l'application |
| GET | `/export/:entite` | export (stock, pieces, mouvements, audit) |
| GET | `/template/:entite` | modèles (stock, pieces, marques) |

### Audit — `/api/v1/audit` (admin)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | journal filtrable (user, action, période) + export |

### Health/observabilité
| Méthode | Route | Description |
|---|---|---|
| GET | `/health` | liveness |
| GET | `/ready` | readiness (DB, Redis) |
| GET | `/metrics` | métriques (protégé) |

---

## 3. Jobs asynchrones (BullMQ + Redis)

| Job | Déclencheur | Action |
|---|---|---|
| `excel-import` | upload import | parse, validation, dry-run/apply, rapport |
| `excel-export` | export volumineux | génère le classeur, stocke, notifie le lien |
| `notify-email` | événements | envoi e-mail (stock bas, import terminé) |
| `check-seuils` | après mouvement / cron | calcule alertes, crée notifications |

- **Idempotence** : `import_batch_id` évite les doublons.
- **Reprise** : jobs retry avec backoff, dead-letter en cas d'échec répété.

---

## 4. Logique métier avancée

### 4.1 Transfert (transaction)
```text
BEGIN
  verrou stock source FOR UPDATE
  vérifier dispo (source.quantite >= q)
  source -= q ; upsert dest += q
  insérer mouvement type=transfert
  enqueue check-seuils (source, dest)
COMMIT
```

### 4.2 Annulation
- Inverse l'effet selon le type, lie `mouvement_annule_id`, empêche double annulation, journalise dans l'audit.

### 4.3 Import (dry-run)
- Mode **aperçu** : calcule le rapport sans écrire (diffs, créations prévues), puis `confirm` applique en transaction/lots.

---

## 5. Notifications

- **In-app** (table `notifications`, badge non lus) + **e-mail** (jobs).
- Événements : stock bas, transfert reçu par l'agence destination, import terminé, échec d'import.
- Préférences utilisateur (activer/désactiver e-mail) — option.

---

## 6. Observabilité

- **OpenTelemetry** : traces HTTP + DB + jobs, `traceId` renvoyé dans les erreurs.
- **Logs `pino`** structurés, corrélés au trace, sans données sensibles.
- **Métriques** : latence, taux d'erreur, volume d'imports, longueur de file.
- Endpoints `/health`, `/ready`, `/metrics`.

---

## 7. Validation & contrats

- Schémas **Zod partagés** (`packages/shared-types`) entre API et web.
- Pagination/tri/filtre normalisés (`?page`, `?limit`, `?sort`, `?q`).
- Réponses : `{ data, meta }` ; erreurs : `{ error: { code, message, details, traceId } }`.

---

## 8. Tests backend

| Niveau | Exemples |
|---|---|
| Unitaire | services mouvements, cumul import, calcul TTC, seuils |
| Intégration | endpoints + DB réelle (Testcontainers), transferts atomiques |
| Sécurité | RBAC, scope agence, refresh/2FA, rate limit |
| Charge | import 50k lignes async, consultations concurrentes |
