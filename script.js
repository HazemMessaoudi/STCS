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

  // Gestion du curseur
  const cursor = document.getElementById("cursor");
  if (cursor) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, .product-card, .value-card, .contact-tile, .filter-btn, .sub-filter-btn, .gallery-item").forEach((el) => {
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
    
    if (activeCat === 'grillages') {
      if(subFilterGroup) subFilterGroup.classList.remove('is-hidden');
      const activeSubBtn = document.querySelector('.sub-filter-btn.is-active');
      if (activeSubBtn) activeSubCat = activeSubBtn.getAttribute('data-subcat');
    } else {
      if(subFilterGroup) subFilterGroup.classList.add('is-hidden');
    }

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

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyProductFilters();
    });
  });

  subCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subCatBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyProductFilters();
    });
  });

  if (catBtns.length > 0) applyProductFilters();

  // -----------------------------------------------------
  // CARROUSEL D'IMAGES DANS LES CARTES PRODUITS
  // -----------------------------------------------------
  const carousels = document.querySelectorAll('.pc-media');
  carousels.forEach(carousel => {
    const container = carousel.querySelector('.carousel-container');
    if (!container) return;
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentIndex = 0;

    function updateCarousel(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;
      container.scrollTo({
        left: slides[currentIndex].offsetLeft,
        behavior: 'smooth'
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateCarousel(currentIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateCarousel(currentIndex - 1);
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        updateCarousel(i);
      });
    });

    container.addEventListener('scroll', () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      if (index !== currentIndex && index >= 0 && index < slides.length) {
        currentIndex = index;
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    });
  });

  // -----------------------------------------------------
  // SLIDER GALERIE (Défilement automatique et flèches)
  // -----------------------------------------------------
  const galleryTrack = document.getElementById('galleryTrack');
  if (galleryTrack) {
    const prevArrow = document.querySelector('.gallery-prev');
    const nextArrow = document.querySelector('.gallery-next');
    const scrollAmount = 324; // 300px + 24px gap
    const isRTL = document.documentElement.dir === 'rtl';
    
    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        galleryTrack.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      });
    }
    if (prevArrow) {
      prevArrow.addEventListener('click', () => {
        galleryTrack.scrollBy({ left: isRTL ? scrollAmount : -scrollAmount, behavior: 'smooth' });
      });
    }

    function scrollGallery() {
      if (isRTL) {
        if (Math.abs(galleryTrack.scrollLeft) >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 10) {
          galleryTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          galleryTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (galleryTrack.scrollLeft >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 10) {
          galleryTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          galleryTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }

    let autoScroll = setInterval(scrollGallery, 3500);

    const galleryWrapper = document.querySelector('.gallery-slider-wrapper');
    if (galleryWrapper) {
      galleryWrapper.addEventListener('mouseenter', () => clearInterval(autoScroll));
      galleryWrapper.addEventListener('mouseleave', () => {
        autoScroll = setInterval(scrollGallery, 3500);
      });
    }
  }

  // -----------------------------------------------------
  // LIGHTBOX (AGRANDISSEMENT DES IMAGES DE LA GALERIE)
  // -----------------------------------------------------
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const lightbox = document.getElementById('lightbox');
  
  if (lightbox && galleryItems.length > 0) {
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    let currentIndex = 0;

    galleryItems.forEach((img, index) => {
      img.parentElement.addEventListener('click', () => {
        currentIndex = index;
        showImage(currentIndex);
        lightbox.classList.add('is-active');
        document.body.style.overflow = "hidden";
      });
    });

    function showImage(index) {
      if (index >= galleryItems.length) currentIndex = 0;
      if (index < 0) currentIndex = galleryItems.length - 1;
      lightboxImg.src = galleryItems[currentIndex].src;
    }

    function closeLightbox() {
      lightbox.classList.remove('is-active');
      document.body.style.overflow = "auto";
    }

    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex++;
      showImage(currentIndex);
    });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex--;
      showImage(currentIndex);
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') { currentIndex++; showImage(currentIndex); }
      if (e.key === 'ArrowLeft') { currentIndex--; showImage(currentIndex); }
    });
  }
});

// -----------------------------------------------------
// GESTION DES MODALES
// -----------------------------------------------------
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

// -----------------------------------------------------
// GESTION DU PANIER DE DEVIS (MULTI-ARTICLES)
// -----------------------------------------------------
let panierDevis = [];

