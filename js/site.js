document.documentElement.classList.add("js");

async function loadFragment(element) {
  const src = element.dataset.include;
  if (!src) return;

  try {
    const response = await fetch(src, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    element.innerHTML = html;
    element.dataset.loaded = "true";

    if (element.querySelector("[data-empty-section]")) {
      element.hidden = true;
    }
  } catch (error) {
    console.error(`Could not load ${src}:`, error);
    element.innerHTML = "";
    element.hidden = true;
  }
}

async function loadAllFragments() {
  const fragments = [...document.querySelectorAll("[data-include]")];
  await Promise.all(fragments.map(loadFragment));
}

function setupLegalOverlay() {
  const links = [...document.querySelectorAll("[data-legal-link]")];
  const overlay = document.getElementById("legal-overlay");
  const content = document.getElementById("legal-overlay-content");

  if (!links.length || !overlay || !content) return;

  const closeButtons = overlay.querySelectorAll("[data-close-legal]");
  let previousFocus = null;

  async function openLegal(event) {
    event.preventDefault();

    const link = event.currentTarget;
    previousFocus = document.activeElement;

    try {
      const response = await fetch(link.href, { cache: "no-cache" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const legalBody = doc.querySelector("[data-legal-content]");

      content.innerHTML = legalBody ? legalBody.innerHTML : doc.body.innerHTML;
      overlay.hidden = false;
      document.body.classList.add("legal-open");

      const closeButton = overlay.querySelector(".legal-overlay-close");
      closeButton?.focus();
    } catch (error) {
      console.error("Could not load legal page:", error);
      window.location.href = link.href;
    }
  }

  function closeLegal() {
    overlay.hidden = true;
    document.body.classList.remove("legal-open");
    previousFocus?.focus?.();
  }

  links.forEach((link) => link.addEventListener("click", openLegal));
  closeButtons.forEach((button) => button.addEventListener("click", closeLegal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      closeLegal();
    }
  });
}

loadAllFragments();
setupLegalOverlay();
