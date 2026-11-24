// Import game definitions, funnel stages, events, and scoring helpers
import {
  PLAYER_COLORS,
  LEVEL_CONFIG,
  TOTAL_ROUNDS,
  FUNNEL_FLOORS,
  EVENTS,
  computePlayerScore,
  rankPlayers,
} from "./data.js";

// LocalStorage persistence key
const STORAGE_KEY = "funnel_rush_state_v1";

// Build initial default state object
function createDefaultState() {
  return {
    screen: "home", // "home" | "players" | "round" | "scores" | "results"
    level: 2, // 1 or 2
    playerCount: 3, // 2, 3, or 4
    playerNames: ["", "", "", ""], // First names per token color slot
    round: 1, // 1..6
    eventDrawn: false, // Whether current round's event has been revealed
    drawnEventIds: [], // History of drawn event IDs
    currentEventId: null, // Active event ID in current round
    scores: [
      { market: "", interest: "", conversion: "", coins: "", mission: false },
      { market: "", interest: "", conversion: "", coins: "", mission: false },
      { market: "", interest: "", conversion: "", coins: "", mission: false },
      { market: "", interest: "", conversion: "", coins: "", mission: false },
    ],
  };
}

// Load persisted state from localStorage or fall back to defaults
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    const base = createDefaultState();
    const validScreens = ["home", "players", "round", "scores", "results"];
    return {
      ...base,
      ...parsed,
      screen: validScreens.includes(parsed.screen) ? parsed.screen : "home",
      level: parsed.level === 1 ? 1 : 2,
      playerCount: [2, 3, 4].includes(parsed.playerCount) ? parsed.playerCount : 3,
      playerNames: Array.isArray(parsed.playerNames)
        ? [0, 1, 2, 3].map((i) => String(parsed.playerNames[i] ?? ""))
        : base.playerNames,
      round: Math.min(TOTAL_ROUNDS, Math.max(1, Number(parsed.round) || 1)),
      eventDrawn: Boolean(parsed.eventDrawn),
      currentEventId: parsed.currentEventId ?? null,
      drawnEventIds: Array.isArray(parsed.drawnEventIds) ? parsed.drawnEventIds : [],
      scores: Array.isArray(parsed.scores)
        ? [0, 1, 2, 3].map((i) => ({
            ...base.scores[i],
            ...(parsed.scores[i] || {}),
          }))
        : base.scores,
    };
  } catch {
    return createDefaultState();
  }
}

// Persist current state to localStorage
function saveState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
}

// Clear persisted game state only when explicitly requested
function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

// Check if a game is currently in progress (beyond home screen)
function hasActiveGame(currentState) {
  return currentState.screen !== "home";
}

// Application state instance
let state = loadState();
// Pending callback for confirmation modal
let pendingModalAction = null;

// Cache DOM references
const els = {
  screens: {
    home: document.getElementById("screen-home"),
    players: document.getElementById("screen-players"),
    round: document.getElementById("screen-round"),
    scores: document.getElementById("screen-scores"),
    results: document.getElementById("screen-results"),
  },
  levelCards: [...document.querySelectorAll(".level-card")],
  btnNewGame: document.getElementById("btn-new-game"),
  playersLevelBadge: document.getElementById("players-level-badge"),
  countBtns: [...document.querySelectorAll(".count-btn")],
  playerInputs: document.getElementById("player-inputs"),
  playersError: document.getElementById("players-error"),
  btnStartGame: document.getElementById("btn-start-game"),
  roundLevelBadge: document.getElementById("round-level-badge"),
  roundEyebrow: document.getElementById("round-eyebrow"),
  roundCounter: document.getElementById("round-counter"),
  roundBars: document.getElementById("round-bars"),
  eventSlot: document.getElementById("event-slot"),
  btnRoundAction: document.getElementById("btn-round-action"),
  scoresLevelBadge: document.getElementById("scores-level-badge"),
  scoresSubtitle: document.getElementById("scores-subtitle"),
  scoresForm: document.getElementById("scores-form"),
  scoreCards: document.getElementById("score-cards"),
  resultsLevelBadge: document.getElementById("results-level-badge"),
  winnerBanner: document.getElementById("winner-banner"),
  runnersList: document.getElementById("runners-list"),
  btnResultsNewGame: document.getElementById("btn-results-new-game"),
  modalRound: document.getElementById("modal-round"),
  modalRoundTitle: document.getElementById("modal-round-title"),
  modalRoundDesc: document.getElementById("modal-round-desc"),
  modalRoundCancel: document.getElementById("modal-round-cancel"),
  modalRoundConfirm: document.getElementById("modal-round-confirm"),
  modalReset: document.getElementById("modal-reset"),
  modalResetCancel: document.getElementById("modal-reset-cancel"),
  modalResetConfirm: document.getElementById("modal-reset-confirm"),
};

