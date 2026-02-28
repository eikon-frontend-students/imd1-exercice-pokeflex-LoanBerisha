(function () {
  "use strict";

  const DEFAULT_POKEMON = "Gruikui";
  const HISTORY_KEY = "pokeflex_history";
  const HISTORY_MAX = 5;
  const COUNTS_KEY = "pokeflex_counts";
  const DEFAULT_TOP = ["Pikachu", "Dracaufeu", "Mewtwo", "Mew", "Ronflex"];
  const API_BASE_URL = "https://pokebuildapi.fr/api/v1/pokemon/";
  const CACHE_PREFIX = "pokeflex_";

  let activeTypeFilter = null;
  let searchForm, pokemonInput, errorMessage, cardsContainer, cardTemplate, searchHistory, topSearchedSection;

  document.addEventListener("DOMContentLoaded", () => {
    searchForm = document.getElementById("search-form");
    pokemonInput = document.getElementById("pokemon-input");
    errorMessage = document.getElementById("error-message");
    cardsContainer = document.getElementById("cards-container");
    cardTemplate = document.getElementById("pokemon-card-template");
    searchHistory = document.getElementById("search-history");
    topSearchedSection = document.getElementById("top-searched");

    if (!searchForm || !pokemonInput || !errorMessage || !cardsContainer || !cardTemplate) {
      console.error("PokéCSS: Éléments HTML manquants. Vérifie que tu n'as pas modifié les IDs.");
      return;
    }

    searchForm.addEventListener("submit", handleSearch);
    renderHistory();
    loadDefaultTop();

    if (DEFAULT_POKEMON?.trim()) {
      loadDefaultPokemon(DEFAULT_POKEMON.trim());
    }
  });

  async function loadDefaultPokemon(name) {
    try {
      createPokemonCard(await fetchPokemon(name));
    } catch (error) {
      console.warn("PokéCSS: Impossible de charger le Pokémon par défaut:", error.message);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const searchValue = pokemonInput.value.trim();
    if (searchValue) await searchPokemon(searchValue);
  }

  async function searchPokemon(name) {
    hideError();
    const submitBtn = searchForm.querySelector(".search-button");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "..."; }
    try {
      createPokemonCard(await fetchPokemon(name));
      saveToHistory(name);
      saveSearchCount(name);
      renderTopSearched();
      pokemonInput.value = "";
    } catch (error) {
      showError(error.message);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Chercher"; }
    }
  }

  function makeFilterBtn(label, type) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "type-filter-btn" + (activeTypeFilter === type ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => setTypeFilter(type));
    return btn;
  }

  function setTypeFilter(type) {
    activeTypeFilter = type;
    cardsContainer.querySelectorAll(".card").forEach(card => {
      card.hidden = type !== null && !(card.dataset.types || "").split(" ").includes(type);
    });
    updateTypeFilters();
  }

  function updateTypeFilters() {
    const container = document.getElementById("type-filters");
    if (!container) return;
    const types = new Set();
    cardsContainer.querySelectorAll(".card").forEach(card => {
      (card.dataset.types || "").split(" ").filter(Boolean).forEach(t => types.add(t));
    });
    if (activeTypeFilter && !types.has(activeTypeFilter)) {
      activeTypeFilter = null;
      cardsContainer.querySelectorAll(".card").forEach(c => { c.hidden = false; });
    }
    container.hidden = types.size === 0;
    if (types.size === 0) return;
    container.innerHTML = "";
    container.appendChild(makeFilterBtn("Tous", null));
    types.forEach(type => {
      container.appendChild(makeFilterBtn(type.charAt(0).toUpperCase() + type.slice(1), type));
    });
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveToHistory(name) {
    const history = [name, ...loadHistory().filter(h => h.toLowerCase() !== name.toLowerCase())].slice(0, HISTORY_MAX);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) {}
    renderHistory();
  }

  function renderHistory() {
    if (!searchHistory) return;
    searchHistory.innerHTML = "";
    loadHistory().forEach(name => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "history-chip";
      chip.textContent = name;
      chip.addEventListener("click", () => searchPokemon(name));
      searchHistory.appendChild(chip);
    });
  }

  function loadCounts() {
    try { return JSON.parse(localStorage.getItem(COUNTS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveSearchCount(name) {
    const counts = loadCounts();
    const key = name.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
    try { localStorage.setItem(COUNTS_KEY, JSON.stringify(counts)); } catch (e) {}
  }

  async function loadDefaultTop() {
    for (const name of DEFAULT_TOP) {
      if (!getFromCache(name)) {
        try { await fetchPokemon(name); } catch (e) {}
      }
    }
    renderTopSearched();
  }

  function renderTopSearched() {
    if (!topSearchedSection) return;
    const counts = loadCounts();
    const names = Object.keys(counts).length > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name)
      : DEFAULT_TOP.map(n => n.toLowerCase());

    const top = [...new Set(names)]
      .map(name => {
        const cached = getFromCache(name);
        return cached ? { name: cached.name || name, image: cached.image || "" } : null;
      })
      .filter(Boolean);

    topSearchedSection.hidden = top.length === 0;
    if (top.length === 0) return;

    const list = topSearchedSection.querySelector(".top-searched-list");
    list.innerHTML = "";
    top.forEach(pokemon => {
      const item = document.createElement("div");
      item.className = "top-searched-item";
      item.addEventListener("click", () => searchPokemon(pokemon.name));
      const img = document.createElement("img");
      img.src = pokemon.image;
      img.alt = pokemon.name;
      img.className = "top-searched-img";
      const nameEl = document.createElement("span");
      nameEl.className = "top-searched-name";
      nameEl.textContent = pokemon.name;
      item.append(img, nameEl);
      list.appendChild(item);
    });
  }

  function getCacheKey(name) {
    return CACHE_PREFIX + name.toLowerCase();
  }

  function getFromCache(name) {
    try {
      const cached = localStorage.getItem(getCacheKey(name));
      return cached ? JSON.parse(cached) : null;
    } catch (e) { return null; }
  }

  function saveToCache(name, data) {
    try { localStorage.setItem(getCacheKey(name), JSON.stringify(data)); } catch (e) {}
  }

  async function fetchPokemon(name) {
    const cached = getFromCache(name);
    if (cached) return cached;

    const response = await fetch(API_BASE_URL + encodeURIComponent(name)).catch(() => {
      throw new Error("Erreur de connexion. Vérifie ta connexion internet.");
    });

    if (response.status === 404) throw new Error("Pokémon introuvable. Vérifie l'orthographe.");
    if (!response.ok) throw new Error("Erreur de connexion ou Pokémon introuvable. Réessaie plus tard.");

    const data = await response.json();
    saveToCache(name, data);
    return data;
  }

  function createPokemonCard(pokemon) {
    const card = cardTemplate.content.cloneNode(true).querySelector(".card");

    const imageEl = card.querySelector('[data-field="image"]');
    if (imageEl) { imageEl.src = pokemon.image || ""; imageEl.alt = "Image de " + (pokemon.name || "Pokémon"); }

    const nameEl = card.querySelector('[data-field="name"]');
    if (nameEl) nameEl.textContent = pokemon.name || "Inconnu";

    const idEl = card.querySelector('[data-field="id"]');
    if (idEl) idEl.textContent = pokemon.id ?? "—";

    const generationEl = card.querySelector('[data-field="generation"]');
    if (generationEl) generationEl.textContent = pokemon.apiGeneration ?? pokemon.generation ?? "—";

    const typesContainer = card.querySelector('[data-field="types-container"]');
    if (typesContainer) {
      const types = extractTypes(pokemon);
      card.dataset.types = types.map(t => t.toLowerCase()).join(" ");
      card.dataset.primaryType = (types[0] || "").toLowerCase();
      typesContainer.innerHTML = "";
      types.forEach(typeName => {
        const badge = document.createElement("span");
        badge.className = "type-badge";
        badge.textContent = typeName;
        badge.dataset.type = typeName.toLowerCase();
        typesContainer.appendChild(badge);
      });
    }

    const stats = extractStats(pokemon);
    [
      ["hp", stats.hp],
      ["attack", stats.attack],
      ["defense", stats.defense],
      ["special-attack", stats.specialAttack],
      ["special-defense", stats.specialDefense],
      ["speed", stats.speed],
    ].forEach(([key, val]) => {
      const valEl = card.querySelector(`[data-stat="${key}"]`);
      if (valEl) valEl.textContent = val;
      const bar = card.querySelector(`[data-stat-bar="${key}"]`);
      if (!bar || typeof val !== "number") return;
      const pct = Math.min(100, Math.round((val / 255) * 100));
      bar.style.width = pct + "%";
      bar.style.background = val < 50 ? "#e74c3c" : val < 90 ? "#f39c12" : "#2ecc71";
    });

    card.querySelector(".card-close")?.addEventListener("click", () => {
      card.remove();
      setTypeFilter(activeTypeFilter);
    });

    cardsContainer.appendChild(card);
    updateTypeFilters();
  }

  function extractTypes(pokemon) {
    if (Array.isArray(pokemon.apiTypes)) return pokemon.apiTypes.map(t => t.name || "Type");
    if (Array.isArray(pokemon.types)) {
      return pokemon.types.map(t => (typeof t === "object" ? t.name : t) || "Type");
    }
    return ["—"];
  }

  function extractStats(pokemon) {
    if (!pokemon.stats) return { hp: "—", attack: "—", defense: "—", specialAttack: "—", specialDefense: "—", speed: "—" };
    const s = pokemon.stats;
    return {
      hp: s.HP ?? s.hp ?? "—",
      attack: s.attack ?? s.Attack ?? "—",
      defense: s.defense ?? s.Defense ?? "—",
      specialAttack: s.special_attack ?? s.specialAttack ?? s["special-attack"] ?? "—",
      specialDefense: s.special_defense ?? s.specialDefense ?? s["special-defense"] ?? "—",
      speed: s.speed ?? s.Speed ?? "—",
    };
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.removeAttribute("hidden");
  }

  function hideError() {
    errorMessage.textContent = "";
    errorMessage.setAttribute("hidden", "");
  }
})();
