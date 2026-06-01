# Full — Frontend (React avancé)

> Étend `../mvp/04-frontend.md` : i18n FR/AR (RTL), thème clair/sombre, dashboard, composants riches (shadcn/ui).

## 1. Stack

- React 18 + Vite + TS, **shadcn/ui (Radix)** + Tailwind.
- TanStack Query + TanStack Table, React Hook Form + Zod.
- **i18next** (FR/AR) avec **RTL** automatique.
- Recharts/visx pour les graphiques, Playwright pour l'e2e.

---

## 2. Pages & écrans (complet)

| Page | Route | Rôles | Description |
|---|---|---|---|
| Connexion + 2FA | `/login` | public | login, challenge TOTP, mot de passe oublié |
| **Dashboard** | `/` | admin, responsable | KPIs, alertes stock bas, mouvements récents, graphiques |
| Recherche pièce | `/recherche` | tous | référence → stock par agence + total + marques + prix |
| Catalogue pièces | `/pieces` | tous | recherche avancée (marque, pays), tri, pagination, export |
| Détail pièce | `/pieces/:ref` | tous | infos complètes, marques compatibles, historique prix, stock |
| Stocks | `/stocks` | tous* | vue par agence, seuils, alertes, export |
| Mouvements | `/mouvements` | admin, responsable, vendeur | créer entrée/sortie/transfert/annulation + justificatifs |
| Historique/Audit | `/historique` | admin (global), responsable (agence) | journal filtrable + export |
| Import Excel | `/import` | admin, responsable | upload, **aperçu (dry-run)**, suivi de job, rapport |
| Marques | `/marques` | admin | gérer marques + associations |
| Utilisateurs | `/admin/users` | admin | CRUD, rôles, réinitialisation mdp, 2FA |
| Agences | `/admin/agences` | admin | CRUD agences |
| Paramètres | `/parametres` | tous | langue, thème, notifications, profil, 2FA |
| Notifications | `/notifications` | tous | liste, marquer lu |

\* filtré selon agence côté API.

---

## 3. Dashboard

- **KPIs** : nb références, total pièces en stock, nb agences, alertes actives.
- **Graphiques** : mouvements dans le temps (entrées/sorties/transferts), répartition par agence, top références.
- **Listes** : dernières opérations, alertes stock bas (lien direct vers réassort/transfert).
- Filtres par période et par agence (admin).

---

## 4. Import Excel avancé (UX)

```
1. Dépose fichier (.xlsx) + choix agence (admin) / verrouillé (responsable)
2. Mode APERÇU : tableau des changements prévus
   ligne | référence | action (créer/cumuler) | qté avant → après | statut
3. Bouton "Confirmer l'import" → job async
4. Barre de progression (polling /import/:jobId)
5. Rapport final : créées / cumulées / erreurs + bouton "Télécharger le rapport"
```

---

## 5. Internationalisation (FR / AR)

- `i18next` avec namespaces (`common`, `pieces`, `mouvements`, `auth`...).
- **RTL** : `dir="rtl"` appliqué au passage en arabe, styles Tailwind logiques (`ps-`, `pe-`, `start/end`).
- Formats de **dates, nombres, devises** localisés (`Intl`).
- Sélecteur de langue dans les paramètres + persistance.

---

## 6. Thème clair / sombre

- Toggle clair/sombre + « système », persistant (localStorage).
- Tokens de couleur déclinés pour les deux thèmes (voir `05-theme-ui.md`).
- Respect du contraste AA dans les deux modes.

---

## 7. Composants riches

| Composant | Détail |
|---|---|
| `DataTable` | tri/filtre/pagination **serveur**, sélection, export |
| `Combobox marques` | multi-sélection avec recherche |
| `FileDropzone` | upload Excel + justificatifs, validation type/taille |
| `StatCard` | KPI dashboard |
| `Charts` | lignes/barres/donut (Recharts) |
| `CommandPalette` | recherche rapide (Cmd+K) référence/marque |
| `ConfirmDialog` | actions sensibles (annulation, transfert, suppression) |
| `NotificationsBell` | badge non lus + panneau |

---

## 8. État & data

- TanStack Query (cache, invalidation après mutation, polling de jobs).
- Auth via **cookies httpOnly** (refresh) + access token en mémoire ; refresh transparent sur 401.
- Garde de routes par rôle + scope agence (UI cohérente avec l'API).

---

## 9. Accessibilité (WCAG 2.1 AA)

- Composants Radix accessibles (focus, clavier, ARIA).
- Contrastes AA (clair & sombre), focus visibles.
- Labels, `aria-live` (toasts, progression import), navigation clavier complète.
- Tests a11y automatisés (axe) dans la CI.

---

## 10. Tests frontend

- Unitaires (Vitest + Testing Library) sur composants clés.
- **e2e Playwright** : login+2FA, recherche, import (dry-run→confirm), transfert, annulation, changement de langue/thème.
- Tests a11y (axe) sur les pages principales.