// Apply level styling to any header badge
function applyLevelBadge(badgeEl, level) {
  if (!badgeEl) return;
  badgeEl.textContent = `Level ${level}`;
  badgeEl.classList.toggle("is-level-1", level === 1);
  badgeEl.classList.toggle("is-level-2", level === 2);
}

// Show only the target screen and save state without wiping game progress
function showScreen(screenName) {
  state.screen = screenName;
  saveState(state);
  Object.entries(els.screens).forEach(([key, section]) => {
    section.classList.toggle("hidden", key !== screenName);
  });
  renderCurrentScreen();
}

// Render home level selection cards and primary CTA label
function renderHome() {
  els.levelCards.forEach((card) => {
    const lvl = Number(card.dataset.level);
    const selected = state.level === lvl;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });

  if (els.btnNewGame) {
    els.btnNewGame.textContent = hasActiveGame(state) ? "Resume game" : "New game";
  }
}

// Render player setup inputs based on playerCount
function renderPlayers() {
  applyLevelBadge(els.playersLevelBadge, state.level);
  els.countBtns.forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.count) === state.playerCount);
  });

  els.playerInputs.innerHTML = "";
  for (let i = 0; i < state.playerCount; i += 1) {
    const color = PLAYER_COLORS[i];
    const row = document.createElement("div");
    row.className = "player-name-row";

    const swatch = document.createElement("span");
    swatch.className = "token-swatch";
    swatch.style.background = color.hex;
    swatch.title = color.name;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = `Player ${i + 1} (${color.name})`;
    input.maxLength = 20;
    input.value = state.playerNames[i] || "";
    input.dataset.index = String(i);

    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.index);
      state.playerNames[idx] = e.target.value;
      els.playersError.classList.add("hidden");
      saveState(state);
    });

    row.append(swatch, input);
    els.playerInputs.appendChild(row);
  }
}

// Pick a random event card for the current round
function pickRandomEvent() {
  const unused = EVENTS.filter((ev) => !state.drawnEventIds.includes(ev.id));
  const pool = unused.length > 0 ? unused : EVENTS;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  state.currentEventId = chosen.id;
  state.eventDrawn = true;
  if (!state.drawnEventIds.includes(chosen.id)) {
    state.drawnEventIds.push(chosen.id);
  }
  saveState(state);
  return chosen;
}

// Render round progress and event card slot
function renderRound() {
  applyLevelBadge(els.roundLevelBadge, state.level);
  const isFinal = state.round === TOTAL_ROUNDS;

  els.roundEyebrow.textContent = isFinal ? "Final round" : "Round";
  els.roundEyebrow.classList.toggle("is-final", isFinal);
  els.roundCounter.textContent = `${state.round}/${TOTAL_ROUNDS}`;

  els.roundBars.innerHTML = "";
  for (let r = 1; r <= TOTAL_ROUNDS; r += 1) {
    const bar = document.createElement("span");
    bar.className = "round-bar";
    if (r <= state.round) {
      bar.classList.add(isFinal && r === TOTAL_ROUNDS ? "is-final" : "is-done");
    }
    els.roundBars.appendChild(bar);
  }

  if (!state.eventDrawn) {
    els.eventSlot.innerHTML = `
      <div class="event-placeholder">
        <div class="q-badge">?</div>
        <p class="screen-subtitle" style="margin-bottom:0;">Draw this round's event card when everyone is ready.</p>
      </div>
    `;
    els.btnRoundAction.textContent = `Round ${state.round}: draw event`;
  } else {
    const ev = EVENTS.find((item) => item.id === state.currentEventId) || EVENTS[0];
    const evTitle = ev.title || ev.name;
    const floor = FUNNEL_FLOORS[ev.floor] || { label: ev.floor };
    els.eventSlot.innerHTML = `
      <div class="event-card-box">
        <div class="event-card-head">
          <span>Event · ${floor.label}</span>
          <span class="event-excl">!</span>
        </div>
        <div class="event-card-body">
          <h2 class="event-title">${evTitle}</h2>
          <p class="event-effect">${ev.effect}</p>
          <p class="event-footer-tip">Apply this effect during Round ${state.round}, then advance when everyone has played.</p>
        </div>
      </div>
    `;
    els.btnRoundAction.textContent = isFinal ? "Finish game & enter scores" : `Next round (${state.round + 1}/${TOTAL_ROUNDS})`;
  }
}

