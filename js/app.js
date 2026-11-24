// Import game constants and event definitions from data.js
import { TOTAL_ROUNDS, TOTAL_TOKENS, PLAYER_COLORS, EVENTS } from "./data.js";

// LocalStorage key used to persist active game state across reloads
const STORAGE_KEY = "funnelRush.v3.game";

// Shorthand helper to get an element by ID
const $ = (id) => document.getElementById(id);

// Escape special HTML characters to prevent XSS when inserting dynamic text
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// Load saved game object from localStorage, or return null if absent/invalid
function loadGame() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

// Save the current game object to localStorage
function saveGame(game) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

// Remove the saved game from localStorage
function clearGame() {
  localStorage.removeItem(STORAGE_KEY);
}

// Draft setup state before a game is persisted
let draftLevel = 2; // Selected difficulty level (1 or 2)
let draftCount = 3; // Selected player count (2, 3, or 4)
let draftNames = ["", "", "", ""]; // Draft player names

// Show only one screen section at a time and hide the rest
function showOnly(screenId) {
  ["screen-home", "screen-players", "screen-round", "screen-scores", "screen-results"]
    .forEach((id) => $(id).classList.toggle("hidden", id !== screenId));
}

// Update a level badge element's text and style class
function applyLevelBadge(el, level) {
  el.textContent = `Level ${level}`;
  el.classList.toggle("is-level-1", level === 1);
  el.classList.toggle("is-level-2", level === 2);
}

// Pick a random event allowed by the game level without repeating the previous event
function pickNextEvent(level, lastEventId) {
  const pool = EVENTS.filter((ev) => ev.level <= level && ev.id !== lastEventId);
  const candidates = pool.length ? pool : EVENTS.filter((ev) => ev.level <= level);
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

/* --- 1. HOME SCREEN --- */

// Sync visual selection state on the Level 1 and Level 2 cards
function syncHomeSelection() {
  document.querySelectorAll(".level-card[data-level]").forEach((btn) => {
    const selected = Number(btn.dataset.level) === draftLevel;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-pressed", String(selected));
  });
}

// Listen for clicks on Level 1 / Level 2 cards
document.querySelectorAll(".level-card[data-level]").forEach((btn) => {
  btn.addEventListener("click", () => {
    draftLevel = Number(btn.dataset.level);
    syncHomeSelection();
  });
});

// Move to the Players setup screen when clicking "New game"
$("btn-new-game").addEventListener("click", () => {
  draftCount = 3;
  renderPlayersScreen();
  showOnly("screen-players");
});

/* --- 2. PLAYERS SCREEN --- */

// Render the player count buttons and name input rows
function renderPlayersScreen() {
  applyLevelBadge($("players-level-badge"), draftLevel);

  document.querySelectorAll(".count-btn[data-count]").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.count) === draftCount);
  });

  $("player-inputs").innerHTML = Array.from({ length: draftCount }, (_, idx) => {
    const color = PLAYER_COLORS[idx] || PLAYER_COLORS[0];
    const val = draftNames[idx] || "";
    return `
      <div class="player-name-row">
        <span class="token-swatch" style="background:${color}"></span>
        <input
          class="name-input"
          type="text"
          maxlength="24"
          data-player-index="${idx}"
          placeholder="First name"
          value="${escapeHTML(val)}"
          autocomplete="off"
        >
      </div>
    `;
  }).join("");

  $("players-error").classList.add("hidden");
  $("players-error").textContent = "";
}

// Preserve typed names and switch active player count (2, 3, or 4)
document.querySelectorAll(".count-btn[data-count]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".name-input[data-player-index]").forEach((inp) => {
      draftNames[Number(inp.dataset.playerIndex)] = inp.value;
    });
    draftCount = Number(btn.dataset.count);
    renderPlayersScreen();
  });
});

// Create and save a new game at Round 1, then render the Round screen
$("btn-start-game").addEventListener("click", () => {
  const inputs = Array.from(document.querySelectorAll(".name-input[data-player-index]"));
  const players = inputs.map((inp, idx) => ({
    name: inp.value.trim() || `Player ${idx + 1}`,
    color: PLAYER_COLORS[idx] || PLAYER_COLORS[0],
    loyalty: 0,
    conversion: 0,
    coins: 0,
    market: 0,
    mission: false
  }));

  const game = {
    level: draftLevel,
    round: 1,
    eventId: null,
    lastEventId: null,
    phase: "round",
    players
  };
  saveGame(game);
  render();
});

