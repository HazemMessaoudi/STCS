/* ============================================
   STCS — Catalogue (source unique des produits et des prix)
   --------------------------------------------
   Modifier un prix ICI met à jour automatiquement :
   - les cartes produits (FR + AR)
   - le calculateur de devis (FR + AR)
   - le message WhatsApp envoyé
   ============================================

   measure : "length" → le client saisit un périmètre en mètres,
             la quantité = arrondi supérieur (périmètre / cover)
             "weight" → le client saisit directement un poids en kg
   cover   : mètres couverts par une unité vendue (rouleau, panneau)
*/

const STCS_PRODUCTS = [
  {
    id: "simple",
    cat: "grillages",
    subcat: "simple",
    images: ["simple-torsion-1", "simple-torsion-2", "simple-torsion-3"],
    measure: "length",
    name: { fr: "Grillage Simple Torsion", ar: "شباك التسييج البسيط" },
    group: { fr: "Grillage Simple Torsion", ar: "شباك بسيط الفتل" },
    catLabel: { fr: "Catégorie : Simple Torsion", ar: "صنف : بسيط الفتل (Simple Torsion)" },
    desc: {
      fr: "Grillage souple et économique, idéal pour délimiter vos terrains. Résistant à la corrosion et facile d'installation.",
      ar: "شباك مرن واقتصادي مثالي للمزارع والحدائق. مقاوم للصدأ وسهل التركيب."
    },
    unit: { fr: "RLX", ar: "لفة" },
    cartUnit: { fr: "rouleaux", ar: "لفة" },
    variants: [
      { id: "st-1", cover: 25, price: 210, spec: { fr: "H: 1,5m • L: 25m • 2,0 mm", ar: "ارتفاع: 1,5م • طول: 25م • 2,0 مم" }, option: { fr: "Simple Torsion (H:1,5m / 2,0mm)", ar: "بسيط الفتل (1,5م / 2,0مم)" } },
      { id: "st-2", cover: 25, price: 250, spec: { fr: "H: 1,5m • L: 25m • 2,2 mm", ar: "ارتفاع: 1,5م • طول: 25م • 2,2 مم" }, option: { fr: "Simple Torsion (H:1,5m / 2,2mm)", ar: "بسيط الفتل (1,5م / 2,2مم)" } },
      { id: "st-3", cover: 25, price: 250, spec: { fr: "H: 2,0m • L: 25m • 2,0 mm", ar: "ارتفاع: 2,0م • طول: 25م • 2,0 مم" }, option: { fr: "Simple Torsion (H:2,0m / 2,0mm)", ar: "بسيط الفتل (2,0م / 2,0مم)" } },
      { id: "st-4", cover: 25, price: 270, spec: { fr: "H: 2,0m • L: 25m • 2,2 mm", ar: "ارتفاع: 2,0م • طول: 25م • 2,2 مم" }, option: { fr: "Simple Torsion (H:2,0m / 2,2mm)", ar: "بسيط الفتل (2,0م / 2,2مم)" } }
    ]
  },
  {
    id: "double",
    cat: "grillages",
    subcat: "double",
    images: ["double-torsion-1", "double-torsion-2", "double-torsion-3"],
    measure: "length",
    name: { fr: "Grillage Double Torsion", ar: "شباك مزدوج الفتل" },
    group: { fr: "Grillage Double Torsion", ar: "شباك مزدوج الفتل" },
    catLabel: { fr: "Catégorie : Double Torsion", ar: "صنف : مزدوج الفتل (Double Torsion)" },
    desc: {
      fr: "Maillage ultra-robuste conçu pour un usage intensif, les murs de soutènement et une protection maximale contre les intrusions.",
      ar: "شباك فائق المتانة مصمم للاستخدام المكثف، دعم الجدران، والحماية القصوى."
    },
    unit: { fr: "RLX", ar: "لفة" },
    cartUnit: { fr: "rouleaux", ar: "لفة" },
    variants: [
      { id: "dt-1", cover: 50, price: 320, spec: { fr: "H: 2,0m • L: 50m • 1,6 mm", ar: "ارتفاع: 2,0م • طول: 50م • 1,6 مم" }, option: { fr: "Double Torsion (H:2,0m / 1,6mm)", ar: "مزدوج الفتل (2,0م / 1,6مم)" } },
      { id: "dt-2", cover: 50, price: 220, spec: { fr: "H: 1,5m • L: 50m • 1,6 mm", ar: "ارتفاع: 1,5م • طول: 50م • 1,6 مم" }, option: { fr: "Double Torsion (H:1,5m / 1,6mm)", ar: "مزدوج الفتل (1,5م / 1,6مم)" } },
      { id: "dt-3", cover: 20, price: 135, spec: { fr: "G.M • H: 2,0m • L: 20m • 2,0 mm", ar: "G.M • ارتفاع: 2,0م • طول: 20م • 2,0 مم" }, option: { fr: "Double Torsion G.M (H:2,0m / 2,0mm)", ar: "مزدوج الفتل G.M (2,0م / 2,0مم)" } },
      { id: "dt-4", cover: 20, price: 120, spec: { fr: "G.M • H: 1,5m • L: 20m • 2,0 mm", ar: "G.M • ارتفاع: 1,5م • طول: 20م • 2,0 مم" }, option: { fr: "Double Torsion G.M (H:1,5m / 2,0mm)", ar: "مزدوج الفتل G.M (1,5م / 2,0مم)" } }
    ]
  },
  {
    id: "rigide",
    cat: "grillages",
    subcat: "rigide",
    images: ["panneau-1", "panneau-2"],
    measure: "length",
    name: { fr: "Panneaux Rigides", ar: "ألواح سياج صلبة (Panneaux)" },
    group: { fr: "Panneaux Rigides", ar: "ألواح سياج صلبة" },
    catLabel: { fr: "Catégorie : Grillage Rigide", ar: "صنف : شباك صلب (Grillage Rigide)" },
    desc: {
      fr: "Clôture moderne en treillis soudé conçue pour allier robustesse, durabilité et apparence professionnelle.",
      ar: "سياج حديث ملحوم مصمم ليجمع بين القوة، المتانة، والمظهر الاحترافي."
    },
    unit: { fr: "Panneau", ar: "لوح" },
    cartUnit: { fr: "panneaux", ar: "لوح" },
    variants: [
      { id: "pr-1", cover: 2.5, price: 140, spec: { fr: "H: 1,5m • L: 2,5m • 4 mm", ar: "ارتفاع: 1,5م • طول: 2,5م • 4 مم" }, option: { fr: "Panneau Rigide (H:1,5m / 4mm)", ar: "شباك صلب (1,5م / 4مم)" } },
      { id: "pr-2", cover: 2.5, price: 160, spec: { fr: "H: 2,0m • L: 2,5m • 4 mm", ar: "ارتفاع: 2,0م • طول: 2,5م • 4 مم" }, option: { fr: "Panneau Rigide (H:2,0m / 4mm)", ar: "شباك صلب (2,0م / 4مم)" } }
    ]
  },
  {
    id: "barbele",
    cat: "accessoires",
    images: ["fil-barbele-1", "fil-barbele-2"],
    measure: "length",
    name: { fr: "Fil Barbelé", ar: "سلك شائك" },
    group: { fr: "Accessoires (Fils)", ar: "إكسسوارات (أسلاك)" },
    catLabel: { fr: "Catégorie : Accessoires", ar: "صنف : إكسسوارات" },
    desc: {
      fr: "Fil barbelé offrant une résistance maximale. Commercialisé au rouleau (RLX) pour sécuriser vos périmètres.",
      ar: "سلك شائك يضمن حماية قصوى لمحيطك. يُباع باللفة (RLX)."
    },
    unit: { fr: "RLX", ar: "لفة" },
    cartUnit: { fr: "rouleaux", ar: "لفة" },
    variants: [
      { id: "fb-1", cover: 200, price: 60, spec: { fr: "Longueur : 200m • 1,6 mm", ar: "الطول: 200م • 1,6 مم" }, option: { fr: "Fil Barbelé (200m / 1,6mm)", ar: "سلك شائك (200م / 1,6مم)" } },
      { id: "fb-2", cover: 200, price: 80, spec: { fr: "Longueur : 200m • 1,8 mm", ar: "الطول: 200م • 1,8 مم" }, option: { fr: "Fil Barbelé (200m / 1,8mm)", ar: "سلك شائك (200م / 1,8مم)" } }
    ]
  },
  {
    id: "galvanise",
    cat: "accessoires",
    images: ["fil-galvanise-1", "fil-galvanise-2", "fil-galvanise-3"],
    measure: "weight",
    name: { fr: "Fil Galvanisé", ar: "سلك مجلفن" },
    group: { fr: "Accessoires (Fils)", ar: "إكسسوارات (أسلاك)" },
    catLabel: { fr: "Catégorie : Accessoires", ar: "صنف : إكسسوارات" },
    desc: {
      fr: "Fil lisse galvanisé à chaud, idéal comme fil de tension ou usage agricole. Vendu au poids (kg).",
      ar: "سلك أملس مجلفن على الساخن لأسلاك الشد أو الاستخدام الزراعي. يُباع بالكيلوغرام."
    },
    unit: { fr: "kg", ar: "كغ" },
    cartUnit: { fr: "kg", ar: "كغ" },
    variants: [
      { id: "fg-1", cover: 1, price: 6.5, spec: { fr: "Épaisseur : 1,3 mm", ar: "السماكة: 1,3 مم" }, option: { fr: "Fil Galvanisé (1,3mm)", ar: "سلك مجلفن (1,3مم)" } },
      { id: "fg-2", cover: 1, price: 6, spec: { fr: "Épaisseur : 2,7 mm", ar: "السماكة: 2,7 مم" }, option: { fr: "Fil Galvanisé (2,7mm)", ar: "سلك مجلفن (2,7مم)" } },
      { id: "fg-3", cover: 1, price: 5, spec: { fr: "Épaisseur : 4,9 mm", ar: "السماكة: 4,9 مم" }, option: { fr: "Fil Galvanisé (4,9mm)", ar: "سلك مجلفن (4,9مم)" } }
    ]
  }
];