// Render score entry cards for active players
function renderScores() {
  applyLevelBadge(els.scoresLevelBadge, state.level);
  els.scoresSubtitle.textContent =
    state.level === 2
      ? "Count your tokens on the board, enter the numbers, then check completed missions (+5 pts)."
      : "Count your tokens on the board and enter the numbers for each player.";

  els.scoreCards.innerHTML = "";
  for (let i = 0; i < state.playerCount; i += 1) {
    const color = PLAYER_COLORS[i];
    const name = (state.playerNames[i] || "").trim() || `Player ${i + 1}`;
    const sc = state.scores[i];

    const card = document.createElement("div");
    card.className = "score-card";
    card.dataset.playerIndex = String(i);

    const missionHtml =
      state.level === 2
        ? `
          <label class="mission-toggle ${sc.mission ? "is-checked" : ""}">
            <input type="checkbox" data-field="mission" ${sc.mission ? "checked" : ""}>
            <span>Mission +5</span>
          </label>
        `
        : "";

    card.innerHTML = `
      <div class="score-card-head">
        <div class="player-ident">
          <span class="token-swatch" style="background:${color.hex};width:20px;height:20px;border-width:3px;"></span>
          <span>${name}</span>
        </div>
        ${missionHtml}
      </div>
      <div class="metrics-grid">
        <div class="metric-box is-dark">
          <label>Market tokens<br><span class="coin-line">board</span></label>
          <input type="number" min="0" step="1" inputmode="numeric" data-field="market" value="${sc.market}">
        </div>
        <div class="metric-box">
          <label>Interest tokens<br><span class="coin-line">funnel</span></label>
          <input type="number" min="0" step="1" inputmode="numeric" data-field="interest" value="${sc.interest}">
        </div>
        <div class="metric-box">
          <label>Conversion tokens<br><span class="coin-line">customers</span></label>
          <input type="number" min="0" step="1" inputmode="numeric" data-field="conversion" value="${sc.conversion}">
        </div>
        <div class="metric-box is-gold">
          <label>Remaining<br><span class="coin-line">coins</span></label>
          <input type="number" min="0" step="1" inputmode="numeric" data-field="coins" value="${sc.coins}">
        </div>
      </div>
      <p class="error-text hidden" data-role="card-error"></p>
    `;

    card.querySelectorAll("input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const field = inp.dataset.field;
        if (field === "mission") {
          state.scores[i].mission = inp.checked;
          inp.closest(".mission-toggle")?.classList.toggle("is-checked", inp.checked);
        } else {
          state.scores[i][field] = inp.value;
        }
        card.classList.remove("has-error");
        const errEl = card.querySelector('[data-role="card-error"]');
        if (errEl) errEl.classList.add("hidden");
        saveState(state);
      });
    });

    els.scoreCards.appendChild(card);
  }
}

// Render final winner banner and ranked runners-up
function renderResults() {
  applyLevelBadge(els.resultsLevelBadge, state.level);

  const activePlayers = [];
  for (let i = 0; i < state.playerCount; i += 1) {
    const color = PLAYER_COLORS[i];
    const name = (state.playerNames[i] || "").trim() || `Player ${i + 1}`;
    const sc = state.scores[i];
    const breakdown = computePlayerScore(sc, state.level);
    activePlayers.push({
      index: i,
      name,
      color,
      ...breakdown,
    });
  }

  const ranked = rankPlayers(activePlayers);
  const winner = ranked[0];
  const runners = ranked.slice(1);

  if (!winner) return;

  const ratePct = Math.round(winner.conversionRate * 100);
  els.winnerBanner.innerHTML = `
    <div class="winner-card">
      <div>
        <div class="winner-eyebrow">Winner</div>
        <div class="winner-name-row">
          <span class="winner-dot" style="background:${winner.color.hex};"></span>
          <span>${winner.name}</span>
        </div>
        <div class="winner-meta">
          Conversion: ${ratePct}%${winner.hasConversionBonus ? " · +3 rate bonus" : ""}
        </div>
      </div>
      <div class="score-coin">
        <strong>${winner.totalPoints}</strong>
        <span>POINTS</span>
      </div>
    </div>
  `;

  els.runnersList.innerHTML = runners
    .map((p, idx) => {
      const rankNum = idx + 2;
      const pct = Math.round(p.conversionRate * 100);
      return `
        <div class="runner-up-card">
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="rank-badge" style="background:${p.color.hex};">${rankNum}</span>
            <div>
              <div class="runner-title">${p.name}</div>
              <div class="runner-sub">Conv. ${pct}%${p.hasConversionBonus ? " · +3 bonus" : ""}${p.missionBonus ? " · +5 mission" : ""}</div>
            </div>
          </div>
          <div class="runner-pts">${p.totalPoints} pts</div>
        </div>
      `;
    })
    .join("");
}

// Dispatch rendering for active screen and keep hidden state synchronized
function renderCurrentScreen() {
  Object.entries(els.screens).forEach(([key, section]) => {
    if (section) {
      section.classList.toggle("hidden", key !== state.screen);
    }
  });
  renderHome();
  if (state.screen === "players") renderPlayers();
  if (state.screen === "round") renderRound();
  if (state.screen === "scores") renderScores();
  if (state.screen === "results") renderResults();
}

