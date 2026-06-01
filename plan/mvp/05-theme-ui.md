# MVP — Thème & Design System

## 1. Identité visuelle

Univers **industriel / pièces d'engins** : sérieux, lisible, efficace. Palette sobre avec un bleu de confiance et un orange « machinerie » comme accent.

---

## 2. Palette de couleurs

| Token | Hex | Usage |
|---|---|---|
| `primary-600` | `#1D4ED8` | actions principales, liens |
| `primary-700` | `#1E40AF` | hover boutons |
| `primary-50` | `#EFF6FF` | fonds doux, surbrillance |
| `accent-500` | `#F97316` | accent (machinerie), badges |
| `success-600` | `#16A34A` | entrées, succès |
| `danger-600` | `#DC2626` | sorties, erreurs, suppression |
| `warning-500` | `#F59E0B` | alertes, stock faible |
| `neutral-900` | `#0F172A` | texte principal |
| `neutral-600` | `#475569` | texte secondaire |
| `neutral-200` | `#E2E8F0` | bordures |
| `neutral-50` | `#F8FAFC` | fond de page |
| `surface` | `#FFFFFF` | cartes, tableaux |

> **Code couleur des mouvements** : entrée = vert, sortie = rouge, transfert = bleu, annulation = gris/orange.

---

## 3. Typographie

| Élément | Police | Taille | Poids |
|---|---|---|---|
| Titres | `Inter` | 20–28px | 600/700 |
| Corps | `Inter` | 14–16px | 400/500 |
| Données / chiffres | `Inter` (tabular-nums) | 14–16px | 500 |
| Monospace (références) | `JetBrains Mono` | 13–14px | 500 |

- Activer `font-variant-numeric: tabular-nums` sur les colonnes de quantités/prix pour l'alignement.

---

## 4. Tokens Tailwind (`tailwind.config.ts`)

```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { 50:'#EFF6FF', 600:'#1D4ED8', 700:'#1E40AF' },
        accent:  { 500:'#F97316' },
        success: { 600:'#16A34A' },
        danger:  { 600:'#DC2626' },
        warning: { 500:'#F59E0B' },
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      boxShadow: { card: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06)' },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'], mono: ['JetBrains Mono','monospace'] },
    },
  },
}
```

---

## 5. Composants UI de base (MVP)

| Composant | Variantes |
|---|---|
| `Button` | primary, secondary, ghost, danger ; tailles sm/md ; état loading |
| `Input` / `Select` | label, erreur, hint |
| `Table` | en-tête sticky, tri, ligne hover, pagination |
| `Card` | titre + contenu + footer |
| `Badge` | success/danger/info/warning (statut mouvement, rôle) |
| `Modal` | confirmation (annulation, transfert) |
| `Toast` | succès / erreur |
| `EmptyState` | « aucune donnée », « référence introuvable » |
| `Skeleton` | chargement tableaux |

---

## 6. Layout

```
┌──────────────────────────────────────────────┐
│ Topbar : logo · titre page ·  [user ▼]        │
├────────────┬─────────────────────────────────┤
│ Sidebar    │  Contenu (PageHeader + corps)    │
│ - Recherche│                                   │
│ - Pièces   │                                   │
│ - Stocks   │                                   │
│ - Mouvts   │                                   │
│ - Import   │                                   │
│ - Admin ▸  │                                   │
└────────────┴─────────────────────────────────┘
```

- Largeur sidebar 240px, repliable.
- Espacement basé sur une échelle de 4px (Tailwind `space`).
- Cartes `rounded-2xl shadow-card` sur fond `neutral-50`.

---

## 7. États & feedback

- **Loading** : skeletons pour tableaux, spinner sur boutons.
- **Erreur** : bandeau rouge + message clair en français.
- **Succès** : toast vert (ex. « Import terminé : 12 lignes, 3 pièces créées »).
- **Vide** : illustration simple + appel à l'action.

---

## 8. Thème sombre

- **Non inclus dans le MVP** (token prêts mais une seule palette claire livrée).
- Prévu dans la version complète (`../full/`).