/* --- 3. ROUND SCREEN --- */

// Compute the label for the single round button based on current state
function getRoundButtonLabel(game) {
  if (!game.eventId) return `Round ${game.round}: draw event`;
  if (game.round < TOTAL_ROUNDS) return "Next round: draw event";
  return "End game: calculate scores";
}

// Render the round counter, progress bars, event card/placeholder, and action button
function renderRoundScreen(game) {
  applyLevelBadge($("round-level-badge"), game.level);

  const isFinalRound = game.round === TOTAL_ROUNDS;
  $("round-eyebrow").textContent = isFinalRound ? "Final round" : "Round";
  $("round-eyebrow").classList.toggle("is-final", isFinalRound);
  $("round-counter").textContent = `${game.round}/${TOTAL_ROUNDS}`;

  $("round-bars").innerHTML = Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
    const done = i < game.round;
    const cls = ["round-bar"];
    if (done) cls.push(isFinalRound ? "is-final" : "is-done");
    return `<span class="${cls.join(" ")}"></span>`;
  }).join("");

  const currentEvent = EVENTS.find((e) => e.id === game.eventId);
  if (!currentEvent) {
    $("event-slot").innerHTML = `
      <div class="event-placeholder">
        <div class="q-badge">?</div>
        <p class="eyebrow" style="margin-bottom:8px;">Round event</p>
        <p style="font-weight:800;font-size:1.05rem;margin-bottom:6px;">This round's event will appear here.</p>
        <p style="color:var(--muted);font-size:0.9rem;margin:0;">Everyone ready? Draw the first event.</p>
      </div>
    `;
  } else {
    $("event-slot").innerHTML = `
      <article class="event-card-box">
        <div class="event-card-head">
          <span>Round event</span>
          <span class="event-excl">!</span>
        </div>
        <div class="event-card-body">
          <h2 class="event-title">${escapeHTML(currentEvent.name)}</h2>
          <p class="event-effect">${escapeHTML(currentEvent.effect)}</p>
          <p class="event-footer-tip">Read it out loud. It applies to all players for this round only.</p>
        </div>
      </article>
    `;
  }

  const btn = $("btn-round-action");
  btn.textContent = getRoundButtonLabel(game);
  btn.classList.toggle("is-gold", Boolean(currentEvent) && isFinalRound);
}

// Store callback for the active confirmation modal
let pendingRoundAction = null;

// Open the round confirmation modal
function openRoundModal(title, desc, onConfirm) {
  pendingRoundAction = onConfirm;
  $("modal-round-title").textContent = title;
  $("modal-round-desc").textContent = desc;
  $("modal-round").classList.remove("hidden");
}

// Close the round confirmation modal
function closeRoundModal() {
  pendingRoundAction = null;
  $("modal-round").classList.add("hidden");
}

// Cancel button inside round modal
$("modal-round-cancel").addEventListener("click", closeRoundModal);

// Confirm button inside round modal
$("modal-round-confirm").addEventListener("click", () => {
  const fn = pendingRoundAction;
  closeRoundModal();
  if (typeof fn === "function") fn();
});

// Handle primary round button: draw current round event, advance round, or go to scores
$("btn-round-action").addEventListener("click", () => {
  const game = loadGame();
  if (!game) return;

  // First click in a round draws the event immediately without confirmation
  if (!game.eventId) {
    game.eventId = pickNextEvent(game.level, game.lastEventId);
    saveGame(game);
    renderRoundScreen(game);
    return;
  }

  // Advance to next round (1..5 -> 2..6) after confirmation
  if (game.round < TOTAL_ROUNDS) {
    const nextRoundNum = game.round + 1;
    openRoundModal(
      "Everyone played?",
      `A new event will be drawn for round ${nextRoundNum}.`,
      () => {
        game.round = nextRoundNum;
        game.lastEventId = game.eventId;
        game.eventId = pickNextEvent(game.level, game.lastEventId);
        saveGame(game);
        renderRoundScreen(game);
      }
    );
  } else {
    // After round 6, transition to the final scores screen after confirmation
    openRoundModal(
      "Everyone played?",
      "Round 6 is complete: moving to final score entry.",
      () => {
        game.phase = "scores";
        saveGame(game);
        render();
      }
    );
  }
});

