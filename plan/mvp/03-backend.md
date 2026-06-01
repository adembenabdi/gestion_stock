# MVP — Backend (API REST)

## 1. Principes

- **Express + TypeScript**, architecture en couches (`route → controller → service → repository`).
- **Validation Zod** sur toute entrée (body, params, query).
- **Réponses normalisées** : succès `{ data }`, erreur `{ error: { code, message, details? } }`.
- **Transactions PostgreSQL** pour tout ce qui touche au stock (mouvements, transferts, annulations).

---

## 2. Liste des endpoints (MVP)

### Auth — `/api/auth`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| POST | `/login` | public | Connexion → JWT |
| GET | `/me` | authentifié | Profil courant |
| POST | `/logout` | authentifié | Invalide côté client (stateless) |

### Utilisateurs — `/api/users` (admin)
| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Liste des utilisateurs |
| POST | `/` | Créer un utilisateur (nom, email, role, agence_id, password) |
| PATCH | `/:id` | Modifier (rôle, agence, actif) |
| DELETE | `/:id` | Désactiver |

### Agences — `/api/agences`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/` | authentifié | Liste des agences |
| POST | `/` | admin | Créer |
| PATCH | `/:id` | admin | Modifier |

### Pièces — `/api/pieces`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/` | authentifié | Liste paginée + recherche `?q=` |
| GET | `/:reference` | authentifié | Détail pièce + **stock par agence + total** |

> Pas de création manuelle de pièce dans le MVP : elles naissent via l'import Excel.

### Stocks — `/api/stocks`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/` | authentifié* | Vue stock (filtres : agence, référence) |

\* Le responsable/vendeur ne voit que son agence (filtré côté service selon le JWT).

### Mouvements — `/api/mouvements`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/` | authentifié* | Historique filtrable (type, agence, période, référence) |
| POST | `/entree` | admin, responsable | Entrée manuelle |
| POST | `/sortie` | admin, responsable, vendeur | Sortie / vente |
| POST | `/transfert` | admin, responsable | Transfert A→B |
| POST | `/:id/annuler` | admin, responsable | Annulation d'un mouvement |

### Excel — `/api/excel`
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| POST | `/import/stock` | admin, responsable | Import `.xlsx` (création auto + cumul) |
| GET | `/export/stock` | authentifié* | Export stock courant |
| GET | `/export/pieces` | authentifié | Export catalogue pièces |
| GET | `/export/mouvements` | authentifié* | Export historique |
| GET | `/template/stock` | authentifié | Télécharger un modèle vierge |

---

## 3. Contrats d'API (exemples)

### POST `/api/auth/login`
```jsonc
// Requête
{ "email": "admin@plateforme.dz", "password": "••••••" }
// Réponse 200
{ "data": { "token": "JWT", "user": { "id": "...", "nom": "...", "role": "admin", "agenceId": null } } }
```

### GET `/api/pieces/CAT001`
```jsonc
{
  "data": {
    "reference": "CAT001",
    "nom": "Filtre hydraulique",
    "stocks": [
      { "agence": "Alger", "quantite": 25 },
      { "agence": "Oran",  "quantite": 12 },
      { "agence": "Blida", "quantite": 7 }
    ],
    "total": 44
  }
}
```

### POST `/api/mouvements/transfert`
```jsonc
// Requête
{ "reference": "CAT001", "quantite": 10, "agenceSourceId": "uuid-alger", "agenceDestId": "uuid-oran", "motif": "réassort" }
// Réponse 201 → mouvement créé + stocks mis à jour atomiquement
```

---

## 4. Logique de service — points critiques

### 4.1 Service Mouvement (transaction)
```text
BEGIN
  - verrouiller la/les ligne(s) stock concernées (SELECT ... FOR UPDATE)
  - vérifier la disponibilité (sortie/transfert : quantite >= demande)
  - mettre à jour stock(s)
  - insérer mouvement
COMMIT  (ROLLBACK sur erreur)
```

### 4.2 Annulation
```text
- charger mouvement source (non déjà annulé)
- calculer l'effet inverse selon son type
- appliquer dans une transaction + insérer mouvement type='annulation' (mouvement_annule_id = source)
- marquer/empêcher double annulation
```

### 4.3 Import (voir 07-excel.md)
- Pour chaque ligne : upsert pièce → upsert stock → mouvement `entree` (cumul).

---

## 5. Middlewares

| Middleware | Rôle |
|---|---|
| `helmet()` | en-têtes sécurité |
| `cors()` | origine front autorisée |
| `express.json({ limit })` | parsing JSON |
| `authMiddleware` | vérifie le JWT, injecte `req.user` |
| `requireRole(...roles)` | contrôle d'accès par rôle |
| `scopeAgence` | force le filtrage à l'agence de l'utilisateur |
| `validate(schema)` | validation Zod |
| `errorHandler` | capture et formate les erreurs |
| `rateLimiter` (login) | anti brute-force basique |

---

## 6. Gestion des erreurs

- Classe `AppError(code, httpStatus, message, details?)`.
- `errorHandler` final : log via `pino`, renvoie le format normalisé, masque les détails internes en production.
- Validation Zod → `400` avec `details` listant les champs.

---

## 7. Tests backend (MVP)

| Test | But |
|---|---|
| `import.test` | `CAT001 20 + import 10 = 30` (cumul) ; création auto d'une référence inconnue |
| `transfert.test` | somme totale conservée ; stock source jamais négatif |
| `annulation.test` | restauration exacte du stock ; pas de double annulation |
| `auth.test` | login OK/KO, JWT, accès refusé sans token |
| `permissions.test` | vendeur ne peut pas importer ; responsable limité à son agence |

Outils : `vitest`/`jest` + `supertest`, base de test isolée (Docker ou schéma dédié).
