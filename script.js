document.addEventListener("DOMContentLoaded", () => {
  // Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.1,
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Preloader
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => preloader.classList.add("is-done"), 700);
    });
    setTimeout(() => preloader.classList.add("is-done"), 2500);
  }

  // Année dynamique
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Horloge en temps réel
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    function updateClock() {
      clockEl.textContent = new Date().toLocaleTimeString("fr-FR");
    }
    setInterval(updateClock, 1000);
    updateClock();
  }

  // Gestion du curseur (Rouleau)
  const cursor = document.getElementById("cursor");
  if (cursor) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, .product-card, .value-card, .contact-tile, .filter-btn, .sub-filter-btn").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  // Barre de progression
  const scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    window.addEventListener("scroll", () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (window.scrollY / totalHeight) * 100 + "%";
    });
  }

  // Observer pour l'apparition au scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll("[data-reveal], .reveal-line").forEach(el => observer.observe(el));

  // -----------------------------------------------------
  // LOGIQUE DE FILTRAGE DU CATALOGUE PRODUITS
  // -----------------------------------------------------
  const catBtns = document.querySelectorAll('.filter-btn');
  const subCatBtns = document.querySelectorAll('.sub-filter-btn');
  const subFilterGroup = document.getElementById('subFilters');
  const productCards = document.querySelectorAll('.product-card[data-cat]');

  function applyProductFilters() {
    const activeCatBtn = document.querySelector('.filter-btn.is-active');
    if (!activeCatBtn) return;
    const activeCat = activeCatBtn.getAttribute('data-cat');
    
    let activeSubCat = null;
    
    // Gérer l'affichage des sous-catégories
    if (activeCat === 'grillages') {
      if(subFilterGroup) subFilterGroup.classList.remove('is-hidden');
      const activeSubBtn = document.querySelector('.sub-filter-btn.is-active');
      if (activeSubBtn) activeSubCat = activeSubBtn.getAttribute('data-subcat');
    } else {
      if(subFilterGroup) subFilterGroup.classList.add('is-hidden');
    }

    // Afficher/Cacher les cartes
    productCards.forEach(card => {
      const cardCat = card.getAttribute('data-cat');
      const cardSubcat = card.getAttribute('data-subcat');

      if (activeCat === 'accessoires' && cardCat === 'accessoires') {
        card.style.display = 'flex';
      } else if (activeCat === 'grillages' && cardCat === 'grillages' && cardSubcat === activeSubCat) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Écouteurs sur les boutons principaux
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyProductFilters();
    });
  });

  // Écouteurs sur les sous-boutons
  subCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subCatBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyProductFilters();
    });
  });

  // Initialisation au chargement
  if (catBtns.length > 0) applyProductFilters();
});

// Fonctions globales pour les modales de prix
function ouvrirModale(id) {
  const modale = document.getElementById(id);
  if (modale) {
    modale.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
}
function fermerModale(id) {
  const modale = document.getElementById(id);
  if (modale) {
    modale.classList.remove("is-open");
    document.body.style.overflow = "auto";
  }
}
window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modale")) {
    event.target.classList.remove("is-open");
    document.body.style.overflow = "auto";
  }
});