/* --- 4. FINAL SCORES SCREEN --- */

// Render final score cards for each player (with Mission +5 toggle in Level 2)
function renderScoresScreen(game) {
  applyLevelBadge($("scores-level-badge"), game.level);
  $("scores-subtitle").textContent = game.level === 2
    ? "Count your tokens on the board, enter the numbers, then check completed missions."
    : "Count your tokens on the board and enter the numbers for each player.";

  $("score-cards").innerHTML = game.players.map((p, idx) => {
    const missionHtml = game.level === 2 ? `
      <label class="mission-toggle ${p.mission ? "is-checked" : ""}" data-mission-label="${idx}">
        <input type="checkbox" id="m-${idx}" ${p.mission ? "checked" : ""}>
        <span>Mission +5</span>
      </label>
    ` : "";

    return `
      <article class="score-card" id="score-card-${idx}">
        <div class="score-card-head">
          <div class="player-ident">
            <span class="token-swatch" style="background:${p.color}"></span>
            <span>${escapeHTML(p.name)}</span>
          </div>
          ${missionHtml}
        </div>
        <div class="metrics-grid">
          <div class="metric-box">
            <label for="loyalty-${idx}">Loyalty</label>
            <input type="number" min="0" max="30" step="1" id="loyalty-${idx}" value="${p.loyalty || ""}" placeholder="-">
          </div>
          <div class="metric-box">
            <label for="conversion-${idx}">Conversion</label>
            <input type="number" min="0" max="30" step="1" id="conversion-${idx}" value="${p.conversion || ""}" placeholder="-">
          </div>
          <div class="metric-box is-gold">
            <label for="coins-${idx}">Coins left</label>
            <input type="number" min="0" step="1" id="coins-${idx}" value="${p.coins || ""}" placeholder="-">
          </div>
          <div class="metric-box is-dark">
            <label for="market-${idx}">Market tokens</label>
            <input type="number" min="0" max="30" step="1" id="market-${idx}" value="${p.market || ""}" placeholder="-">
          </div>
        </div>
        <p id="score-err-${idx}" class="error-text hidden"></p>
      </article>
    `;
  }).join("");

  // Toggle active pill styling when Mission +5 checkbox changes
  document.querySelectorAll("[data-mission-label]").forEach((lbl) => {
    const chk = lbl.querySelector('input[type="checkbox"]');
    chk.addEventListener("change", () => {
      lbl.classList.toggle("is-checked", chk.checked);
    });
  });
}

// Parse a non-negative integer field (empty input defaults to 0)
function parseNonNegInt(raw) {
  if (raw === "" || raw === null || raw === undefined) return 0;
  if (!/^\d+$/.test(String(raw).trim())) return NaN;
  return Number(raw);
}

// Validate inputs, save final player figures, and switch to Results screen
$("scores-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const game = loadGame();
  if (!game) return;

  let hasError = false;
  const updatedPlayers = game.players.map((p, idx) => {
    const card = $(`score-card-${idx}`);
    const errEl = $(`score-err-${idx}`);
    card.classList.remove("has-error");
    errEl.classList.add("hidden");
    errEl.textContent = "";

    const loyalty = parseNonNegInt($(`loyalty-${idx}`).value);
    const conversion = parseNonNegInt($(`conversion-${idx}`).value);
    const coins = parseNonNegInt($(`coins-${idx}`).value);
    const market = parseNonNegInt($(`market-${idx}`).value);
    const mission = game.level === 2 ? Boolean($(`m-${idx}`)?.checked) : false;

    let msg = "";
    if ([loyalty, conversion, coins, market].some((n) => Number.isNaN(n) || n < 0)) {
      msg = "Please enter whole numbers greater than or equal to zero.";
    } else if (market > TOTAL_TOKENS) {
      msg = `Market tokens cannot exceed ${TOTAL_TOKENS}.`;
    } else if (loyalty + conversion > TOTAL_TOKENS - market) {
      msg = `Loyalty + Conversion (${loyalty + conversion}) cannot exceed entered prospects (${TOTAL_TOKENS - market}).`;
    }

    if (msg) {
      hasError = true;
      card.classList.add("has-error");
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }

    return { ...p, loyalty, conversion, coins, market, mission };
  });

  if (hasError) return;

  game.players = updatedPlayers;
  game.phase = "results";
  saveGame(game);
  render();
});

