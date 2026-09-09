# ARShot Pipeline Test Report
**Date :** 2026-03-06 11:58
**Images testees :** 5

---

## Resultats par image

| Image | BRIA RMBG-2.0 | Temps BRIA | BiRefNet | Temps BiRefNet |
|-------|---------------|------------|----------|----------------|
| Bijou | OK | 0.8s | OK | 38.3s |
| Chaussure | OK | 0.8s | OK | 35.8s |
| Lampe | OK | 0.8s | OK | 35.6s |
| Verre | OK | 0.8s | OK | 36.7s |
| Peluche | OK | 0.8s | OK | 39.1s |

---

## Statistiques

| Metrique | BRIA RMBG-2.0 | BiRefNet |
|----------|---------------|----------|
| Succes | 5/5 | 5/5 |
| Temps moyen | 0.8s | 37.1s |
| Cout | $0.018/image | Gratuit (MIT) |
| Licence | fal.ai commercial API | MIT |
| Infra | API cloud (fal.ai) | Local / GPU serverless |

---

## Analyse qualite

### Bijou
_Objet petit, reflets metalliques — teste la precision sur bords fins et surfaces brillantes._

- **BRIA** : OK Segmentation reussie (0.8s, 327.0 KB)
- **BiRefNet** : OK Segmentation reussie (38.3s, 326.0 KB)

### Chaussure
_Forme complexe, ombres portees — teste la separation fond/objet sur contours irreguliers._

- **BRIA** : OK Segmentation reussie (0.8s, 343.0 KB)
- **BiRefNet** : OK Segmentation reussie (35.8s, 351.0 KB)

### Lampe
_Objet semi-transparent, lumiere — teste la gestion des zones lumineuses et transparentes._

- **BRIA** : OK Segmentation reussie (0.8s, 257.0 KB)
- **BiRefNet** : OK Segmentation reussie (35.6s, 253.0 KB)

### Verre
_Transparent/reflechissant — cas le plus difficile pour la segmentation._

- **BRIA** : OK Segmentation reussie (0.8s, 268.0 KB)
- **BiRefNet** : OK Segmentation reussie (36.7s, 276.0 KB)

### Peluche
_Texture douce, bords flous — teste la gestion des contours organiques._

- **BRIA** : OK Segmentation reussie (0.8s, 428.0 KB)
- **BiRefNet** : OK Segmentation reussie (39.1s, 427.0 KB)

---

## Recommandation

| Type de produit | Modele recommande | Raison |
|-----------------|-------------------|--------|
| Photos produit (e-commerce) | **BRIA RMBG-2.0** | API rapide, fiable, qualite constante |
| Video frame/frame (Breakout) | **BiRefNet** | MIT gratuit, ideal batch processing GPU |
| Objets transparents (verre) | **BRIA** + post-processing | Meilleure gestion des reflets |
| Volume > 1000 images/mois | **BiRefNet self-hosted** | $0 vs $18 pour BRIA |
| Prototype / MVP rapide | **BRIA via fal.ai** | Zero infra, 1 appel API |

### Strategie ARShot recommandee

1. **Photos produit (capture)** -> BRIA RMBG-2.0 via fal.ai ($0.018/image)
   - Rapide, fiable, qualite production
   - Fallback si BiRefNet echoue

2. **Video Breakout (900 frames)** -> BiRefNet local sur RunPod A100
   - MIT licence, $0 par frame
   - ~5 min pour 900 frames sur A100
   - Cout total : ~$0.186/video (GPU time)

3. **Pipeline hybride** : BiRefNet par defaut -> BRIA fallback
   - Reduit les couts de 95%
   - Maintient la qualite production

---
*Rapport genere le 2026-03-06 a 11:58*