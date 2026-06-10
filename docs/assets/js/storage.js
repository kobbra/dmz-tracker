(function () {
  var STORAGE_KEY = "dmz-tracker:v1:task-counts";
  var TEST_KEY = "dmz-tracker:storage-check";
  var DEFAULT_FAVORITES_LAYOUT = {
    fullscreenColumns: 6,
    showSearch: true,
    homeColumns: 1,
    showStickyNote: false
  };
  var DEFAULT_CATEGORY_LAYOUT = {
    columns: 1
  };
  var DEFAULT_STICKY_NOTE = {
    content: ""
  };
  var DEFAULT_UPGRADE_VISIBILITY = {
    showCrownUpgrades: true
  };
  var STICKY_NOTE_FAVORITE_REF = "note:sticky";
  var storageAvailable = checkStorage();
  var state = loadState();

  function buildFavoriteRef(type, value) {
    return type + ":" + value;
  }

  function parseFavoriteRef(value) {
    var match;

    if (typeof value !== "string") {
      return null;
    }

    match = value.match(/^(upgrade|recipe|note):(.+)$/);

    if (!match || !match[2]) {
      return null;
    }

    return {
      type: match[1],
      value: match[2]
    };
  }

  function pushUniqueValue(list, value) {
    if (typeof value !== "string" || !value || list.indexOf(value) !== -1) {
      return;
    }

    list.push(value);
  }

  function buildFavoriteOrder(favoriteOrder, favoriteUpgradeIds, favoriteRecipeKeys, showStickyNote) {
    var available = Object.create(null);
    var seen = Object.create(null);
    var ordered = [];

    favoriteUpgradeIds.forEach(function (upgradeId) {
      available[buildFavoriteRef("upgrade", upgradeId)] = true;
    });

    favoriteRecipeKeys.forEach(function (recipeKey) {
      available[buildFavoriteRef("recipe", recipeKey)] = true;
    });

    if (showStickyNote) {
      available[STICKY_NOTE_FAVORITE_REF] = true;
    }

    if (Array.isArray(favoriteOrder)) {
      favoriteOrder.forEach(function (favoriteRef) {
        var parsed = parseFavoriteRef(favoriteRef);

        if (!parsed || !available[favoriteRef] || seen[favoriteRef]) {
          return;
        }

        seen[favoriteRef] = true;
        ordered.push(favoriteRef);
      });
    }

    if (showStickyNote && !seen[STICKY_NOTE_FAVORITE_REF]) {
      seen[STICKY_NOTE_FAVORITE_REF] = true;
      ordered.unshift(STICKY_NOTE_FAVORITE_REF);
    }

    favoriteUpgradeIds.forEach(function (upgradeId) {
      var favoriteRef = buildFavoriteRef("upgrade", upgradeId);

      if (seen[favoriteRef]) {
        return;
      }

      seen[favoriteRef] = true;
      ordered.push(favoriteRef);
    });

    favoriteRecipeKeys.forEach(function (recipeKey) {
      var favoriteRef = buildFavoriteRef("recipe", recipeKey);

      if (seen[favoriteRef]) {
        return;
      }

      seen[favoriteRef] = true;
      ordered.push(favoriteRef);
    });

    return ordered;
  }

  function removeFavoriteRef(favoriteRef) {
    var favoriteIndex = state.favoriteOrder.indexOf(favoriteRef);

    if (favoriteIndex !== -1) {
      state.favoriteOrder.splice(favoriteIndex, 1);
    }
  }

  function checkStorage() {
    try {
      window.localStorage.setItem(TEST_KEY, "1");
      window.localStorage.removeItem(TEST_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function sanitizeFavoritesLayout(value) {
    var next = {
      fullscreenColumns: DEFAULT_FAVORITES_LAYOUT.fullscreenColumns,
      showSearch: DEFAULT_FAVORITES_LAYOUT.showSearch,
      homeColumns: DEFAULT_FAVORITES_LAYOUT.homeColumns,
      showStickyNote: DEFAULT_FAVORITES_LAYOUT.showStickyNote
    };
    var fullscreenColumns;
    var homeColumns;

    if (!value || typeof value !== "object") {
      return next;
    }

    fullscreenColumns = Math.floor(Number(value.fullscreenColumns) || 0);

    if (Number.isFinite(fullscreenColumns) && fullscreenColumns >= 2 && fullscreenColumns <= 8) {
      next.fullscreenColumns = fullscreenColumns;
    }

    if (typeof value.showSearch === "boolean") {
      next.showSearch = value.showSearch;
    }

    if (typeof value.showStickyNote === "boolean") {
      next.showStickyNote = value.showStickyNote;
    }

    homeColumns = Math.floor(Number(value.homeColumns) || 0);

    if (Number.isFinite(homeColumns) && homeColumns >= 1 && homeColumns <= 2) {
      next.homeColumns = homeColumns;
    }

    return next;
  }

  function sanitizeStickyNote(value) {
    var next = {
      content: DEFAULT_STICKY_NOTE.content
    };

    if (!value || typeof value !== "object") {
      return next;
    }

    if (Object.prototype.hasOwnProperty.call(value, "content") && value.content != null) {
      next.content = String(value.content);
    }

    return next;
  }

  function sanitizeUpgradeVisibility(value) {
    var next = {
      showCrownUpgrades: DEFAULT_UPGRADE_VISIBILITY.showCrownUpgrades
    };

    if (!value || typeof value !== "object") {
      return next;
    }

    if (typeof value.showCrownUpgrades === "boolean") {
      next.showCrownUpgrades = value.showCrownUpgrades;
    }

    return next;
  }

  function sanitizeCategoryLayout(value) {
    var next = {
      columns: DEFAULT_CATEGORY_LAYOUT.columns
    };
    var columns;

    if (!value || typeof value !== "object") {
      return next;
    }

    columns = Math.floor(Number(value.columns) || 0);

    if (Number.isFinite(columns) && columns >= 1 && columns <= 2) {
      next.columns = columns;
    }

    return next;
  }

  function sanitizeState(value) {
    var next = {
      taskCounts: {},
      favoriteUpgradeIds: [],
      favoriteRecipeKeys: [],
      favoriteOrder: [],
      favoritesLayout: sanitizeFavoritesLayout(),
      upgradeVisibility: sanitizeUpgradeVisibility(),
      categoryLayout: sanitizeCategoryLayout(),
      stickyNote: sanitizeStickyNote()
    };

    if (!value || typeof value !== "object") {
      return next;
    }

    if (value.taskCounts && typeof value.taskCounts === "object") {
      Object.keys(value.taskCounts).forEach(function (taskId) {
        var amount = Number(value.taskCounts[taskId]);

        if (Number.isFinite(amount) && amount > 0) {
          next.taskCounts[taskId] = Math.floor(amount);
        }
      });
    }

    if (Array.isArray(value.favoriteUpgradeIds)) {
      value.favoriteUpgradeIds.forEach(function (upgradeId) {
        pushUniqueValue(next.favoriteUpgradeIds, upgradeId);
      });
    }

    if (Array.isArray(value.favoriteRecipeKeys)) {
      value.favoriteRecipeKeys.forEach(function (recipeKey) {
        pushUniqueValue(next.favoriteRecipeKeys, recipeKey);
      });
    }

    if (value.favoritesLayout && typeof value.favoritesLayout === "object") {
      next.favoritesLayout = sanitizeFavoritesLayout(value.favoritesLayout);
    }

    if (value.upgradeVisibility && typeof value.upgradeVisibility === "object") {
      next.upgradeVisibility = sanitizeUpgradeVisibility(value.upgradeVisibility);
    }

    if (value.categoryLayout && typeof value.categoryLayout === "object") {
      next.categoryLayout = sanitizeCategoryLayout(value.categoryLayout);
    }

    if (value.stickyNote && typeof value.stickyNote === "object") {
      next.stickyNote = sanitizeStickyNote(value.stickyNote);
    }

    next.favoriteOrder = buildFavoriteOrder(
      value.favoriteOrder,
      next.favoriteUpgradeIds,
      next.favoriteRecipeKeys,
      next.favoritesLayout.showStickyNote
    );

    return next;
  }

  function loadState() {
    if (!storageAvailable) {
      return sanitizeState();
    }

    try {
      return sanitizeState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {
      return sanitizeState();
    }
  }

  function persist() {
    if (!storageAvailable) {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      storageAvailable = false;
      return false;
    }
  }

  function emitChange() {
    window.dispatchEvent(new window.CustomEvent("dmz-progress-change", {
      detail: getState()
    }));
  }

  function getState() {
    return {
      taskCounts: Object.assign({}, state.taskCounts),
      favoriteUpgradeIds: state.favoriteUpgradeIds.slice(),
      favoriteRecipeKeys: state.favoriteRecipeKeys.slice(),
      favoriteOrder: state.favoriteOrder.slice(),
      favoritesLayout: Object.assign({}, state.favoritesLayout),
      upgradeVisibility: Object.assign({}, state.upgradeVisibility),
      categoryLayout: Object.assign({}, state.categoryLayout),
      stickyNote: Object.assign({}, state.stickyNote)
    };
  }

  function getFavoritesLayoutSettings() {
    return Object.assign({}, state.favoritesLayout);
  }

  function getUpgradeVisibilitySettings() {
    return Object.assign({}, state.upgradeVisibility);
  }

  function getCategoryLayoutSettings() {
    return Object.assign({}, state.categoryLayout);
  }

  function getStickyNote() {
    return Object.assign({}, state.stickyNote);
  }

  function getTaskCount(taskId) {
    return Number(state.taskCounts[taskId] || 0);
  }

  function setTaskCount(taskId, nextCount) {
    var amount = Math.max(0, Math.floor(Number(nextCount) || 0));

    if (!taskId) {
      return;
    }

    if (amount <= 0) {
      delete state.taskCounts[taskId];
    } else {
      state.taskCounts[taskId] = amount;
    }

    persist();
    emitChange();
  }

  function setStickyNoteContent(nextContent, options) {
    var content = nextContent == null ? "" : String(nextContent);
    var shouldEmit = !options || options.emitChange !== false;

    if (content === state.stickyNote.content) {
      return;
    }

    state.stickyNote.content = content;
    persist();

    if (shouldEmit) {
      emitChange();
    }
  }

  function isFavoriteUpgrade(upgradeId) {
    return state.favoriteUpgradeIds.indexOf(upgradeId) !== -1;
  }

  function isFavoriteRecipe(recipeKey) {
    return state.favoriteRecipeKeys.indexOf(recipeKey) !== -1;
  }

  function favoriteOrdersMatch(nextFavoriteOrder) {
    if (nextFavoriteOrder.length !== state.favoriteOrder.length) {
      return false;
    }

    return nextFavoriteOrder.every(function (favoriteRef, index) {
      return state.favoriteOrder[index] === favoriteRef;
    });
  }

  function toggleFavoriteUpgrade(upgradeId) {
    var favoriteIndex;
    var favoriteRef;

    if (!upgradeId) {
      return;
    }

    favoriteIndex = state.favoriteUpgradeIds.indexOf(upgradeId);
    favoriteRef = buildFavoriteRef("upgrade", upgradeId);

    if (favoriteIndex === -1) {
      state.favoriteUpgradeIds.unshift(upgradeId);
      state.favoriteOrder.unshift(favoriteRef);
    } else {
      state.favoriteUpgradeIds.splice(favoriteIndex, 1);
      removeFavoriteRef(favoriteRef);
    }

    persist();
    emitChange();
  }

  function toggleFavoriteRecipe(recipeKey) {
    var favoriteIndex;
    var favoriteRef;

    if (!recipeKey) {
      return;
    }

    favoriteIndex = state.favoriteRecipeKeys.indexOf(recipeKey);
    favoriteRef = buildFavoriteRef("recipe", recipeKey);

    if (favoriteIndex === -1) {
      state.favoriteRecipeKeys.unshift(recipeKey);
      state.favoriteOrder.unshift(favoriteRef);
    } else {
      state.favoriteRecipeKeys.splice(favoriteIndex, 1);
      removeFavoriteRef(favoriteRef);
    }

    persist();
    emitChange();
  }

  function setFavoriteOrder(nextFavoriteOrder) {
    var seen = Object.create(null);
    var available = Object.create(null);
    var reordered = [];

    if (!Array.isArray(nextFavoriteOrder)) {
      return;
    }

    state.favoriteUpgradeIds.forEach(function (upgradeId) {
      available[buildFavoriteRef("upgrade", upgradeId)] = true;
    });

    state.favoriteRecipeKeys.forEach(function (recipeKey) {
      available[buildFavoriteRef("recipe", recipeKey)] = true;
    });

    if (state.favoritesLayout.showStickyNote) {
      available[STICKY_NOTE_FAVORITE_REF] = true;
    }

    nextFavoriteOrder.forEach(function (favoriteRef) {
      if (!parseFavoriteRef(favoriteRef) || !available[favoriteRef] || seen[favoriteRef]) {
        return;
      }

      seen[favoriteRef] = true;
      reordered.push(favoriteRef);
    });

    if (state.favoritesLayout.showStickyNote && !seen[STICKY_NOTE_FAVORITE_REF]) {
      seen[STICKY_NOTE_FAVORITE_REF] = true;
      reordered.unshift(STICKY_NOTE_FAVORITE_REF);
    }

    state.favoriteUpgradeIds.forEach(function (upgradeId) {
      var favoriteRef = buildFavoriteRef("upgrade", upgradeId);

      if (seen[favoriteRef]) {
        return;
      }

      seen[favoriteRef] = true;
      reordered.push(favoriteRef);
    });

    state.favoriteRecipeKeys.forEach(function (recipeKey) {
      var favoriteRef = buildFavoriteRef("recipe", recipeKey);

      if (seen[favoriteRef]) {
        return;
      }

      seen[favoriteRef] = true;
      reordered.push(favoriteRef);
    });

    if (favoriteOrdersMatch(reordered)) {
      return;
    }

    state.favoriteOrder = reordered;
    persist();
    emitChange();
  }

  function setFavoriteUpgradeOrder(nextFavoriteUpgradeIds) {
    if (!Array.isArray(nextFavoriteUpgradeIds)) {
      return;
    }

    setFavoriteOrder(nextFavoriteUpgradeIds.map(function (upgradeId) {
      return buildFavoriteRef("upgrade", upgradeId);
    }));
  }

  function setFavoritesLayoutSettings(nextSettings) {
    var nextLayout;
    var nextFavoriteOrder;

    if (!nextSettings || typeof nextSettings !== "object") {
      return;
    }

    nextLayout = sanitizeFavoritesLayout(Object.assign({}, state.favoritesLayout, nextSettings));
    nextFavoriteOrder = buildFavoriteOrder(
      state.favoriteOrder,
      state.favoriteUpgradeIds,
      state.favoriteRecipeKeys,
      nextLayout.showStickyNote
    );

    if (nextLayout.fullscreenColumns === state.favoritesLayout.fullscreenColumns &&
        nextLayout.showSearch === state.favoritesLayout.showSearch &&
        nextLayout.homeColumns === state.favoritesLayout.homeColumns &&
        nextLayout.showStickyNote === state.favoritesLayout.showStickyNote &&
        favoriteOrdersMatch(nextFavoriteOrder)) {
      return;
    }

    state.favoritesLayout = nextLayout;
    state.favoriteOrder = nextFavoriteOrder;
    persist();
    emitChange();
  }

  function setUpgradeVisibilitySettings(nextSettings) {
    var nextVisibility;

    if (!nextSettings || typeof nextSettings !== "object") {
      return;
    }

    nextVisibility = sanitizeUpgradeVisibility(Object.assign({}, state.upgradeVisibility, nextSettings));

    if (nextVisibility.showCrownUpgrades === state.upgradeVisibility.showCrownUpgrades) {
      return;
    }

    state.upgradeVisibility = nextVisibility;
    persist();
    emitChange();
  }

  function setCategoryLayoutSettings(nextSettings) {
    var nextLayout;

    if (!nextSettings || typeof nextSettings !== "object") {
      return;
    }

    nextLayout = sanitizeCategoryLayout(Object.assign({}, state.categoryLayout, nextSettings));

    if (nextLayout.columns === state.categoryLayout.columns) {
      return;
    }

    state.categoryLayout = nextLayout;
    persist();
    emitChange();
  }

  function reset() {
    state = sanitizeState();

    if (storageAvailable) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        storageAvailable = false;
      }
    }

    emitChange();
  }

  function replaceState(nextState) {
    state = sanitizeState(nextState);
    persist();
    emitChange();
  }

  function subscribe(listener) {
    window.addEventListener("dmz-progress-change", listener);

    return function () {
      window.removeEventListener("dmz-progress-change", listener);
    };
  }

  function getStatus() {
    return {
      available: storageAvailable,
      key: STORAGE_KEY
    };
  }

  window.DMZStorage = {
    getState: getState,
    getTaskCount: getTaskCount,
    setTaskCount: setTaskCount,
    getStickyNote: getStickyNote,
    setStickyNoteContent: setStickyNoteContent,
    isFavoriteUpgrade: isFavoriteUpgrade,
    isFavoriteRecipe: isFavoriteRecipe,
    toggleFavoriteUpgrade: toggleFavoriteUpgrade,
    toggleFavoriteRecipe: toggleFavoriteRecipe,
    setFavoriteOrder: setFavoriteOrder,
    setFavoriteUpgradeOrder: setFavoriteUpgradeOrder,
    getFavoritesLayoutSettings: getFavoritesLayoutSettings,
    setFavoritesLayoutSettings: setFavoritesLayoutSettings,
    getUpgradeVisibilitySettings: getUpgradeVisibilitySettings,
    setUpgradeVisibilitySettings: setUpgradeVisibilitySettings,
    getCategoryLayoutSettings: getCategoryLayoutSettings,
    setCategoryLayoutSettings: setCategoryLayoutSettings,
    reset: reset,
    replaceState: replaceState,
    subscribe: subscribe,
    getStatus: getStatus,
    STICKY_NOTE_FAVORITE_REF: STICKY_NOTE_FAVORITE_REF
  };
}());