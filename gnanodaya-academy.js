const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const counters = Array.from(document.querySelectorAll("[data-counter]"));
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");
const alumniMessage = document.getElementById("alumniMessage");
const openAlumniGoogleForm = document.getElementById("openAlumniGoogleForm");

const alumniGoogleFormUrl = "https://forms.gle/f5uiSnB97vv2Sq8Z9";

const activateTab = (tabName) => {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab);
  });
});

const animateCounter = (element) => {
  const rawValue = element.textContent.trim();
  const target = Number.parseInt(element.dataset.counter || "0", 10);

  if (!Number.isFinite(target)) {
    return;
  }

  const duration = 1200;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.floor(progress * target);
    element.textContent = rawValue.endsWith("+") ? `${current}+` : `${current}`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    element.textContent = rawValue;
  };

  window.requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window && counters.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.55 });

  counters.forEach((counter) => observer.observe(counter));
} else {
  counters.forEach((counter) => {
    counter.textContent = counter.textContent.trim();
  });
}

const openLightbox = (imageSrc, caption) => {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  lightboxImage.src = imageSrc;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.showModal();
};

galleryCards.forEach((card) => {
  card.addEventListener("click", () => {
    openLightbox(card.dataset.image, card.dataset.caption);
  });
});

if (lightboxClose && lightbox) {
  lightboxClose.addEventListener("click", () => {
    lightbox.close();
  });

  lightbox.addEventListener("click", (event) => {
    const bounds = lightbox.getBoundingClientRect();
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isOutside) {
      lightbox.close();
    }
  });
}

if (openAlumniGoogleForm) {
  if (alumniGoogleFormUrl) {
    openAlumniGoogleForm.href = alumniGoogleFormUrl;
  } else {
    openAlumniGoogleForm.addEventListener("click", (event) => {
      event.preventDefault();
      alumniMessage.textContent = "Alumni Google Form link will be added here after the private form is created.";
    });
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactMessage.textContent = "Enquiry captured. Connect this form to the admissions office email or CRM for live enquiries.";
    contactForm.reset();
  });
}