function ajouterArticleDevis() {
  const select = document.getElementById('devis-produit');
  const input = document.getElementById('devis-longueur');
  const longueur = parseFloat(input.value);

  const isAR = document.documentElement.dir === 'rtl';

  if (isNaN(longueur) || longueur <= 0) {
    alert(isAR ? "الرجاء إدخال طول صحيح بالمتر." : "Veuillez saisir une longueur valide en mètres.");
    return;
  }

  const option = select.options[select.selectedIndex];
  // Récupérer le nom du produit sans le prix
  const nomProduit = option.text.split(' - ')[0]; 
  const longueurProduit = parseFloat(option.getAttribute('data-longueur'));
  const prixUnitaire = parseFloat(option.getAttribute('data-prix'));
  const nomUnite = option.getAttribute('data-unite');

  // Application de la règle : Arrondi à l'entier supérieur
  const quantite = Math.ceil(longueur / longueurProduit);
  const prixTotal = quantite * prixUnitaire;

  // Ajout au panier
  panierDevis.push({
    nom: nomProduit,
    longueur: longueur,
    quantite: quantite,
    unite: nomUnite,
    prixUnitaire: prixUnitaire,
    prixTotal: prixTotal
  });

  // Vider le champ de saisie
  input.value = '';
  
  // Mettre à jour l'interface
  afficherPanier();
}

function afficherPanier() {
  const liste = document.getElementById('panier-liste');
  const totalPrix = document.getElementById('panier-total-prix');
  const zonePanier = document.getElementById('zone-panier');
  
  liste.innerHTML = '';
  let total = 0;
  const isAR = document.documentElement.dir === 'rtl';

  panierDevis.forEach((article, index) => {
    total += article.prixTotal;
    
    const li = document.createElement('li');
    li.style.cssText = "padding: 12px 0; border-bottom: 1px dashed var(--line); display: flex; justify-content: space-between; align-items: center; gap: 10px;";
    
    // Création des détails de l'article
    const details = document.createElement('div');
    details.innerHTML = `
      <strong style="display:block; color:var(--ink); font-size:15px; margin-bottom:4px;">${article.nom}</strong>
      <span style="font-size:13px; color:var(--mute);">${isAR ? 'المحيط:' : 'Périmètre:'} ${article.longueur}m &rarr; <b>${article.quantite} ${article.unite}</b></span>
    `;
    
    // Création du prix et du bouton de suppression
    const actionPrix = document.createElement('div');
    actionPrix.style.cssText = "display: flex; align-items: center; gap: 16px;";
    actionPrix.innerHTML = `
      <strong style="color:var(--green); font-family:var(--f-display); font-size:16px;" dir="ltr">${article.prixTotal.toFixed(2)} DT</strong>
      <button onclick="supprimerArticle(${index})" style="background:rgba(255,0,0,0.08); color:red; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:background 0.3s;" title="Supprimer">&times;</button>
    `;
    
    li.appendChild(details);
    li.appendChild(actionPrix);
    liste.appendChild(li);
  });

  totalPrix.textContent = total.toFixed(2) + " DT";

  // Afficher ou cacher la zone du panier selon son contenu
  if (panierDevis.length > 0) {
    zonePanier.style.display = 'block';
  } else {
    zonePanier.style.display = 'none';
  }
}

function supprimerArticle(index) {
  panierDevis.splice(index, 1);
  afficherPanier();
}

// Fonction finale appelée lors du clic sur "Demander un devis final"
function finaliserDemandeDevis() {
  if (panierDevis.length === 0) return;
  
  const isAR = document.documentElement.dir === 'rtl';
  let message = isAR 
    ? "مرحباً STCS، أود طلب تسعيرة للمنتجات التالية:\n\n" 
    : "Bonjour STCS, je souhaite un devis pour :\n\n";
    
  let total = 0;
  
  panierDevis.forEach(article => {
    if (isAR) {
      message += `- ${article.nom} (المحيط: ${article.longueur}م) => ${article.quantite} ${article.unite} : ${article.prixTotal.toFixed(2)} DT\n`;
    } else {
      message += `- ${article.nom} (Périmètre: ${article.longueur}m) => ${article.quantite} ${article.unite} : ${article.prixTotal.toFixed(2)} DT\n`;
    }
    total += article.prixTotal;
  });
  
  message += isAR 
    ? `\nالمجموع التقديري : ${total.toFixed(2)} DT`
    : `\nTotal estimé : ${total.toFixed(2)} DT`;
    
  // Ouvre WhatsApp avec le devis complet formaté
  const waUrl = `https://wa.me/21628545844?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}
