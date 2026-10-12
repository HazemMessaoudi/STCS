/* ============================================
   STCS — Scripts du site (FR + AR)
   Les produits, prix et photos viennent de products.js
   ============================================ */

const LANG = document.documentElement.lang === "ar" ? "ar" : "fr";
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const WHATSAPP_NUMBER = "21628545844";

const I18N = {
  fr: {
    currency: "DT",
    invalidQty: "Veuillez saisir une longueur ou une quantité valide.",
    perimeter: "Périmètre",
    quantity: "Quantité",
    meter: "m",
    kg: "kg",
    remove: "Supprimer",
    prevImg: "Image précédente",
    nextImg: "Image suivante",
    showImg: (i) => `Afficher l'image ${i}`,
    galleryAlt: (i, n) => `Réalisation STCS — photo ${i} sur ${n}`,
    lightboxAlt: (i, n) => `Réalisation STCS — photo ${i} sur ${n} (agrandie)`,
    waIntro: "Bonjour STCS, je souhaite un devis pour :\n\n",
    waTotal: "Total estimé"
  },
  ar: {
    currency: "د.ت",
    invalidQty: "الرجاء إدخال طول أو كمية صحيحة.",
    perimeter: "المحيط",
    quantity: "الكمية",
    meter: "م",
    kg: "كغ",
    remove: "حذف",
    prevImg: "الصورة السابقة",
    nextImg: "الصورة التالية",
    showImg: (i) => `عرض الصورة ${i}`,
    galleryAlt: (i, n) => `إنجاز STCS — صورة ${i} من ${n}`,
    lightboxAlt: (i, n) => `إنجاز STCS — صورة ${i} من ${n} (مكبرة)`,
    waIntro: "مرحباً STCS، أود طلب تسعيرة للمنتجات التالية:\n\n",
    waTotal: "المجموع التقديري"
  }
};
const T = I18N[LANG];

const formatPrice = (n) => String(n);
const formatTotal = (n) => n.toFixed(2) + " DT";

// -----------------------------------------------------
// DÉFILEMENT FLUIDE (Lenis) + verrouillage pour les fenêtres
// -----------------------------------------------------
let lenis = null;

function lockScroll() {
  document.body.style.overflow = "hidden";
  if (lenis) lenis.stop();
}

function unlockScroll() {
  document.body.style.overflow = "";
  if (lenis) lenis.start();
}

// -----------------------------------------------------
// FENÊTRES (modale devis + lightbox) : Échap, focus, clavier
// -----------------------------------------------------
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';
let activeDialog = null;
let lastFocused = null;

function openDialog(el, openClass) {
  if (!el) return;
  lastFocused = document.activeElement;
  activeDialog = { el, openClass };
  el.classList.add(openClass);
  el.setAttribute("aria-hidden", "false");
  lockScroll();
  const first = el.querySelector("[data-autofocus]") || el.querySelector(FOCUSABLE);
  if (first) first.focus({ preventScroll: true });
}

function closeDialog() {
  if (!activeDialog) return;
  const { el, openClass } = activeDialog;
  el.classList.remove(openClass);
  el.setAttribute("aria-hidden", "true");
  activeDialog = null;
  unlockScroll();
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus({ preventScroll: true });
}

