import { FLOORS, CARDS } from "./data.js";

// Raccourci de sélection par ID
const $ = (id) => document.getElementById(id);
let currentId = null;

// Affiche la liste des 17 cartes groupées par étape du funnel
function renderList() {
  $("guide-count-pill").textContent = `${CARDS.length} CARDS`;
  $("guide-groups").innerHTML = FLOORS.map((f) => {
    const items = CARDS.filter((c) => c.floor === f.id);
    if (!items.length) return "";
    return `
      <div class="stack">
        <span class="stage-chip" style="background:${f.color}">${f.name}</span>
        ${items.map((c) => `
          <button type="button" class="card-row-btn" style="--accent:${f.color}" data-id="${c.id}">
            <span>${c.name}</span>
            <span class="row-right">
              ${c.special ? `<span class="tag-pill is-special">SPECIAL</span>` : ""}
              ${c.level === 2 ? `<span class="tag-pill">L2</span>` : ""}
              <span class="coin-circle">${c.cost}</span>
              <span class="chev">&rsaquo;</span>
            </span>
          </button>`).join("")}
      </div>`;
  }).join("");

  // Ouvre la fiche détail au clic sur une carte
  document.querySelectorAll("[data-id]").forEach((btn) =>
    btn.addEventListener("click", () => openDetail(btn.dataset.id))
  );
}

// Affiche la fiche détail plein écran d'une carte
function openDetail(id) {
  const c = CARDS.find((x) => x.id === id) || CARDS[0];
  currentId = c.id;
  const f = FLOORS.find((x) => x.id === c.floor) || FLOORS[0];

  // Pilules d'étape et badges (L2 / Special) placés au-dessus de la carte
  $("detail-stage-pill").innerHTML = `
    <span class="stage-chip" style="background:${f.color}">${f.name}</span>
    ${c.special ? `<span class="tag-pill is-special">SPECIAL</span>` : ""}
    ${c.level === 2 ? `<span class="tag-pill">LEVEL 2</span>` : ""}
  `;

  // Carte blanche avec bandeau supérieur coloré et pièce de coût
  $("guide-detail-content").innerHTML = `
    <div class="detail-card" style="--accent:${f.color}">
      <div class="detail-stripe"></div>
      <div class="detail-body">
        <div class="detail-head">
          <h1 class="detail-title">${c.name}</h1>
          <span class="coin-circle is-lg">${c.cost}</span>
        </div>
        <div class="detail-block">
          <span class="detail-label">Effect</span>
          <p class="detail-text"><strong>${c.effect}</strong></p>
        </div>
        <div class="detail-block">
          <span class="detail-label">What is it?</span>
          <p class="detail-text">${c.definition}</p>
        </div>
        <div class="detail-block">
          <span class="detail-label">Example</span>
          <p class="detail-text is-muted">${c.example}</p>
        </div>
      </div>
    </div>`;

  $("guide-list-view").classList.add("hidden");
  $("guide-detail-view").classList.remove("hidden");
}

// Retour à la liste complète des cartes
$("btn-back-to-list").addEventListener("click", () => {
  $("guide-detail-view").classList.add("hidden");
  $("guide-list-view").classList.remove("hidden");
});

// Passage à la carte suivante
$("btn-next-card").addEventListener("click", () => {
  const i = CARDS.findIndex((c) => c.id === currentId);
  openDetail(CARDS[(i + 1) % CARDS.length].id);
});

// Chargement initial de la liste
renderList();