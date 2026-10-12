#!/usr/bin/env node
/* ============================================
   STCS — Génère les fiches produits + sitemap.xml
   --------------------------------------------
   Usage :  node tools/build-pages.js

   - Lit products.js (produits, textes, prix)
   - Utilise index.html / index-ar.html comme modèles (en-tête, devis, contact…)
   - Écrit <slug>.html et <slug>-ar.html à la racine, puis sitemap.xml

   Les prix affichés sur les fiches sont lus en direct depuis products.js
   par script.js : il n'est nécessaire de relancer ce script que si l'on
   ajoute/renomme un produit ou si l'on modifie ses textes.
   (Les prix du bloc JSON-LD pour Google, eux, sont figés à la génération.)
   ============================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.stcs.tn/";
const WHATSAPP = "21628545844";

// --- Charger products.js (fichier navigateur) ---
const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, "products.js"), "utf8") + "\nthis.STCS_PRODUCTS = STCS_PRODUCTS;",
  ctx
);
const PRODUCTS = ctx.STCS_PRODUCTS;

const LANGS = {
  fr: {
    template: "index.html",
    home: "index.html",
    suffix: "",
    locale: "fr_TN",
    t: {
      home: "Accueil",
      products: "Produits",
      breadcrumb: "Fil d'Ariane",
      titleSuffix: " — Prix en Tunisie | STCS",
      metaSuffix: " Prix en ligne, devis instantané et livraison dans toute la Tunisie.",
      quote: "Calculer mon devis",
      whatsapp: "Commander sur WhatsApp",
      waText: (name) => `Bonjour STCS, je suis intéressé(e) par : ${name}`,
      others: "Nos autres produits",
      noscript: "Activez JavaScript pour afficher les prix, ou contactez-nous au",
      generated: "Page générée par tools/build-pages.js à partir de products.js — ne pas modifier à la main."
    }
  },
  ar: {
    template: "index-ar.html",
    home: "index-ar.html",
    suffix: "-ar",
    locale: "ar_TN",
    t: {
      home: "الرئيسية",
      products: "المنتجات",
      breadcrumb: "مسار التصفح",
      titleSuffix: " — الأسعار في تونس | STCS",
      metaSuffix: " الأسعار على الموقع، تسعيرة فورية وتوصيل لكامل تونس.",
      quote: "احسب التسعيرة",
      whatsapp: "اطلب عبر واتساب",
      waText: (name) => `مرحباً STCS، أنا مهتم بـ: ${name}`,
      others: "منتجاتنا الأخرى",
      noscript: "يرجى تفعيل JavaScript لعرض الأسعار، أو اتصلوا بنا على",
      generated: "Page générée par tools/build-pages.js à partir de products.js — ne pas modifier à la main."
    }
  }
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pageFile = (p, lang) => `${p.slug}${LANGS[lang].suffix}.html`;
const pageUrl = (p, lang) => SITE + pageFile(p, lang);
const homeUrl = (lang) => (lang === "fr" ? SITE : SITE + "index-ar.html");

function replaceOnce(html, re, replacement, what) {
  if (!re.test(html)) throw new Error(`Modèle : élément introuvable (${what})`);
  return html.replace(re, replacement);
}

function jsonLd(p, lang) {
  const L = LANGS[lang];
  const prices = p.variants.map((v) => v.price);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: p.name[lang],
        description: p.intro[lang],
        url: pageUrl(p, lang),
        image: p.images.map((img) => `${SITE}assets/products/${img}.webp`),
        brand: { "@type": "Brand", name: "STCS" },
        category: p.group[lang],
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "TND",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: p.variants.length,
          seller: { "@type": "Organization", name: "STCS", url: SITE }
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: L.t.home, item: homeUrl(lang) },
          { "@type": "ListItem", position: 2, name: L.t.products, item: homeUrl(lang) + "#products" },
          { "@type": "ListItem", position: 3, name: p.name[lang], item: pageUrl(p, lang) }
        ]
      }
    ]
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function buildPage(p, lang, template) {
  const L = LANGS[lang];
  const t = L.t;
  const title = p.name[lang] + t.titleSuffix;
  const desc = p.desc[lang] + t.metaSuffix;
  let html = template;

  html = html.replace("<head>", `<head>\n<!-- ${t.generated} -->`);
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, "title");
  html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(desc)}" />`, "meta description");
  html = replaceOnce(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="product" />`, "og:type");
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`, "og:title");
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(desc)}" />`, "og:description");
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${pageUrl(p, lang)}" />`, "og:url");
  html = replaceOnce(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${SITE}assets/products/${p.images[0]}.webp" />`, "og:image");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${pageUrl(p, lang)}" />`, "canonical");
  html = replaceOnce(html, /<link rel="alternate" hreflang="fr" href="[^"]*" \/>/, `<link rel="alternate" hreflang="fr" href="${pageUrl(p, "fr")}" />`, "hreflang fr");
  html = replaceOnce(html, /<link rel="alternate" hreflang="ar" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ar" href="${pageUrl(p, "ar")}" />`, "hreflang ar");
  html = replaceOnce(html, /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${pageUrl(p, "fr")}" />`, "hreflang x-default");
  html = replaceOnce(html, /<link rel="preload" as="image" href="[^"]*" \/>\n/, "", "preload");
  html = replaceOnce(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => jsonLd(p, lang), "JSON-LD");

  // Lien d'évitement et navigation : vers les sections de la page d'accueil
  html = replaceOnce(html, /<a class="skip-link" href="#products">/, `<a class="skip-link" href="#produit">`, "skip-link");
  html = replaceOnce(html, /<nav class="nav-links"[\s\S]*?<\/nav>/, (nav) => nav.replace(/href="#/g, `href="${L.home}#`), "nav");
  html = replaceOnce(html, /<a href="#top" class="nav-brand">/, `<a href="${L.home}" class="nav-brand">`, "nav-brand");

  // Sélecteur de langue : vers la même fiche dans l'autre langue
  html = replaceOnce(html, /<div class="lang-switcher">[\s\S]*?<\/div>/, (sw) =>
    sw.replace(/href="index\.html"/, `href="${pageFile(p, "fr")}"`).replace(/href="index-ar\.html"/, `href="${pageFile(p, "ar")}"`), "lang-switcher");

  // Contenu principal : fiche produit + autres produits + contact/pied de page du modèle
  const mainMatch = html.match(/<main id="top">[\s\S]*?<\/main>/);
  if (!mainMatch) throw new Error("Modèle : <main> introuvable");
  const contact = mainMatch[0].match(/  <!-- CONTACT -->[\s\S]*?<\/footer>/);
  if (!contact) throw new Error("Modèle : section contact/footer introuvable");

  const others = PRODUCTS.filter((x) => x.id !== p.id)
    .map((x) => `        <li><a href="${pageFile(x, lang)}">${esc(x.name[lang])}<span aria-hidden="true">${lang === "ar" ? "←" : "→"}</span></a></li>`)
    .join("\n");

  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t.waText(p.name[lang]))}`;

  const main = `<main id="top">

  <!-- FICHE PRODUIT -->
  <section class="product-page" id="produit">
    <nav class="breadcrumb" aria-label="${esc(t.breadcrumb)}">
      <a href="${L.home}">${esc(t.home)}</a><span aria-hidden="true">/</span>
      <a href="${L.home}#products">${esc(t.products)}</a><span aria-hidden="true">/</span>
      <span aria-current="page">${esc(p.name[lang])}</span>
    </nav>

    <div class="product-page-grid">
      <div class="product-page-text">
        <span class="eyebrow">${esc(p.catLabel[lang])}</span>
        <h1 class="product-page-title">${esc(p.name[lang])}</h1>
        <p class="product-page-lead">${esc(p.intro[lang])}</p>
        <ul class="product-page-points">
${p.points[lang].map((pt) => `          <li>${esc(pt)}</li>`).join("\n")}
        </ul>
        <div class="product-page-actions">
          <button type="button" class="btn btn--primary" data-open-modal="modale-devis" aria-haspopup="dialog">${esc(t.quote)}</button>
          <a class="btn btn--whatsapp" href="${waHref}" target="_blank" rel="noopener noreferrer">${esc(t.whatsapp)}</a>
        </div>
      </div>

      <!-- Carte produit avec photos et prix, générée depuis products.js -->
      <div class="product-detail" id="productDetail" data-product="${p.id}"></div>
    </div>
    <noscript>
      <p class="noscript-msg">${esc(t.noscript)} <a href="tel:+${WHATSAPP}" dir="ltr">28 545 844</a>.</p>
    </noscript>
  </section>

  <!-- AUTRES PRODUITS -->
  <section class="related">
    <h2 class="related-title">${esc(t.others)}</h2>
    <ul class="related-list">
${others}
    </ul>
  </section>

${contact[0]}
</main>`;

  html = html.replace(mainMatch[0], () => main);

  // La galerie n'existe pas sur les fiches : on retire la lightbox
  html = html.replace(/<!-- LIGHTBOX[\s\S]*?<\/div>\n\n/, "");
  return html;
}

// --- Génération ---
const written = [];
for (const lang of Object.keys(LANGS)) {
  const template = fs.readFileSync(path.join(ROOT, LANGS[lang].template), "utf8");
  for (const p of PRODUCTS) {
    if (!p.slug || !p.intro || !p.points) throw new Error(`Produit "${p.id}" : slug, intro ou points manquant dans products.js`);
    const file = pageFile(p, lang);
    fs.writeFileSync(path.join(ROOT, file), buildPage(p, lang, template));
    written.push(file);
  }
}

// --- sitemap.xml ---
const today = new Date().toISOString().slice(0, 10);
const entry = (fr, ar) => [fr, ar].map((loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${ar}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${fr}" />
  </url>`).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(homeUrl("fr"), homeUrl("ar"))}
${PRODUCTS.map((p) => entry(pageUrl(p, "fr"), pageUrl(p, "ar"))).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);

console.log(`${written.length} fiches produits générées :\n  ${written.join("\n  ")}\nsitemap.xml mis à jour (${2 + PRODUCTS.length * 2} pages).`);
