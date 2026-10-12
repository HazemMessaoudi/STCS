# STCS — Site vitrine

Site statique (HTML/CSS/JS, sans build) de la Société Tunisienne de Clôture & Sécurité.

| Fichier | Rôle |
|---|---|
| `index.html` / `index-ar.html` | Pages FR et AR |
| `products.js` | **Produits, prix et photos de la galerie** (source unique pour les deux langues) |
| `script.js` | Catalogue, filtres, carrousels, galerie, calculateur de devis WhatsApp |
| `styles.css` | Styles (FR + AR) |
| `assets/vendor/lenis.min.js` | Défilement fluide (Lenis 1.1.13, licence MIT) |

## Modifier un prix ou un produit
Éditer uniquement `products.js`. Les cartes, le calculateur et le message WhatsApp
se mettent à jour automatiquement en français et en arabe.

## Ajouter une photo à la galerie
1. Copier la photo dans `assets/images-catalogue/<nom>.jpg`
2. Créer une miniature d'environ 600 px en WebP : `assets/images-catalogue/thumbs/<nom>.webp`
3. Ajouter `<nom>` dans la liste `STCS_GALLERY` de `products.js`

## Photos produits
Format WebP dans `assets/products/` (sans espaces dans les noms), référencées par leur nom dans `products.js`.

## Mise en ligne
Domaine : **https://www.stcs.tn** (fichier `CNAME` pour GitHub Pages).
`robots.txt` et `sitemap.xml` sont prêts pour Google Search Console.
Si le domaine change, mettre à jour les URL dans le `<head>` des deux pages, `sitemap.xml`, `robots.txt` et `CNAME`.
