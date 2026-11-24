// Import funnel stages and card definitions from data.js
import { FLOORS, CARDS } from "./data.js";

// Shorthand helper to get an element by ID
const $ = (id) => document.getElementById(id);

// Escape HTML characters for safe dynamic rendering
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// Map floor IDs to their metadata objects for quick lookup
const floorById = Object.fromEntries(FLOORS.map((f) => [f.id, f]));

// Currently selected card ID when viewing single-card detail (null = list view)
let selectedCardId = null;

// Render all 15 cards grouped by funnel stage (10_Guide_liste.png layout)
function renderListView() {
  $("guide-groups").innerHTML = FLOORS.map((floor) => {
    const floorCards = CARDS.filter((c) => c.floor === floor.id);
    if (!floorCards.length) return "";

    const rowsHtml = floorCards.map((card) => `
      <button
        type="button"
        class="card-row-btn"
        style="--row-floor-color:${floor.color}"
        data-open-card="${escapeHTML(card.id)}"
      >
        <span class="card-row-title">${escapeHTML(card.name)}</span>
        <span class="card-row-meta">
          ${card.level === 2 ? `<span class="l2-mini-pill">L2</span>` : ""}
          <span class="coin-cost-circle">${card.cost}</span>
          <span class="row-chevron" aria-hidden="true">&rsaquo;</span>
        </span>
      </button>
    `).join("");

    return `
      <section class="floor-group" aria-label="${escapeHTML(floor.name)}">
        <div class="floor-header-pill" style="background:${floor.color}">${escapeHTML(floor.name)}</div>
        <div class="floor-cards-stack">${rowsHtml}</div>
      </section>
    `;
  }).join("");

  // Attach click handlers to open individual card detail
  document.querySelectorAll("[data-open-card]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCardDetail(btn.dataset.openCard);
    });
  });
}

// Render the detailed card view for a specific card ID (11_Guide_carte.png layout)
function renderDetailView(cardId) {
  const card = CARDS.find((c) => c.id === cardId) || CARDS[0];
  selectedCardId = card.id;
  const floor = floorById[card.floor] || { name: card.floor, color: "#CDEFF3" };

  // Update URL hash so direct card links work cleanly
  if (location.hash !== `#${card.id}`) {
    history.replaceState(null, "", `#${card.id}`);
  }

  $("guide-detail-content").innerHTML = `
    <div class="floor-header-pill" style="background:${floor.color}">${escapeHTML(floor.name)}</div>
    <article class="detail-card" style="--detail-floor-color:${floor.color}">
      <div class="detail-card-head">
        <h1 class="detail-card-title">${escapeHTML(card.name)}</h1>
        <div class="detail-coin" aria-label="Cost ${card.cost}">${card.cost}</div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Effect</div>
        <p class="detail-effect">${escapeHTML(card.effect)}</p>
      </div>

      <div class="detail-section">
        <div class="detail-label">What is it?</div>
        <p class="detail-definition">${escapeHTML(card.definition)}</p>
      </div>

      <div class="detail-section">
        <div class="detail-label">Example</div>
        <p class="detail-example">${escapeHTML(card.example)}</p>
      </div>
    </article>
  `;
}

// Switch from list view to single-card detail view
function openCardDetail(cardId) {
  renderDetailView(cardId);
  $("guide-list-view").classList.add("hidden");
  $("guide-detail-view").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Switch back from detail view to full grouped card list
function openCardList() {
  selectedCardId = null;
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  $("guide-detail-view").classList.add("hidden");
  $("guide-list-view").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Back button ("< All cards")
$("btn-back-to-list").addEventListener("click", openCardList);

// Next card button ("Next card") cycles through all 15 cards
$("btn-next-card").addEventListener("click", () => {
  const currentIndex = CARDS.findIndex((c) => c.id === selectedCardId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % CARDS.length : 0;
  renderDetailView(CARDS[nextIndex].id);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Support opening directly on a card anchor (e.g. guide.html#instagram-ad)
window.addEventListener("hashchange", () => {
  const hashId = location.hash.replace(/^#/, "");
  if (hashId && CARDS.some((c) => c.id === hashId)) {
    openCardDetail(hashId);
  } else if (!hashId) {
    openCardList();
  }
});

// Initial render of list view and optional deep-linked card
renderListView();
const initialHash = location.hash.replace(/^#/, "");
if (initialHash && CARDS.some((c) => c.id === initialHash)) {
  openCardDetail(initialHash);
}