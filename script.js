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
      setTimeout(() => {
        preloader.classList.add("is-done");
      }, 700);
    });
    setTimeout(() => {
      preloader.classList.add("is-done");
    }, 2500);
  }

  // Année dynamique dans le footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Horloge en temps réel
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("fr-FR");
    }
    setInterval(updateClock, 1000);
    updateClock();
  }

  // Gestion du curseur (Rouleau de grillage)
  const cursor = document.getElementById("cursor");
  if (cursor) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    // Effet hover sur les liens et boutons
    const hoverElements = document.querySelectorAll("a, button, .product-card, .value-card, .contact-tile");
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  // Animation des chiffres statistiques (Correction du bug à 0)
  const statsNumbers = document.querySelectorAll("[data-count]");
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.getAttribute("data-count");
        let count = 0;
        const duration = 2000; // 2 secondes
        const increment = target / (duration / 16);
        
        const updateCount = () => {
          count += increment;
          if (count < target) {
            el.textContent = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = target;
          }
        };
        updateCount();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statsNumbers.forEach(num => statsObserver.observe(num));

  // Barre de progression du scroll
  const scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    window.addEventListener("scroll", () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = progress + "%";
    });
  }

  // Effet d'apparition au scroll (Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll("[data-reveal], .reveal-line").forEach(el => {
    observer.observe(el);
  });
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

// Fermer la modale si on clique en dehors du contenu
window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modale")) {
    event.target.classList.remove("is-open");
    document.body.style.overflow = "auto";
  }
});
