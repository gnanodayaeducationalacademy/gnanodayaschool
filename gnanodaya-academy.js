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
const exportAlumniCsv = document.getElementById("exportAlumniCsv");
const openAlumniGoogleForm = document.getElementById("openAlumniGoogleForm");

// Add the school's alumni Google Form URL here when it is ready.
// Example: const alumniGoogleFormUrl = "https://forms.gle/yourAlumniForm";
const alumniGoogleFormUrl = "";

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

if (openAlumniGoogleForm && alumniGoogleFormUrl) {
  openAlumniGoogleForm.href = alumniGoogleFormUrl;
  openAlumniGoogleForm.hidden = false;
}

const getAlumniEntries = () => JSON.parse(localStorage.getItem(alumniStorageKey) || "[]");

const saveAlumniEntries = (entries) => {
  localStorage.setItem(alumniStorageKey, JSON.stringify(entries.slice(0, 100)));
};

const csvEscape = (value) => `"${String(value || "").replaceAll('"', '""')}"`;

const downloadAlumniCsv = () => {
  const entries = getAlumniEntries();

  if (!entries.length) {
    alumniMessage.textContent = "No alumni LinkedIn profiles are saved yet.";
    return;
  }

  const headers = ["Full Name", "Batch / Passing Year", "Current Role or Company", "LinkedIn Profile URL", "Recommendation Note", "Submitted At"];
  const rows = entries.map((entry) => [
    entry.alumniName,
    entry.alumniBatch,
    entry.alumniRole,
    entry.alumniLinkedIn,
    entry.alumniNote,
    entry.submittedAt,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gnanodaya-alumni-linkedin-profiles.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  alumniMessage.textContent = "Alumni LinkedIn CSV exported for Google Sheets.";
};

const renderAlumniProfiles = () => {
  if (!alumniList) {
    return;
  }

  const entries = getAlumniEntries();
  alumniList.innerHTML = "";

  if (!entries.length) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "saved-card";
    const emptyTitle = document.createElement("strong");
    emptyTitle.textContent = "No alumni profiles saved yet.";
    const emptyText = document.createElement("span");
    emptyText.textContent = "LinkedIn submissions will appear here after alumni add their details.";
    emptyCard.append(emptyTitle, emptyText);
    alumniList.append(emptyCard);
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    const name = document.createElement("strong");
    name.textContent = entry.alumniName;
    const meta = document.createElement("div");
    meta.textContent = `${entry.alumniBatch} | ${entry.alumniRole}`;
    const note = document.createElement("p");
    note.textContent = entry.alumniNote || "Recommendation note not added yet.";
    const link = document.createElement("a");
    link.href = entry.alumniLinkedIn;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "View LinkedIn profile";
    card.append(name, meta, note, link);
    alumniList.append(card);
  });
};

if (admissionsForm) {
  admissionsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    admissionsMessage.textContent = "Admission interest saved. Connect this form to email, Google Sheets, or a backend for live enquiries.";
    admissionsForm.reset();
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactMessage.textContent = "Enquiry captured. Connect this form to the admissions office email or CRM for live enquiries.";
    contactForm.reset();
  });
}

if (alumniForm) {
  alumniForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(alumniForm);
    const entry = Object.fromEntries(formData.entries());
    entry.submittedAt = new Date().toISOString();
    const entries = getAlumniEntries();
    entries.unshift(entry);
    saveAlumniEntries(entries);
    alumniMessage.textContent = alumniGoogleFormUrl
      ? "Alumni LinkedIn profile saved. You can also open the Google Form from the database panel."
      : "Alumni LinkedIn profile saved. Use Export CSV to add it to Google Sheets.";
    alumniForm.reset();
    renderAlumniProfiles();
  });
}

if (exportAlumniCsv) {
  exportAlumniCsv.addEventListener("click", downloadAlumniCsv);
}

renderAlumniProfiles();
