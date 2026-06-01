# MVP — Import / Export Excel

> L'Excel est **central** : présent à chaque couche (pièces, stocks, mouvements). Bibliothèque : **SheetJS (`xlsx`)**.

## 1. Format du fichier d'import (stock)

Basé sur la description de `docs/stock.txt`.

| Colonne Excel | Champ | Obligatoire | Notes |
|---|---|---|---|
| `reference` | `pieces.reference` | ✅ | identifiant unique |
| `nom` | `pieces.nom` | ✅ (si création) | désignation |
| `quantite` | quantité à **ajouter** | ✅ | entier > 0 |
| `pays_origine` | `pieces.pays_origine` | ❌ | |
| `pays_importation` | `pieces.pays_importation` | ❌ | |
| `prix_unitaire` | `pieces.prix_unitaire` | ❌ | EUR ou USD |
| `devise` | `pieces.devise` | ❌ | `USD`/`EUR`/`DZD` |
| `prix_ht` | `pieces.prix_ht` | ❌ | hors taxe |
| `prix_ttc` | `pieces.prix_ttc` | ❌ | avec taxe |

- L'**agence cible** est : soit l'agence du responsable (forcée), soit choisie par l'admin dans l'UI (pas dans le fichier, pour éviter les erreurs).
- En-têtes insensibles à la casse et aux accents (normalisation).

---

## 2. Algorithme d'import

```text
1. Réception fichier (multer) → validation type/taille
2. Lecture feuille active (xlsx.read) → tableau de lignes (sheet_to_json)
3. Normalisation des en-têtes
4. Pour chaque ligne (dans UNE transaction globale, ou par lot) :
   a. Valider (Zod) : reference non vide, quantite entier > 0
   b. Chercher la pièce par reference
      - si absente → créer la pièce (nom requis, sinon erreur ligne)
      - mettre à jour les champs prix/pays si fournis (optionnel)
   c. Upsert stock (piece_id, agence_id) :
      - quantite_existante + quantite_importee  (CUMUL)
   d. Insérer mouvement type='entree' (agence_dest = agence cible)
   e. Consigner le résultat ligne : créée / cumulée / erreur(message)
5. Renvoyer un RAPPORT : { totalLignes, creees, cumulees, erreurs[] }
```

### Règle de cumul (rappel)
`CAT001 = 20` existant + import `CAT001 = 10` ⇒ **30**.

### Gestion des erreurs partielles
- Une ligne invalide **n'annule pas** tout l'import : elle est listée dans le rapport (stratégie « best effort » par lot).
- Option stricte (tout ou rien) configurable ultérieurement.

---

## 3. Modèle d'import téléchargeable

- Endpoint `GET /api/excel/template/stock` → `.xlsx` avec en-têtes + 1 ligne d'exemple + feuille « instructions ».
- Aide l'utilisateur à respecter le format.

---

## 4. Exports

| Export | Endpoint | Contenu |
|---|---|---|
| Stock courant | `GET /api/excel/export/stock` | reference, nom, agence, quantité (filtré par rôle) |
| Catalogue pièces | `GET /api/excel/export/pieces` | toutes les infos pièce |
| Mouvements | `GET /api/excel/export/mouvements` | type, référence, quantité, agences, date, utilisateur, motif |
| Vue consultation | bouton sur l'écran recherche | reference, agence, quantité, total |

- Génération via `xlsx.utils.json_to_sheet` + `xlsx.write` (buffer) → réponse avec en-têtes
  `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  `Content-Disposition: attachment; filename="export_stock_AAAA-MM-JJ.xlsx"`.
- Respecte le **scope agence** (un responsable n'exporte que son agence).

---

## 5. Cohérence import ⇄ export

- Le fichier exporté de stock doit être **réimportable** (mêmes en-têtes).
- Test d'intégration : export → réimport → quantités cohérentes (en tenant compte du cumul).

---

## 6. Service Excel (backend)

```
modules/excel/
├─ excel.controller.ts
├─ excel.service.ts      # parse, build, mapping en-têtes
├─ excel.import.ts       # logique d'import (cumul + création auto)
├─ excel.export.ts       # génération des classeurs
└─ excel.schema.ts       # Zod des lignes
```

---

## 7. Limites connues (MVP)

- Une seule feuille traitée à l'import.
- Pas de gestion des marques compatibles dans l'import MVP (reporté à `../full/`).
- Détection d'en-têtes basique (mapping fixe + normalisation).
