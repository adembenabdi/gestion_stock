# MVP — Frontend (React)

## 1. Stack & principes

- **React 18 + Vite + TypeScript**.
- **React Router** pour la navigation, **TanStack Query** pour le cache serveur.
- **React Hook Form + Zod** pour les formulaires.
- **Tailwind CSS** pour le style (voir `05-theme-ui.md`).
- **Axios** centralisé avec intercepteur JWT.

---

## 2. Arborescence `frontend/src`

```
src/
├─ api/
│  ├─ client.ts          # axios + intercepteurs (token, 401)
│  ├─ auth.ts
│  ├─ pieces.ts
│  ├─ stocks.ts
│  ├─ mouvements.ts
│  └─ excel.ts
├─ context/
│  └─ AuthContext.tsx    # user + token + login/logout
├─ components/
│  ├─ ui/                # Button, Input, Table, Modal, Badge, Card...
│  ├─ layout/            # Sidebar, Topbar, PageHeader
│  ├─ ExcelImport.tsx    # drag & drop + rapport
│  └─ ProtectedRoute.tsx # garde par rôle
├─ features/
│  ├─ auth/LoginPage.tsx
│  ├─ recherche/RecherchePiecePage.tsx
│  ├─ pieces/PiecesListPage.tsx
│  ├─ stocks/StocksPage.tsx
│  ├─ mouvements/MouvementsPage.tsx
│  └─ admin/UsersPage.tsx, AgencesPage.tsx
├─ hooks/                # usePieces, useStocks, useMouvements...
├─ lib/                  # formatters (devise, date), helpers
├─ routes.tsx
└─ main.tsx
```

---

## 3. Pages & écrans (MVP)

| Page | Route | Rôles | Description |
|---|---|---|---|
| Connexion | `/login` | public | Formulaire e-mail / mot de passe |
| **Recherche pièce** | `/` | tous | Champ référence → tableau agence/quantité + **total** (écran phare) |
| Liste pièces | `/pieces` | tous | Catalogue + recherche, export Excel |
| Stocks | `/stocks` | tous* | Vue stock par agence, filtres, export |
| Mouvements | `/mouvements` | admin, responsable, vendeur | Entrée/sortie/transfert/annulation + historique |
| Import | `/import` | admin, responsable | Drag & drop Excel + rapport d'import |
| Utilisateurs | `/admin/users` | admin | Gestion comptes |
| Agences | `/admin/agences` | admin | Gestion agences |

\* filtré sur l'agence de l'utilisateur côté API.

---

## 4. Écran phare — Recherche pièce

```
┌───────────────────────────────────────────────┐
│  🔎  [ CAT001                     ] [Rechercher]│
├───────────────────────────────────────────────┤
│  Filtre hydraulique — origine: Japon           │
│                                                 │
│   Agence        Quantité                        │
│   ───────────────────────                       │
│   Alger            25                           │
│   Oran             12                           │
│   Blida             7                           │
│   ───────────────────────                       │
│   TOTAL            44     [ Exporter Excel ]     │
└───────────────────────────────────────────────┘
```

- Recherche déclenchée à la saisie (debounce) ou au bouton.
- État vide, état chargement (skeleton), état « référence introuvable ».
- Bouton **Exporter** → télécharge la vue courante en `.xlsx`.

---

## 5. Composant Import Excel (`ExcelImport.tsx`)

- Zone **drag & drop** + sélecteur de fichier (`.xlsx` uniquement).
- Affiche : nom du fichier, taille, agence cible (si responsable → verrouillée sur son agence).
- Après envoi : **rapport** sous forme de tableau
  `ligne | référence | quantité | statut (créée / cumulée / erreur) | message`.
- Lien « Télécharger le modèle » (`/api/excel/template/stock`).

---

## 6. Gestion d'état & data fetching

- **AuthContext** : stocke `user` + `token` (token en mémoire + refresh depuis `localStorage` au boot ; voir sécurité).
- **TanStack Query** : clés `['pieces']`, `['piece', ref]`, `['stocks', filters]`, `['mouvements', filters]`.
- Invalidation après mutation (import, mouvement) pour rafraîchir les vues.
- **Optimistic UI** non requis au MVP (rester simple).

---

## 7. UX transverse

- **Navigation** : sidebar à gauche (items filtrés selon le rôle), topbar avec nom + déconnexion.
- **Notifications** : `react-hot-toast` (succès import, erreurs).
- **Tableaux** : tri par colonne, pagination, recherche locale.
- **Formulaires** : validation inline, messages en français, focus sur erreur.
- **Responsive** : utilisable sur tablette ; mobile = consultation prioritaire.

---

## 8. Accessibilité (niveau MVP)

- Labels explicites sur tous les champs.
- Navigation clavier sur formulaires et tableaux.
- Contrastes conformes (voir thème).
- `aria-live` pour les toasts et le rapport d'import.

---

## 9. Tests frontend (MVP léger)

- Tests composant clés (`RecherchePiecePage`, `ExcelImport`) avec Vitest + Testing Library.
- Test du flux login (mock API).
- Smoke test du routing protégé par rôle.