/* Photos de la galerie « Nos Réalisations ».
   Pour chaque nom ci-dessous il faut :
   - assets/images-catalogue/<nom>.jpg          (image agrandie)
   - assets/images-catalogue/thumbs/<nom>.webp  (miniature ~600px) */
const STCS_GALLERY = [
  "01338795-bb1f-4131-be3f-d21243b180a0",
  "06581291-57f6-4cbc-8744-97b2713dc25d",
  "20982cc2-c19c-4219-8c89-cc1c63fee3d7",
  "3bbed116-a3bd-44f8-a8c8-9ad8b4cfa02e",
  "3d64b174-d910-4d99-a7f7-183e6d06b529",
  "3ecfc0c2-a2b8-41d0-ab72-cc8af019879b",
  "520d0a71-1371-4eac-9f3b-93aa6c4d9c35",
  "540ce16c-b070-4b2f-814c-90aeb300b769",
  "54de8536-58e6-4b68-af38-03b752409057",
  "61843a8c-b379-45bf-be97-400a5e32a5f9",
  "6b3ff609-3665-49e1-aca3-527490ded0ed",
  "76d2297f-5da6-4991-bf80-dba9a239b669",
  "a3a17b51-1d09-4101-9da6-70420243a998",
  "a8155929-8661-4ff7-803f-c7968302a473",
  "b02d3769-f992-401d-81f5-24158449786b",
  "b755da51-4420-4193-8458-62cc646b0237",
  "b999b80c-f826-44c4-afe3-ed36bea50bb5",
  "ba533a18-679c-4b5d-bc7b-6109ff1af41c",
  "bc7624f3-8d6f-4463-b8bb-d7a6725439ed",
  "bcebdb94-44e9-4076-ab97-23f984b6860d",
  "c2299912-2816-4d3f-a0aa-eb52bffe1d30",
  "cef9cb5e-80ea-44fc-8cd5-2a4676541f6e",
  "defe9818-6178-4f75-b6ed-91019d9abf98",
  "e4e7de17-d385-4b2a-be4e-e73ed8fd98ee",
  "ffaed66a-e999-4f5f-b8d8-3370283713b5"
];