/* --- 5. RESULTS SCREEN --- */

// Calculate conversion rates, bonuses, mission points, and sorted standings
function computeStandings(game) {
  const rated = game.players.map((p) => {
    const entered = TOTAL_TOKENS - p.market;
    const customers = p.loyalty + p.conversion;
    const rate = entered > 0 ? customers / entered : 0;
    return { ...p, rate };
  });

  const bestRate = Math.max(...rated.map((p) => p.rate));

  return rated
    .map((p) => {
      const hasBonus = bestRate > 0 && Math.abs(p.rate - bestRate) < 1e-9;
      const bonus = hasBonus ? 3 : 0;
      const missionPts = game.level === 2 && p.mission ? 5 : 0;
      const pts = 3 * p.loyalty + 2 * p.conversion + Math.floor(p.coins / 5) + bonus + missionPts;
      return { ...p, hasBonus, bonus, missionPts, pts };
    })
    .sort((a, b) => b.pts - a.pts || b.rate - a.rate);
}

// Render winner banner and runner-up cards
function renderResultsScreen(game) {
  applyLevelBadge($("results-level-badge"), game.level);
  const standings = computeStandings(game);
  const topScore = standings[0]?.pts ?? 0;
  const winners = standings.filter((p) => p.pts === topScore);
  const mainWinner = winners[0];

  const winnerLabel = winners.length > 1
    ? winners.map((w) => escapeHTML(w.name)).join(" & ")
    : escapeHTML(mainWinner.name);

  $("winner-banner").innerHTML = `
    <div>
      <div class="winner-eyebrow">${winners.length > 1 ? "Tie · Winners" : "Winner"}</div>
      <div class="winner-name-row">
        <span class="winner-dot" style="background:${mainWinner.color}"></span>
        <span>${winnerLabel}</span>
      </div>
      <div class="winner-meta">
        Conversion rate ${Math.round(mainWinner.rate * 100)}%
        ${mainWinner.missionPts ? `<br>Mission completed +${mainWinner.missionPts}` : ""}
        ${mainWinner.hasBonus ? `<br>Best rate +${mainWinner.bonus}` : ""}
      </div>
    </div>
    <div class="score-coin">
      <strong>${mainWinner.pts}</strong>
      <span>POINTS</span>
    </div>
  `;

  $("runners-list").innerHTML = standings.slice(1).map((p, idx) => `
    <article class="runner-up-card">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="rank-badge" style="background:${p.color}">${idx + 2}</span>
        <div>
          <div class="runner-title">${escapeHTML(p.name)}</div>
          <div class="runner-sub">
            Loyalty ${p.loyalty} · Conversion ${p.conversion} · Coins ${p.coins}
            ${p.missionPts ? " · Mission +5" : ""}
            ${p.hasBonus ? " · Bonus +3" : ""}
          </div>
        </div>
      </div>
      <div class="runner-pts">${p.pts} PTS</div>
    </article>
  `).join("");
}

/* --- ERASE GAME MODAL --- */

// Show erase confirmation dialog
function openResetModal() {
  $("modal-reset").classList.remove("hidden");
}

// Hide erase confirmation dialog
function closeResetModal() {
  $("modal-reset").classList.add("hidden");
}

// Open modal from Results "New game" button
$("btn-results-new-game").addEventListener("click", openResetModal);

// Close modal on Cancel
$("modal-reset-cancel").addEventListener("click", closeResetModal);

// Clear saved game and return to Home screen on Erase
$("modal-reset-confirm").addEventListener("click", () => {
  closeResetModal();
  clearGame();
  draftNames = ["", "", "", ""];
  render();
});

// Router: choose which screen to display based on saved game state
function render() {
  const game = loadGame();
  if (!game) {
    syncHomeSelection();
    showOnly("screen-home");
    return;
  }
  if (game.phase === "scores") {
    renderScoresScreen(game);
    showOnly("screen-scores");
    return;
  }
  if (game.phase === "results") {
    renderResultsScreen(game);
    showOnly("screen-results");
    return;
  }
  renderRoundScreen(game);
  showOnly("screen-round");
}

// Initial render on page load
render();