// Open confirmation modal
function openModal(modalEl, title, desc, onConfirm) {
  pendingModalAction = onConfirm;
  if (title && els.modalRoundTitle && modalEl === els.modalRound) {
    els.modalRoundTitle.textContent = title;
  }
  if (desc && els.modalRoundDesc && modalEl === els.modalRound) {
    els.modalRoundDesc.textContent = desc;
  }
  modalEl.classList.remove("hidden");
}

// Close confirmation modal
function closeModal(modalEl) {
  modalEl.classList.add("hidden");
  pendingModalAction = null;
}

// Level selection handlers on home screen (updates level without erasing active game)
els.levelCards.forEach((card) => {
  card.addEventListener("click", () => {
    state.level = Number(card.dataset.level) === 1 ? 1 : 2;
    saveState(state);
    renderHome();
  });
});

// Resume active game or start fresh player setup without losing saved game if resuming
els.btnNewGame.addEventListener("click", () => {
  if (hasActiveGame(state)) {
    showScreen(state.screen);
    return;
  }
  const cfg = LEVEL_CONFIG[state.level];
  state.scores = [0, 1, 2, 3].map(() => ({
    market: "",
    interest: "",
    conversion: "",
    coins: String(cfg.startingCoins),
    mission: false,
  }));
  showScreen("players");
});

// Player count switcher handlers
els.countBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.playerCount = Number(btn.dataset.count);
    els.playersError.classList.add("hidden");
    saveState(state);
    renderPlayers();
  });
});

// Start round 1 from players screen
els.btnStartGame.addEventListener("click", () => {
  const inputs = [...els.playerInputs.querySelectorAll(".name-input")];
  const names = inputs.map((inp) => inp.value.trim());
  if (names.some((n) => n.length === 0)) {
    els.playersError.textContent = "Please enter a first name for every player.";
    els.playersError.classList.remove("hidden");
    return;
  }
  names.forEach((n, idx) => {
    state.playerNames[idx] = n;
  });
  state.round = 1;
  state.eventDrawn = false;
  state.drawnEventIds = [];
  state.currentEventId = null;
  saveState(state);
  showScreen("round");
});

// Round action button: draw event or advance round / finish game
els.btnRoundAction.addEventListener("click", () => {
  if (!state.eventDrawn) {
    pickRandomEvent();
    renderRound();
    return;
  }

  if (state.round < TOTAL_ROUNDS) {
    openModal(
      els.modalRound,
      "Everyone played?",
      `Advance from Round ${state.round}/${TOTAL_ROUNDS} to Round ${state.round + 1}/${TOTAL_ROUNDS}?`,
      () => {
        state.round += 1;
        state.eventDrawn = false;
        state.currentEventId = null;
        saveState(state);
        renderRound();
      }
    );
  } else {
    openModal(
      els.modalRound,
      "Finish game?",
      "All 6 rounds are complete. Enter final scores now?",
      () => {
        showScreen("scores");
      }
    );
  }
});

// Validate and submit final scores form
els.scoresForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let allValid = true;

  for (let i = 0; i < state.playerCount; i += 1) {
    const card = els.scoreCards.querySelector(`.score-card[data-player-index="${i}"]`);
    const errEl = card?.querySelector('[data-role="card-error"]');
    const sc = state.scores[i];

    const values = [sc.market, sc.interest, sc.conversion, sc.coins];
    const invalid = values.some((v) => v === "" || Number.isNaN(Number(v)) || Number(v) < 0);

    if (invalid) {
      allValid = false;
      card?.classList.add("has-error");
      if (errEl) {
        errEl.textContent = "Enter a valid non-negative number for each field.";
        errEl.classList.remove("hidden");
      }
    } else {
      card?.classList.remove("has-error");
      if (errEl) errEl.classList.add("hidden");
    }
  }

  if (!allValid) return;
  showScreen("results");
});

// Open reset confirmation modal from results screen
els.btnResultsNewGame.addEventListener("click", () => {
  openModal(els.modalReset, "Erase game?", "Scores will be deleted from this device.", () => {
    clearSavedState();
    state = createDefaultState();
    showScreen("home");
  });
});

// Modal button listeners
els.modalRoundCancel.addEventListener("click", () => closeModal(els.modalRound));
els.modalRoundConfirm.addEventListener("click", () => {
  const fn = pendingModalAction;
  closeModal(els.modalRound);
  if (typeof fn === "function") fn();
});

els.modalResetCancel.addEventListener("click", () => closeModal(els.modalReset));
els.modalResetConfirm.addEventListener("click", () => {
  const fn = pendingModalAction;
  closeModal(els.modalReset);
  if (typeof fn === "function") fn();
});

// Initial render on load (automatically opens saved screen if a game is active)
renderCurrentScreen();