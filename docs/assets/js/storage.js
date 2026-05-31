(function () {
  var STORAGE_KEY = "dmz-tracker:v1:task-counts";
  var TEST_KEY = "dmz-tracker:storage-check";
  var DEFAULT_FAVORITES_LAYOUT = {
    fullscreenColumns: 6,
    showSearch: true,
    homeColumns: 1
  };
  var DEFAULT_CATEGORY_LAYOUT = {
    columns: 1
  };
  var storageAvailable = checkStorage();
  var state = loadState();

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
      homeColumns: DEFAULT_FAVORITES_LAYOUT.homeColumns
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

    homeColumns = Math.floor(Number(value.homeColumns) || 0);

    if (Number.isFinite(homeColumns) && homeColumns >= 1 && homeColumns <= 2) {
      next.homeColumns = homeColumns;
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
      favoritesLayout: sanitizeFavoritesLayout(),
      categoryLayout: sanitizeCategoryLayout()
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
        if (typeof upgradeId !== "string" || !upgradeId || next.favoriteUpgradeIds.indexOf(upgradeId) !== -1) {
          return;
        }

        next.favoriteUpgradeIds.push(upgradeId);
      });
    }

    if (value.favoritesLayout && typeof value.favoritesLayout === "object") {
      next.favoritesLayout = sanitizeFavoritesLayout(value.favoritesLayout);
    }

    if (value.categoryLayout && typeof value.categoryLayout === "object") {
      next.categoryLayout = sanitizeCategoryLayout(value.categoryLayout);
    }

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
      favoritesLayout: Object.assign({}, state.favoritesLayout),
      categoryLayout: Object.assign({}, state.categoryLayout)
    };
  }

  function getFavoritesLayoutSettings() {
    return Object.assign({}, state.favoritesLayout);
  }

  function getCategoryLayoutSettings() {
    return Object.assign({}, state.categoryLayout);
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

  function isFavoriteUpgrade(upgradeId) {
    return state.favoriteUpgradeIds.indexOf(upgradeId) !== -1;
  }

  function favoriteOrdersMatch(nextFavoriteUpgradeIds) {
    if (nextFavoriteUpgradeIds.length !== state.favoriteUpgradeIds.length) {
      return false;
    }

    return nextFavoriteUpgradeIds.every(function (upgradeId, index) {
      return state.favoriteUpgradeIds[index] === upgradeId;
    });
  }

  function toggleFavoriteUpgrade(upgradeId) {
    var favoriteIndex;

    if (!upgradeId) {
      return;
    }

    favoriteIndex = state.favoriteUpgradeIds.indexOf(upgradeId);

    if (favoriteIndex === -1) {
      state.favoriteUpgradeIds.unshift(upgradeId);
    } else {
      state.favoriteUpgradeIds.splice(favoriteIndex, 1);
    }

    persist();
    emitChange();
  }

  function setFavoriteUpgradeOrder(nextFavoriteUpgradeIds) {
    var seen = Object.create(null);
    var available = Object.create(null);
    var reordered = [];

    if (!Array.isArray(nextFavoriteUpgradeIds)) {
      return;
    }

    state.favoriteUpgradeIds.forEach(function (upgradeId) {
      available[upgradeId] = true;
    });

    nextFavoriteUpgradeIds.forEach(function (upgradeId) {
      if (!available[upgradeId] || seen[upgradeId]) {
        return;
      }

      seen[upgradeId] = true;
      reordered.push(upgradeId);
    });

    state.favoriteUpgradeIds.forEach(function (upgradeId) {
      if (seen[upgradeId]) {
        return;
      }

      seen[upgradeId] = true;
      reordered.push(upgradeId);
    });

    if (favoriteOrdersMatch(reordered)) {
      return;
    }

    state.favoriteUpgradeIds = reordered;
    persist();
    emitChange();
  }

  function setFavoritesLayoutSettings(nextSettings) {
    var nextLayout;

    if (!nextSettings || typeof nextSettings !== "object") {
      return;
    }

    nextLayout = sanitizeFavoritesLayout(Object.assign({}, state.favoritesLayout, nextSettings));

    if (nextLayout.fullscreenColumns === state.favoritesLayout.fullscreenColumns &&
        nextLayout.showSearch === state.favoritesLayout.showSearch &&
        nextLayout.homeColumns === state.favoritesLayout.homeColumns) {
      return;
    }

    state.favoritesLayout = nextLayout;
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
    isFavoriteUpgrade: isFavoriteUpgrade,
    toggleFavoriteUpgrade: toggleFavoriteUpgrade,
    setFavoriteUpgradeOrder: setFavoriteUpgradeOrder,
    getFavoritesLayoutSettings: getFavoritesLayoutSettings,
    setFavoritesLayoutSettings: setFavoritesLayoutSettings,
    getCategoryLayoutSettings: getCategoryLayoutSettings,
    setCategoryLayoutSettings: setCategoryLayoutSettings,
    reset: reset,
    replaceState: replaceState,
    subscribe: subscribe,
    getStatus: getStatus
  };
}());