document.addEventListener("keydown", (e) => {
  if (!activeDialog) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeDialog();
    return;
  }
  if (e.key === "Tab") {
    // Garde le focus à l'intérieur de la fenêtre ouverte
    const items = [...activeDialog.el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// -----------------------------------------------------
// RENDU DU CATALOGUE (cartes + calculateur) depuis products.js
// -----------------------------------------------------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "text") node.textContent = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

function renderProductCard(p) {
  const n = p.images.length;
  const slides = p.images.map((img, i) =>
    el("div", { class: "carousel-slide" }, [
      el("img", {
        src: `assets/products/${img}.webp`,
        alt: n > 1 ? `${p.name[LANG]} — ${i + 1}/${n}` : p.name[LANG],
        loading: "lazy",
        decoding: "async",
        width: 600,
        height: 450
      })
    ])
  );

  const media = el("div", { class: "pc-media" }, [el("div", { class: "carousel-container" }, slides)]);
  if (n > 1) {
    media.appendChild(el("button", { type: "button", class: "carousel-btn carousel-prev", "aria-label": T.prevImg, text: "❮" }));
    media.appendChild(el("button", { type: "button", class: "carousel-btn carousel-next", "aria-label": T.nextImg, text: "❯" }));
    media.appendChild(
      el("div", { class: "carousel-dots" },
        p.images.map((_, i) =>
          el("button", { type: "button", class: "carousel-dot" + (i === 0 ? " active" : ""), "aria-label": T.showImg(i + 1), "aria-current": i === 0 ? "true" : null })
        )
      )
    );
  }

  const specs = el("div", { class: "product-specs-list" },
    p.variants.map((v) =>
      el("div", { class: "spec-row" }, [
        el("span", { text: v.spec[LANG] }),
        el("strong", { class: "spec-price", text: `${formatPrice(v.price)} ${T.currency} / ${p.unit[LANG]}` })
      ])
    )
  );

  return el("article", { class: "product-card", "data-cat": p.cat, "data-subcat": p.subcat || null }, [
    media,
    el("div", { class: "pc-body" }, [
      el("div", {}, [
        el("span", { class: "pc-cat", text: p.catLabel[LANG] }),
        el("h3", { text: p.name[LANG] }),
        el("p", { text: p.desc[LANG] })
      ]),
      specs
    ])
  ]);
}

function renderQuoteOptions(select) {
  const groups = new Map();
  STCS_PRODUCTS.forEach((p) => {
    const label = p.group[LANG];
    if (!groups.has(label)) groups.set(label, el("optgroup", { label }));
    const og = groups.get(label);
    p.variants.forEach((v) => {
      const perKg = p.measure === "weight" ? ` / ${p.unit[LANG]}` : "";
      og.appendChild(el("option", { value: v.id, text: `${v.option[LANG]} - ${formatPrice(v.price)} ${T.currency}${perKg}` }));
    });
  });
  groups.forEach((og) => select.appendChild(og));
}

function findVariant(id) {
  for (const p of STCS_PRODUCTS) {
    const v = p.variants.find((x) => x.id === id);
    if (v) return { product: p, variant: v };
  }
  return null;
}

// -----------------------------------------------------
// PANIER DE DEVIS (MULTI-ARTICLES)
// -----------------------------------------------------
const panierDevis = [];

function lignePanier(item) {
  const { product, variant } = findVariant(item.id);
  const isWeight = product.measure === "weight";
  return {
    nom: variant.option[LANG],
    label: isWeight ? T.quantity : T.perimeter,
    symbol: isWeight ? T.kg : T.meter,
    unite: product.cartUnit[LANG]
  };
}

function ajouterArticleDevis() {
  const select = document.getElementById("devis-produit");
  const input = document.getElementById("devis-longueur");
  const valeur = parseFloat(String(input.value).replace(",", "."));

  if (isNaN(valeur) || valeur <= 0) {
    alert(T.invalidQty);
    input.focus();
    return;
  }

  const found = findVariant(select.value);
  if (!found) return;
  const { product, variant } = found;

  // Rouleaux / panneaux : arrondi à l'unité supérieure. Fil au kg : poids exact.
  const quantite = product.measure === "weight"
    ? Math.round(valeur * 100) / 100
    : Math.ceil(valeur / variant.cover);

  panierDevis.push({
    id: variant.id,
    valeur,
    quantite,
    prixTotal: Math.round(quantite * variant.price * 100) / 100
  });

  input.value = "";
  afficherPanier();
}

function afficherPanier() {
  const liste = document.getElementById("panier-liste");
  const totalPrix = document.getElementById("panier-total-prix");
  const zonePanier = document.getElementById("zone-panier");

  liste.textContent = "";
  let total = 0;

  panierDevis.forEach((article, index) => {
    total += article.prixTotal;
    const l = lignePanier(article);

    liste.appendChild(
      el("li", { class: "panier-item" }, [
        el("div", {}, [
          el("strong", { class: "panier-item-nom", text: l.nom }),
          el("span", { class: "panier-item-detail" }, [
            `${l.label}: ${article.valeur}${l.symbol} → `,
            el("b", { text: `${article.quantite} ${l.unite}` })
          ])
        ]),
        el("div", { class: "panier-item-actions" }, [
          el("strong", { class: "panier-item-prix", dir: "ltr", text: formatTotal(article.prixTotal) }),
          el("button", { type: "button", class: "panier-supprimer", "data-index": index, "aria-label": `${T.remove} — ${l.nom}`, title: T.remove, text: "×" })
        ])
      ])
    );
  });

  totalPrix.textContent = formatTotal(total);
  zonePanier.hidden = panierDevis.length === 0;
}

function finaliserDemandeDevis() {
  if (panierDevis.length === 0) return;

  let message = T.waIntro;
  let total = 0;

  panierDevis.forEach((article) => {
    const l = lignePanier(article);
    message += `- ${l.nom} (${l.label}: ${article.valeur}${l.symbol}) => ${article.quantite} ${l.unite} : ${formatTotal(article.prixTotal)}\n`;
    total += article.prixTotal;
  });

  message += `\n${T.waTotal} : ${formatTotal(total)}`;

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener");
}

// -----------------------------------------------------
// INITIALISATION
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Lenis smooth scroll (désactivé si l'utilisateur préfère moins d'animations)
  if (typeof Lenis !== "undefined" && !REDUCED_MOTION) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // Liens d'ancre (#products, #contact…) via Lenis, en tenant compte de la barre de navigation
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id === "#top" ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: target === 0 ? 0 : -90 });
      });
    });
  }

  // Préchargeur : jamais plus de 1,2 s, et sauté lors des visites suivantes
  // (la classe "no-intro" est posée dans le <head> de la page)
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const hide = () => preloader.classList.add("is-done");
    if (document.documentElement.classList.contains("no-intro") || REDUCED_MOTION) {
      hide();
    } else {
      window.addEventListener("load", () => setTimeout(hide, 300));
      setTimeout(hide, 1200);
    }
  }

  // Année dynamique
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Horloge en temps réel
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const updateClock = () => { clockEl.textContent = new Date().toLocaleTimeString("fr-FR"); };
    setInterval(updateClock, 1000);
    updateClock();
  }

  // Barre de progression
  const scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 + "%" : "0%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // Apparition des titres au scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".reveal-line").forEach((n) => observer.observe(n));

  // -----------------------------------------------------
  // CATALOGUE : rendu + filtres
  // -----------------------------------------------------
  const productGrid = document.getElementById("productGrid");
  if (productGrid && typeof STCS_PRODUCTS !== "undefined") {
    STCS_PRODUCTS.forEach((p) => productGrid.appendChild(renderProductCard(p)));
  }

  const catBtns = document.querySelectorAll(".filter-btn");
  const subCatBtns = document.querySelectorAll(".sub-filter-btn");
  const subFilterGroup = document.getElementById("subFilters");
  const productCards = document.querySelectorAll(".product-card[data-cat]");

  function applyProductFilters() {
    const activeCatBtn = document.querySelector(".filter-btn.is-active");
    if (!activeCatBtn) return;
    const activeCat = activeCatBtn.dataset.cat;
    const activeSubBtn = document.querySelector(".sub-filter-btn.is-active");
    const activeSubCat = activeCat === "grillages" && activeSubBtn ? activeSubBtn.dataset.subcat : null;

    if (subFilterGroup) subFilterGroup.classList.toggle("is-hidden", activeCat !== "grillages");

    productCards.forEach((card) => {
      const visible = card.dataset.cat === activeCat && (activeSubCat === null || card.dataset.subcat === activeSubCat);
      card.hidden = !visible;
    });
  }

  function bindFilterButtons(buttons) {
    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false");
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        applyProductFilters();
      });
    });
  }
  bindFilterButtons(catBtns);
  bindFilterButtons(subCatBtns);
  applyProductFilters();

  // -----------------------------------------------------
  // CARROUSEL D'IMAGES DANS LES CARTES PRODUITS
  // (toujours en LTR, voir styles.css, pour un comportement identique FR/AR)
  // -----------------------------------------------------
  document.querySelectorAll(".pc-media").forEach((carousel) => {
    const container = carousel.querySelector(".carousel-container");
    if (!container) return;
    const slides = container.querySelectorAll(".carousel-slide");
    const dots = carousel.querySelectorAll(".carousel-dot");
    let currentIndex = 0;

    function setDots(index) {
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      container.scrollTo({ left: currentIndex * container.clientWidth, behavior: REDUCED_MOTION ? "auto" : "smooth" });
      setDots(currentIndex);
    }

    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    // Synchronise les points quand l'utilisateur glisse au doigt
    container.addEventListener("scroll", () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      if (index !== currentIndex && index >= 0 && index < slides.length) {
        currentIndex = index;
        setDots(currentIndex);
      }
    }, { passive: true });
  });

  // -----------------------------------------------------
  // GALERIE : rendu, défilement automatique et flèches
  // -----------------------------------------------------
  const galleryTrack = document.getElementById("galleryTrack");
  if (galleryTrack && typeof STCS_GALLERY !== "undefined") {
    const total = STCS_GALLERY.length;
    STCS_GALLERY.forEach((name, i) => {
      galleryTrack.appendChild(
        el("button", { type: "button", class: "gallery-item", "data-index": i, "aria-label": T.galleryAlt(i + 1, total) }, [
          el("img", {
            src: `assets/images-catalogue/thumbs/${name}.webp`,
            "data-full": `assets/images-catalogue/${name}.jpg`,
            alt: T.galleryAlt(i + 1, total),
            loading: "lazy",
            decoding: "async",
            width: 300,
            height: 300
          })
        ])
      );
    });

    const prevArrow = document.querySelector(".gallery-prev");
    const nextArrow = document.querySelector(".gallery-next");
    const step = () => {
      const item = galleryTrack.querySelector(".gallery-item");
      const gap = parseFloat(getComputedStyle(galleryTrack).columnGap) || 0;
      return item ? item.offsetWidth + gap : 324;
    };
    const behavior = REDUCED_MOTION ? "auto" : "smooth";

    if (nextArrow) nextArrow.addEventListener("click", () => galleryTrack.scrollBy({ left: step(), behavior }));
    if (prevArrow) prevArrow.addEventListener("click", () => galleryTrack.scrollBy({ left: -step(), behavior }));

    function scrollGallery() {
      if (galleryTrack.scrollLeft >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 10) {
        galleryTrack.scrollTo({ left: 0, behavior });
      } else {
        galleryTrack.scrollBy({ left: step(), behavior });
      }
    }

    // Défilement auto seulement si la galerie est visible, que l'onglet est actif,
    // et que l'utilisateur n'interagit pas avec (souris, clavier, doigt).
    if (!REDUCED_MOTION) {
      let timer = null;
      let inView = false;
      let pausedUntil = 0;
      let hovering = false;

      const shouldRun = () => inView && !hovering && !document.hidden && !activeDialog && Date.now() >= pausedUntil;
      const tick = () => { if (shouldRun()) scrollGallery(); };
      const start = () => { if (!timer) timer = setInterval(tick, 3500); };
      const stop = () => { clearInterval(timer); timer = null; };
      const pauseFor = (ms) => { pausedUntil = Date.now() + ms; };

      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        inView ? start() : stop();
      }, { threshold: 0.25 }).observe(galleryTrack);

      const wrapper = document.querySelector(".gallery-slider-wrapper") || galleryTrack;
      wrapper.addEventListener("mouseenter", () => { hovering = true; });
      wrapper.addEventListener("mouseleave", () => { hovering = false; });
      wrapper.addEventListener("focusin", () => { hovering = true; });
      wrapper.addEventListener("focusout", () => { hovering = false; });
      wrapper.addEventListener("touchstart", () => pauseFor(8000), { passive: true });
      [prevArrow, nextArrow].forEach((b) => b && b.addEventListener("click", () => pauseFor(8000)));
    }
  }

  // -----------------------------------------------------
  // LIGHTBOX (AGRANDISSEMENT DES IMAGES DE LA GALERIE)
  // -----------------------------------------------------
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");

  if (lightbox && galleryItems.length > 0) {
    const lightboxImg = document.getElementById("lightbox-img");
    const total = galleryItems.length;
    let currentIndex = 0;

    function showImage(index) {
      currentIndex = (index + total) % total;
      const img = galleryItems[currentIndex].querySelector("img");
      lightboxImg.src = img.dataset.full || img.src;
      lightboxImg.alt = T.lightboxAlt(currentIndex + 1, total);
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        showImage(index);
        openDialog(lightbox, "is-active");
      });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeDialog);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeDialog(); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => showImage(currentIndex + 1));
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showImage(currentIndex - 1));

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-active")) return;
      if (e.key === "ArrowRight") showImage(currentIndex + 1);
      if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    });

    // Glisser au doigt pour changer d'image
    let touchX = null;
    lightbox.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showImage(currentIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  // -----------------------------------------------------
  // MODALE DE DEVIS
  // -----------------------------------------------------
  const modale = document.getElementById("modale-devis");
  const select = document.getElementById("devis-produit");
  if (select && typeof STCS_PRODUCTS !== "undefined") renderQuoteOptions(select);

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openDialog(document.getElementById(btn.dataset.openModal), "is-open"));
  });

  if (modale) {
    modale.querySelector(".modale-fermer").addEventListener("click", closeDialog);
    modale.addEventListener("click", (e) => { if (e.target === modale) closeDialog(); });

    document.getElementById("devis-ajouter").addEventListener("click", ajouterArticleDevis);
    document.getElementById("devis-longueur").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); ajouterArticleDevis(); }
    });
    document.getElementById("devis-envoyer").addEventListener("click", finaliserDemandeDevis);

    document.getElementById("panier-liste").addEventListener("click", (e) => {
      const btn = e.target.closest(".panier-supprimer");
      if (!btn) return;
      panierDevis.splice(Number(btn.dataset.index), 1);
      afficherPanier();
      document.getElementById("devis-longueur").focus();
    });
  }
});
