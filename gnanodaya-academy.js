const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const counters = Array.from(document.querySelectorAll("[data-counter]"));
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const admissionsForm = document.getElementById("admissionsForm");
const contactForm = document.getElementById("contactForm");
const alumniForm = document.getElementById("alumniForm");
const admissionsMessage = document.getElementById("admissionsMessage");
const contactMessage = document.getElementById("contactMessage");
const alumniMessage = document.getElementById("alumniMessage");
const alumniList = document.getElementById("alumniList");

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

const alumniStorageKey = "gnanodaya-alumni-profiles";

const renderAlumniProfiles = () => {
  if (!alumniList) {
    return;
  }

  const entries = JSON.parse(localStorage.getItem(alumniStorageKey) || "[]");
  alumniList.innerHTML = "";

  if (!entries.length) {
    alumniList.innerHTML = '<div class="saved-card"><strong>No alumni profiles saved yet.</strong><span>LinkedIn submissions will appear here for the website preview.</span></div>';
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.innerHTML = `
      <strong>${entry.alumniName}</strong>
      <div>${entry.alumniBatch} | ${entry.alumniRole}</div>
      <p>${entry.alumniNote || "Recommendation note not added yet."}</p>
      <a href="${entry.alumniLinkedIn}" target="_blank" rel="noreferrer">View LinkedIn profile</a>
    `;
    alumniList.append(card);
  });
};

if (admissionsForm) {
  admissionsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    admissionsMessage.textContent = "Admission interest saved for the website preview. Connect this form to email, Google Sheets, or a backend before going live.";
    admissionsForm.reset();
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactMessage.textContent = "Enquiry captured for the website preview. Connect this form to the admissions office email or CRM before public launch.";
    contactForm.reset();
  });
}

if (alumniForm) {
  alumniForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(alumniForm);
    const entry = Object.fromEntries(formData.entries());
    const entries = JSON.parse(localStorage.getItem(alumniStorageKey) || "[]");
    entries.unshift(entry);
    localStorage.setItem(alumniStorageKey, JSON.stringify(entries.slice(0, 8)));
    alumniMessage.textContent = "Alumni profile saved locally for the website preview.";
    alumniForm.reset();
    renderAlumniProfiles();
  });
}

renderAlumniProfiles();
