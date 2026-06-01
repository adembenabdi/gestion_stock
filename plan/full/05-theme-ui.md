# Full — Thème & Design System complet

> Étend `../mvp/05-theme-ui.md` : thème clair **et** sombre, support RTL, accessibilité AA, tokens complets.

## 1. Principes de design

- **Cohérent, accessible, dense en données** (orienté gestion de stock).
- Basé sur **shadcn/ui (Radix)** + Tailwind : composants composables et accessibles.
- **Design tokens** centralisés (couleurs, espacements, rayons, ombres, typographie) → thématisables.

---

## 2. Tokens de couleur (clair / sombre)

Variables CSS (HSL) pilotées par `:root` et `.dark` :

| Token | Clair | Sombre |
|---|---|---|
| `--background` | `#F8FAFC` | `#0B1220` |
| `--surface` | `#FFFFFF` | `#111A2B` |
| `--foreground` | `#0F172A` | `#E5EAF2` |
| `--muted` | `#475569` | `#94A3B8` |
| `--border` | `#E2E8F0` | `#1E2A3C` |
| `--primary` | `#1D4ED8` | `#3B82F6` |
| `--accent` | `#F97316` | `#FB923C` |
| `--success` | `#16A34A` | `#22C55E` |
| `--danger` | `#DC2626` | `#EF4444` |
| `--warning` | `#F59E0B` | `#FBBF24` |

**Code couleur métier** (mouvements) : entrée = success, sortie = danger, transfert = primary, annulation = warning/neutral.

---

## 3. Typographie

| Élément | Police | Notes |
|---|---|---|
| UI latine | `Inter` | titres 600/700, corps 400/500 |
| UI arabe | `Cairo` / `Noto Sans Arabic` | chargée quand `lang=ar` |
| Chiffres | `tabular-nums` | alignement quantités/prix |
| Références | `JetBrains Mono` | codes pièces |

- Échelle typographique : 12 / 14 / 16 / 18 / 20 / 24 / 30.

---

## 4. Support RTL

- `dir="rtl"` sur `<html>` quand langue = arabe.
- Utiliser les **propriétés logiques** Tailwind (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
- Icônes directionnelles inversées (flèches de transfert, chevrons).
- Tests visuels FR (LTR) et AR (RTL).

---

## 5. Espacement, rayons, ombres

- Espacement : échelle 4px (`1=4px … 8=32px`).
- Rayons : `md 8px`, `lg 12px`, `xl 16px`, `2xl 20px`.
- Ombres : `card`, `popover`, `modal` (plus marquées en clair, plus subtiles en sombre).

---

## 6. Bibliothèque de composants (complet)

| Catégorie | Composants |
|---|---|
| Saisie | Input, Select, Combobox (marques), DatePicker, FileDropzone, Switch, Checkbox |
| Affichage | DataTable, Card, StatCard, Badge, Avatar, Tooltip, Tabs, Accordion |
| Feedback | Toast, Alert, Progress (import), Skeleton, EmptyState, Spinner |
| Overlay | Dialog/Modal, ConfirmDialog, Drawer, Popover, CommandPalette |
| Navigation | Sidebar (collapsible), Topbar, Breadcrumbs, Pagination |
| Data viz | LineChart, BarChart, DonutChart (Recharts) |

---

## 7. Layout responsive

- **Desktop** : sidebar fixe + contenu large (tableaux denses, dashboard multi-colonnes).
- **Tablette** : sidebar repliable.
- **Mobile** : navigation par menu, priorité consultation + déclaration de vente.
- Breakpoints Tailwind standard (`sm/md/lg/xl/2xl`).

---

## 8. États & micro-interactions

- Transitions douces (`150–200ms`), pas d'animation excessive.
- Loading : skeletons pour tableaux, progress pour imports/exports.
- Empty states explicites avec CTA.
- Feedback immédiat sur actions (toasts, optimistic où pertinent).

---

## 9. Accessibilité (WCAG 2.1 AA)

- Contraste ≥ 4.5:1 (texte), focus visibles, navigation clavier complète.
- Composants Radix : rôles ARIA, gestion focus, échappement.
- `aria-live` pour notifications et progression.
- Audit `axe` automatisé en CI ; tests manuels lecteur d'écran sur parcours clés.

---

## 10. Cohérence de marque

- Logo + favicon, page de connexion soignée.
- Style « industriel/pro » : sobre, lisible, fiable.
- Guide d'usage des couleurs métier documenté pour l'équipe.
