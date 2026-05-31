(function () {
  var collapsedFavoriteIds = Object.create(null);
  var FAVORITES_FULLSCREEN_CLASS = "is-favorites-fullscreen";

  function renderMetricGrid(stats) {
    return [
      {
        label: "Categories",
        value: String(window.DMZApp.getCategories().length),
        detail: "Stash, weapons locker, bounty board, comms, and equipment."
      },
      {
        label: "Upgrades Complete",
        value: stats.completedUpgrades + " / " + stats.totalUpgrades,
        detail: stats.completedTasks + " of " + stats.totalTasks + " tracked objectives complete."
      },
      {
        label: "Save Model",
        value: "Local Only",
        detail: "All progress is kept in this browser with no account or sync layer."
      }
    ].map(function (item) {
      return "<article class=\"metric-card\">" +
        "<span class=\"metric-card__label\">" + window.DMZApp.escapeHtml(item.label) + "</span>" +
        "<div class=\"metric-card__value\">" + window.DMZApp.escapeHtml(item.value) + "</div>" +
        "<div class=\"metric-card__detail\">" + window.DMZApp.escapeHtml(item.detail) + "</div>" +
      "</article>";
    }).join("");
  }

  function getIconKey(iconPath) {
    var cleanPath;
    var segments;

    if (!iconPath) {
      return "";
    }

    cleanPath = String(iconPath).split("?")[0];
    segments = cleanPath.split("/");
    return String(segments[segments.length - 1] || "").toLowerCase();
  }

  function collectUniqueIcon(iconPaths, seenKeys, iconPath) {
    var iconKey = getIconKey(iconPath);

    if (!iconKey || seenKeys[iconKey]) {
      return;
    }

    seenKeys[iconKey] = true;
    iconPaths.push(iconPath);
  }

  function buildCategoryIconMap(category) {
    var iconMap = Object.create(null);

    category.upgrades.forEach(function (upgrade) {
      var upgradeKey = getIconKey(upgrade.iconPath);
      var rewardKey = getIconKey(upgrade.rewardIconPath);

      if (upgradeKey && !iconMap[upgradeKey]) {
        iconMap[upgradeKey] = upgrade.iconPath;
      }

      if (rewardKey && !iconMap[rewardKey]) {
        iconMap[rewardKey] = upgrade.rewardIconPath;
      }

      upgrade.tasks.forEach(function (task) {
        var taskKey = getIconKey(task.iconPath);

        if (taskKey && !iconMap[taskKey]) {
          iconMap[taskKey] = task.iconPath;
        }
      });
    });

    return iconMap;
  }

  function getCategoryCardIcons(category, meta) {
    var iconPaths = [];
    var iconMap = buildCategoryIconMap(category);
    var seenKeys = Object.create(null);

    if (meta && Array.isArray(meta.overviewIconKeys)) {
      meta.overviewIconKeys.forEach(function (iconKey) {
        if (iconPaths.length < 2 && iconMap[iconKey]) {
          collectUniqueIcon(iconPaths, seenKeys, iconMap[iconKey]);
        }
      });
    }

    category.upgrades.forEach(function (upgrade) {
      if (iconPaths.length < 2) {
        collectUniqueIcon(iconPaths, seenKeys, upgrade.iconPath);
      }
    });

    if (iconPaths.length < 2) {
      category.upgrades.forEach(function (upgrade) {
        if (iconPaths.length < 2) {
          collectUniqueIcon(iconPaths, seenKeys, upgrade.rewardIconPath);
        }
      });
    }

    if (iconPaths.length < 2) {
      category.upgrades.forEach(function (upgrade) {
        upgrade.tasks.forEach(function (task) {
          if (iconPaths.length < 2) {
            collectUniqueIcon(iconPaths, seenKeys, task.iconPath);
          }
        });
      });
    }

    return iconPaths.slice(0, 2);
  }

  function renderCategoryCards(query, state) {
    return window.DMZApp.getCategories().map(function (category) {
      var meta = window.DMZApp.getCategoryMeta(category.slug);
      var cardIcons = getCategoryCardIcons(category, meta);
      var stats = window.DMZApp.getCategoryStats(category, state);
      var muted = query && !window.DMZApp.categoryMatchesQuery(category, query);

      return "<a class=\"category-card" + (muted ? " is-muted" : "") + "\" href=\"" + meta.href + "\" style=\"--card-accent:" + meta.accent + ";\">" +
        "<div class=\"category-card__copy\">" +
          "<h3 class=\"category-card__title\">" + window.DMZApp.escapeHtml(category.title) + "</h3>" +
          "<p class=\"category-card__summary\">" + window.DMZApp.escapeHtml(category.summary) + "</p>" +
        "</div>" +
        "<div class=\"category-card__footer\">" +
          (cardIcons.length
            ? "<div class=\"category-card__icons\">" +
                cardIcons.map(function (iconPath) {
                  return window.DMZApp.renderItemIcon(iconPath, "category-card__icon");
                }).join("") +
              "</div>"
            : "<div class=\"category-card__badge\">" + window.DMZApp.escapeHtml(meta.code) + "</div>") +
          window.DMZApp.renderProgressTrack(stats.percent, window.DMZApp.formatPercent(stats.percent), "category completion") +
        "</div>" +
      "</a>";
    }).join("");
  }

  function renderSearchMatches(query, state) {
    var matches = window.DMZApp.getSearchMatches(query, state);

    if (!query) {
      return {
        hidden: true,
        meta: "",
        content: ""
      };
    }

    if (!matches.length) {
      return {
        hidden: false,
        meta: "0 upgrades matched",
        content: "<div class=\"empty-state\"><h3 class=\"empty-state__title\">No matches</h3><p class=\"empty-state__copy\">Try a faction name, item name, or upgrade title.</p></div>"
      };
    }

    return {
      hidden: false,
      meta: matches.length + " upgrades matched",
      content: matches.map(function (match) {
        var meta = window.DMZApp.getCategoryMeta(match.category.slug);
        var preview = match.tasks.length
          ? match.tasks.slice(0, 2).map(function (task) {
              return task.title;
            }).join(" | ")
          : match.upgrade.reward;

        return "<article class=\"match-card\">" +
          "<div class=\"match-card__meta\">" +
            "<span class=\"chip chip--accent\">" + window.DMZApp.escapeHtml(match.category.title) + "</span>" +
            "<span class=\"chip" + (match.stats.isComplete ? " chip--success" : "") + "\">" + match.stats.completedTasks + "/" + match.stats.totalTasks + " tasks</span>" +
          "</div>" +
          "<h3 class=\"match-card__title\"><a href=\"" + meta.href + "#" + match.upgrade.id + "\">" + window.DMZApp.escapeHtml(match.upgrade.title) + "</a></h3>" +
          "<p class=\"match-card__copy\">" + window.DMZApp.escapeHtml(preview) + "</p>" +
          window.DMZApp.renderProgressTrack(match.stats.percent, window.DMZApp.formatPercent(match.stats.percent), "upgrade completion", true) +
        "</article>";
      }).join("")
    };
  }

  function shouldCollapseFavorite(upgradeId, fallbackValue) {
    if (Object.prototype.hasOwnProperty.call(collapsedFavoriteIds, upgradeId)) {
      return collapsedFavoriteIds[upgradeId];
    }

    return Boolean(fallbackValue);
  }

  function clampFavoritesFullscreenColumns(value) {
    var columns = Math.floor(Number(value) || 0);

    if (!Number.isFinite(columns)) {
      return 6;
    }

    return Math.max(2, Math.min(8, columns));
  }

  function clampHomeFavoritesColumns(value) {
    var columns = Math.floor(Number(value) || 0);

    if (!Number.isFinite(columns)) {
      return 1;
    }

    return Math.max(1, Math.min(2, columns));
  }

  function getFavoritesFullscreenColumnCount(preferredColumns) {
    var columns = clampFavoritesFullscreenColumns(preferredColumns);

    if (window.innerWidth <= 640) {
      return Math.min(columns, 2);
    }

    if (window.innerWidth <= 920) {
      return Math.min(columns, 3);
    }

    return columns;
  }

  function normalizeFavoriteQuery(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function parseFavoriteRef(value) {
    var match = typeof value === "string" ? value.match(/^(upgrade|recipe):(.+)$/) : null;

    if (!match || !match[2]) {
      return null;
    }

    return {
      type: match[1],
      value: match[2]
    };
  }

  function getFavoriteEntry(favoriteRef) {
    var parsed = parseFavoriteRef(favoriteRef);
    var upgradeEntry;
    var recipeEntry;

    if (!parsed) {
      return null;
    }

    if (parsed.type === "upgrade") {
      upgradeEntry = window.DMZApp.getUpgradeEntry(parsed.value);

      if (!upgradeEntry) {
        return null;
      }

      return {
        type: "upgrade",
        favoriteRef: favoriteRef,
        category: upgradeEntry.category,
        upgrade: upgradeEntry.upgrade
      };
    }

    if (!window.DMZBarter || typeof window.DMZBarter.getRecipeEntry !== "function") {
      return null;
    }

    recipeEntry = window.DMZBarter.getRecipeEntry(parsed.value);

    if (!recipeEntry) {
      return null;
    }

    return {
      type: "recipe",
      favoriteRef: favoriteRef,
      recipe: recipeEntry
    };
  }

  function formatRecipeIngredientPreview(recipe) {
    var preview = recipe.ingredients.slice(0, 2).map(function (ingredient) {
      return ingredient.name + " x" + ingredient.quantity;
    }).join(" | ");

    if (recipe.ingredients.length > 2) {
      preview += " | +" + (recipe.ingredients.length - 2) + " more";
    }

    return preview;
  }

  function favoriteEntryMatchesQuery(entry, query) {
    var normalizedQuery = normalizeFavoriteQuery(query);

    if (!normalizedQuery) {
      return true;
    }

    if (entry.type === "recipe") {
      return Boolean(window.DMZBarter && window.DMZBarter.recipeMatchesQuery && window.DMZBarter.recipeMatchesQuery(entry.recipe, normalizedQuery));
    }

    return window.DMZApp.upgradeMatchesQuery(entry.upgrade, normalizedQuery) ||
      normalizeFavoriteQuery(entry.category.title).indexOf(normalizedQuery) !== -1 ||
      normalizeFavoriteQuery(entry.category.summary).indexOf(normalizedQuery) !== -1;
  }

  function renderFavoriteUpgradeCard(entry, state, canReorder, collapseByDefault) {
    var stats = window.DMZApp.getUpgradeStats(entry.upgrade, state);
    var isCollapsed = shouldCollapseFavorite(entry.favoriteRef, collapseByDefault);
    var unlockLabel = (entry.upgrade.unlock && entry.upgrade.unlock.name ? entry.upgrade.unlock.name : "DMZ") +
      (entry.upgrade.unlock && entry.upgrade.unlock.level ? " " + entry.upgrade.unlock.level : "");
    var preview = entry.upgrade.reward || entry.upgrade.tasks.slice(0, 2).map(function (task) {
      return task.title;
    }).join(" | ");

    return "<details class=\"match-card favorite-card\" data-favorite-ref=\"" + entry.favoriteRef + "\" data-favorite-type=\"upgrade\"" + (canReorder ? " draggable=\"true\"" : "") + (isCollapsed ? "" : " open") + ">" +
      "<summary class=\"favorite-card__summary\">" +
        "<div class=\"favorite-card__summary-main\">" +
          "<div class=\"match-card__meta\">" +
            "<span class=\"chip chip--accent\">" + window.DMZApp.escapeHtml(entry.category.title) + "</span>" +
            "<span class=\"chip\">" + window.DMZApp.escapeHtml(unlockLabel) + "</span>" +
          "</div>" +
          "<div class=\"upgrade-card__title-row\">" +
            "<h3 class=\"upgrade-card__title\">" + window.DMZApp.escapeHtml(entry.upgrade.title) + "</h3>" +
            window.DMZApp.renderFavoriteToggle(entry.upgrade.id, true) +
          "</div>" +
          "<p class=\"favorite-card__summary-copy\">" + window.DMZApp.escapeHtml(preview) + "</p>" +
          "<div class=\"favorite-card__summary-progress\">" +
            window.DMZApp.renderProgressTrack(stats.percent, stats.completedTasks + "/" + stats.totalTasks + " tasks", window.DMZApp.formatPercent(stats.percent), true) +
          "</div>" +
        "</div>" +
        "<div class=\"favorite-card__summary-actions\">" +
          (canReorder
            ? "<button class=\"favorite-card__drag-handle\" type=\"button\" data-action=\"drag-handle\" aria-label=\"Drag to reorder favorite\" title=\"Drag to reorder favorite\">" +
                "<span class=\"favorite-card__drag-handle-icon\" aria-hidden=\"true\"></span>" +
              "</button>"
            : "") +
          "<span class=\"upgrade-card__collapse\" aria-hidden=\"true\">" +
            "<span class=\"upgrade-card__collapse-icon\" aria-hidden=\"true\"></span>" +
          "</span>" +
        "</div>" +
      "</summary>" +
      "<div class=\"favorite-card__details\">" +
        "<ul class=\"task-list favorite-card__tasks\">" +
          entry.upgrade.tasks.map(function (task) {
            return window.DMZApp.renderTaskControlRow(task, state);
          }).join("") +
        "</ul>" +
      "</div>" +
    "</details>";
  }

  function renderFavoriteRecipeCard(entry, canReorder, collapseByDefault) {
    var recipe = entry.recipe;
    var escapeHtml = window.DMZApp.escapeHtml;
    var ingredientLabel = recipe.ingredients.length + (recipe.ingredients.length === 1 ? " ingredient" : " ingredients");
    var isCollapsed = shouldCollapseFavorite(entry.favoriteRef, collapseByDefault);
    var preview = recipe.unlock
      ? "Unlock: " + recipe.unlock
      : formatRecipeIngredientPreview(recipe);

    return "<details class=\"match-card favorite-card favorite-card--recipe\" data-favorite-ref=\"" + entry.favoriteRef + "\" data-favorite-type=\"recipe\"" + (canReorder ? " draggable=\"true\"" : "") + (isCollapsed ? "" : " open") + ">" +
      "<summary class=\"favorite-card__summary\">" +
        "<div class=\"favorite-card__summary-main\">" +
          "<div class=\"match-card__meta\">" +
            "<span class=\"chip chip--accent\">" + escapeHtml(window.DMZBarter.getRegionLabel(recipe.region)) + "</span>" +
            "<span class=\"chip\">" + escapeHtml(window.DMZBarter.getFamilyLabel(recipe.family)) + "</span>" +
            "<span class=\"chip\">" + escapeHtml(ingredientLabel) + "</span>" +
            window.DMZBarter.renderTypeChip(recipe) +
          "</div>" +
          "<div class=\"upgrade-card__title-row\">" +
            window.DMZApp.renderItemIcon(window.DMZBarter.getRecipeIconPath(recipe), "upgrade-card__summary-icon") +
            "<h3 class=\"upgrade-card__title\">" + escapeHtml(recipe.name) + "</h3>" +
            window.DMZApp.renderFavoriteToggle(recipe.key, true, "recipe") +
          "</div>" +
          "<p class=\"favorite-card__summary-copy\">" + escapeHtml(preview) + "</p>" +
        "</div>" +
        "<div class=\"favorite-card__summary-actions\">" +
          (canReorder
            ? "<button class=\"favorite-card__drag-handle\" type=\"button\" data-action=\"drag-handle\" aria-label=\"Drag to reorder favorite\" title=\"Drag to reorder favorite\">" +
                "<span class=\"favorite-card__drag-handle-icon\" aria-hidden=\"true\"></span>" +
              "</button>"
            : "") +
          "<span class=\"upgrade-card__collapse\" aria-hidden=\"true\">" +
            "<span class=\"upgrade-card__collapse-icon\" aria-hidden=\"true\"></span>" +
          "</span>" +
        "</div>" +
      "</summary>" +
      "<div class=\"favorite-card__details\">" +
        "<ul class=\"task-list favorite-card__tasks barter-ingredient-list\">" +
          recipe.ingredients.map(function (ingredient) {
            return window.DMZBarter.renderIngredientRow(ingredient);
          }).join("") +
        "</ul>" +
        (recipe.unlock
          ? "<div class=\"upgrade-card__reward barter-recipe__note\">" +
              "<div class=\"upgrade-card__reward-copy\">" +
                "<p class=\"upgrade-card__reward-label\">Unlock note</p>" +
                "<p class=\"upgrade-card__reward-value\">" + escapeHtml(recipe.unlock) + "</p>" +
              "</div>" +
            "</div>"
          : "") +
      "</div>" +
    "</details>";
  }

  function renderFavoriteCard(entry, state, canReorder, collapseByDefault) {
    if (entry.type === "recipe") {
      return renderFavoriteRecipeCard(entry, canReorder, collapseByDefault);
    }

    return renderFavoriteUpgradeCard(entry, state, canReorder, collapseByDefault);
  }

  function renderFavoriteFullscreenColumns(entries, state, canReorder, columnCount) {
    var resolvedColumnCount = Math.min(Math.max(1, Number(columnCount) || 1), entries.length);
    var columns = [];
    var baseItemsPerColumn = Math.floor(entries.length / resolvedColumnCount);
    var extraItems = entries.length % resolvedColumnCount;
    var columnIndex;
    var startIndex = 0;
    var columnSize;

    for (columnIndex = 0; columnIndex < resolvedColumnCount; columnIndex += 1) {
      columnSize = baseItemsPerColumn + (columnIndex < extraItems ? 1 : 0);
      columns.push(entries.slice(startIndex, startIndex + columnSize));
      startIndex += columnSize;
    }

    return columns.map(function (columnEntries) {
      return "<div class=\"favorites-column\">" + columnEntries.map(function (entry) {
        return renderFavoriteCard(entry, state, canReorder, false);
      }).join("") + "</div>";
    }).join("");
  }

  function renderFavoriteSection(state, isFavoritesFullscreen, query, favoritesLayout) {
    var entries = state.favoriteOrder.map(function (favoriteRef) {
      return getFavoriteEntry(favoriteRef);
    }).filter(function (entry) {
      return Boolean(entry);
    });
    var normalizedQuery = isFavoritesFullscreen ? normalizeFavoriteQuery(query) : "";
    var fullscreenColumnCount = getFavoritesFullscreenColumnCount(favoritesLayout && favoritesLayout.fullscreenColumns);
    var filteredEntries = normalizedQuery
      ? entries.filter(function (entry) {
          return favoriteEntryMatchesQuery(entry, normalizedQuery);
        })
      : entries;
    var canReorder = isFavoritesFullscreen && filteredEntries.length > 1 && !normalizedQuery;
    var meta;

    if (!entries.length) {
      return {
        meta: "No favorites pinned yet",
        content: "<div class=\"empty-state\"><h3 class=\"empty-state__title\">No favorites yet</h3><p class=\"empty-state__copy\">Use the star on any category page or on the barter recipes page and it will appear here for quick access.</p></div>"
      };
    }

    if (!filteredEntries.length) {
      return {
        meta: "0 favorites matched",
        content: "<div class=\"empty-state\"><h3 class=\"empty-state__title\">No favorites match that search</h3><p class=\"empty-state__copy\">Try a broader term like a faction name, recipe ingredient, objective keyword, or item type.</p></div>"
      };
    }

    if (normalizedQuery) {
      meta = filteredEntries.length + " of " + entries.length + " favorites matched";
    } else {
      meta = filteredEntries.length + (filteredEntries.length === 1 ? " favorite pinned" : " favorites pinned") + (canReorder ? " • Drag cards to reorder" : "");
    }

    return {
      meta: meta,
      content: isFavoritesFullscreen
        ? renderFavoriteFullscreenColumns(filteredEntries, state, canReorder, fullscreenColumnCount)
        : filteredEntries.map(function (entry) {
            return renderFavoriteCard(entry, state, canReorder, true);
          }).join("")
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "home") {
      return;
    }

    var searchInput = document.getElementById("homeSearch");
    var fullscreenSearch = document.querySelector(".favorites-panel__search");
    var fullscreenSearchInput = document.getElementById("favoritesSearch");
    var meter = document.getElementById("overallMeter");
    var metrics = document.getElementById("metricGrid");
    var categoryGrid = document.getElementById("categoryGrid");
    var favoritesMeta = document.getElementById("favoritesMeta");
    var favoritesGrid = document.getElementById("favoritesGrid");
    var favoritesPanelActions = document.getElementById("favoritesPanelActions");
    var favoritesToggleAllButton = document.getElementById("favoritesToggleAllButton");
    var homeLayoutButton = document.getElementById("favoritesHomeLayoutButton");
    var fullscreenButton = document.getElementById("favoritesFullscreenButton");
    var fullscreenLayoutButton = document.getElementById("favoritesLayoutButton");
    var settingsButton = document.getElementById("settingsButton");
    var resultsSection = document.getElementById("searchResultsSection");
    var resultsMeta = document.getElementById("searchResultsMeta");
    var resultsGrid = document.getElementById("searchResults");
    var homeQuery = "";
    var favoriteQuery = "";
    var homeColumnCount = clampHomeFavoritesColumns(window.DMZStorage.getFavoritesLayoutSettings().homeColumns);
    var fullscreenColumnCount = getFavoritesFullscreenColumnCount(window.DMZStorage.getFavoritesLayoutSettings().fullscreenColumns);
    var isFavoritesFullscreen = false;
    var armedFavoriteId = "";
    var draggedFavoriteId = "";
    var dropTargetFavoriteId = "";
    var dropTargetInsertAfter = false;
    var layoutDialog = fullscreenLayoutButton ? createFavoritesLayoutDialog() : null;
    var layoutColumnsInput = layoutDialog ? layoutDialog.querySelector("#favoritesLayoutColumns") : null;
    var layoutSearchToggle = layoutDialog ? layoutDialog.querySelector("#favoritesLayoutSearchToggle") : null;
    var layoutPreviousFocus = null;

    function createFavoritesLayoutDialog() {
      var dialog = document.createElement("dialog");

      dialog.id = "favoritesLayoutDialog";
      dialog.className = "settings-dialog layout-settings-dialog";
      dialog.hidden = true;
      dialog.setAttribute("aria-labelledby", "favoritesLayoutDialogTitle");
      dialog.innerHTML = "" +
        '<div class="settings-dialog__panel">' +
          '<div class="settings-dialog__header">' +
            '<div>' +
              '<p class="settings-dialog__eyebrow">Fullscreen layout</p>' +
              '<h2 id="favoritesLayoutDialogTitle" class="settings-dialog__title">Favorite workspace settings</h2>' +
            '</div>' +
            '<button class="settings-dialog__close" type="button" data-action="close-layout-settings" aria-label="Close fullscreen layout settings">' +
              '<span aria-hidden="true">&times;</span>' +
            '</button>' +
          '</div>' +
          '<p class="settings-dialog__copy">Control the expanded favorites workspace without touching progress backup, restore, or reset settings.</p>' +
          '<div class="settings-dialog__grid layout-settings-dialog__grid">' +
            '<section class="settings-dialog__card">' +
              '<p class="settings-dialog__card-title">Cards across</p>' +
              '<p class="settings-dialog__card-copy">Choose how many favorite cards should sit across on wide screens. Narrower screens still reduce the count automatically.</p>' +
              '<label class="layout-settings-dialog__field" for="favoritesLayoutColumns">' +
                '<span class="layout-settings-dialog__label">Wide-screen cards across</span>' +
                '<input id="favoritesLayoutColumns" class="layout-settings-dialog__number" type="number" min="2" max="8" step="1">' +
              '</label>' +
            '</section>' +
            '<section class="settings-dialog__card">' +
              '<p class="settings-dialog__card-title">Search bar</p>' +
              '<p class="settings-dialog__card-copy">Show or hide the fullscreen favorites search bar in the header.</p>' +
              '<label class="layout-settings-dialog__toggle">' +
                '<input id="favoritesLayoutSearchToggle" class="layout-settings-dialog__checkbox" type="checkbox">' +
                '<span class="layout-settings-dialog__toggle-copy">' +
                  '<span class="layout-settings-dialog__label">Show fullscreen search</span>' +
                  '<span class="layout-settings-dialog__hint">Keep the favorites search field visible while the expanded workspace is open.</span>' +
                '</span>' +
              '</label>' +
            '</section>' +
          '</div>' +
          '<p class="layout-settings-dialog__note">Changes save automatically in this browser.</p>' +
        '</div>';

      document.body.appendChild(dialog);
      return dialog;
    }

    function syncFavoritesSearchInput() {
      if (fullscreenSearchInput && fullscreenSearchInput.value !== favoriteQuery) {
        fullscreenSearchInput.value = favoriteQuery;
      }
    }

    function setHomeQuery(nextQuery) {
      homeQuery = nextQuery || "";
      render();
    }

    function setFavoriteQuery(nextQuery) {
      favoriteQuery = nextQuery || "";
      clearFavoriteDragState();
      syncFavoritesSearchInput();
      render();
    }

    function renderFavoritesLayoutDialog(layoutSettings) {
      if (!layoutDialog) {
        return;
      }

      layoutColumnsInput.value = String(clampFavoritesFullscreenColumns(layoutSettings.fullscreenColumns));
      layoutSearchToggle.checked = Boolean(layoutSettings.showSearch);
    }

    function closeFavoritesLayoutDialog() {
      if (!layoutDialog) {
        return;
      }

      document.body.classList.remove("has-modal-open");

      if (typeof layoutDialog.close === "function" && layoutDialog.open) {
        layoutDialog.close();
      } else {
        layoutDialog.removeAttribute("open");
        layoutDialog.hidden = true;
      }

      if (layoutPreviousFocus && typeof layoutPreviousFocus.focus === "function") {
        layoutPreviousFocus.focus();
      }
    }

    function openFavoritesLayoutDialog() {
      var layoutSettings;

      if (!layoutDialog || layoutDialog.open) {
        return;
      }

      layoutPreviousFocus = document.activeElement;
      layoutSettings = window.DMZStorage.getFavoritesLayoutSettings();
      renderFavoritesLayoutDialog(layoutSettings);
      layoutDialog.hidden = false;
      document.body.classList.add("has-modal-open");

      if (typeof layoutDialog.showModal === "function") {
        layoutDialog.showModal();
      } else {
        layoutDialog.setAttribute("open", "open");
      }

      if (layoutColumnsInput && typeof layoutColumnsInput.focus === "function") {
        layoutColumnsInput.focus();
      }
    }

    function getActiveBrowserFullscreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function requestBrowserFullscreen() {
      var fullscreenRoot = document.documentElement;

      if (fullscreenRoot && typeof fullscreenRoot.requestFullscreen === "function") {
        return fullscreenRoot.requestFullscreen();
      }

      if (fullscreenRoot && typeof fullscreenRoot.webkitRequestFullscreen === "function") {
        fullscreenRoot.webkitRequestFullscreen();
      }

      return null;
    }

    function exitBrowserFullscreen() {
      if (typeof document.exitFullscreen === "function") {
        return document.exitFullscreen();
      }

      if (typeof document.webkitExitFullscreen === "function") {
        document.webkitExitFullscreen();
      }

      return null;
    }

    function syncFavoritesFullscreenButton() {
      if (!fullscreenButton) {
        return;
      }

      fullscreenButton.classList.toggle("is-active", isFavoritesFullscreen);
      fullscreenButton.setAttribute("aria-pressed", isFavoritesFullscreen ? "true" : "false");
      fullscreenButton.setAttribute("aria-label", isFavoritesFullscreen ? "Exit fullscreen favorites view" : "Open fullscreen favorites view");
      fullscreenButton.title = isFavoritesFullscreen ? "Exit fullscreen favorites view" : "Open fullscreen favorites view";
    }

    function syncFavoritesFullscreenState(layoutSettings) {
      document.body.classList.toggle(FAVORITES_FULLSCREEN_CLASS, isFavoritesFullscreen);
      syncFavoritesFullscreenButton();

      if (settingsButton) {
        settingsButton.hidden = isFavoritesFullscreen;
      }

      if (homeLayoutButton) {
        homeLayoutButton.hidden = isFavoritesFullscreen;
      }

      if (fullscreenLayoutButton) {
        fullscreenLayoutButton.hidden = !isFavoritesFullscreen;
      }

      if (fullscreenSearch) {
        fullscreenSearch.hidden = !isFavoritesFullscreen || !layoutSettings.showSearch;
      }
    }

    function syncHomeLayoutButton() {
      var nextColumns = homeColumnCount === 1 ? 2 : 1;

      if (!homeLayoutButton) {
        return;
      }

      homeLayoutButton.dataset.columns = String(homeColumnCount);
      homeLayoutButton.setAttribute("aria-pressed", homeColumnCount === 2 ? "true" : "false");
      homeLayoutButton.setAttribute("aria-label", "Switch to " + nextColumns + (nextColumns === 1 ? " card" : " cards") + " per row");
      homeLayoutButton.title = "Switch to " + nextColumns + (nextColumns === 1 ? " card" : " cards") + " per row";
    }

    function getRenderedFavoriteIds() {
      return Array.prototype.map.call(favoritesGrid.querySelectorAll(".favorite-card[data-favorite-ref]"), function (card) {
        return card.dataset.favoriteRef;
      });
    }

    function getVisibleFavoriteCards() {
      return favoritesGrid.querySelectorAll(".favorite-card[data-favorite-ref]");
    }

    function areAllVisibleFavoritesExpanded() {
      var cards = getVisibleFavoriteCards();

      return cards.length > 0 && Array.prototype.every.call(cards, function (card) {
        return card.open;
      });
    }

    function syncFavoritesToggleAllButton() {
      var hasCards;
      var shouldCollapse;

      if (!favoritesToggleAllButton) {
        return;
      }

      hasCards = getVisibleFavoriteCards().length > 0;
      shouldCollapse = hasCards && areAllVisibleFavoritesExpanded();
      favoritesToggleAllButton.disabled = !hasCards;
      favoritesToggleAllButton.dataset.state = shouldCollapse ? "collapse" : "expand";
      favoritesToggleAllButton.setAttribute("aria-label", (shouldCollapse ? "Collapse" : "Expand") + " all visible favorite cards");
      favoritesToggleAllButton.title = shouldCollapse ? "Collapse all visible favorite cards" : "Expand all visible favorite cards";
    }

    function setAllVisibleFavoritesExpanded(shouldExpand) {
      Array.prototype.forEach.call(getVisibleFavoriteCards(), function (card) {
        collapsedFavoriteIds[card.dataset.favoriteRef] = !shouldExpand;
        card.open = shouldExpand;
      });

      syncFavoritesToggleAllButton();
    }

    function clearFavoriteDragClasses() {
      Array.prototype.forEach.call(favoritesGrid.querySelectorAll(".favorite-card"), function (card) {
        card.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
      });
    }

    function syncFavoriteDragClasses() {
      clearFavoriteDragClasses();

      Array.prototype.forEach.call(favoritesGrid.querySelectorAll(".favorite-card[data-favorite-ref]"), function (card) {
        if (card.dataset.favoriteRef === draggedFavoriteId) {
          card.classList.add("is-dragging");
        }

        if (card.dataset.favoriteRef === dropTargetFavoriteId) {
          card.classList.add(dropTargetInsertAfter ? "is-drop-after" : "is-drop-before");
        }
      });
    }

    function setFavoriteDropTarget(upgradeId, insertAfter) {
      dropTargetFavoriteId = upgradeId || "";
      dropTargetInsertAfter = Boolean(insertAfter);
      syncFavoriteDragClasses();
    }

    function clearFavoriteDragState() {
      armedFavoriteId = "";
      draggedFavoriteId = "";
      setFavoriteDropTarget("", false);
    }

    function shouldInsertAfter(card, event) {
      var rect = card.getBoundingClientRect();

      return event.clientY > rect.top + (rect.height / 2);
    }

    function getFavoriteDropTarget(event) {
      var card = event.target.closest(".favorite-card[data-favorite-ref]");
      var cards = favoritesGrid.querySelectorAll(".favorite-card[data-favorite-ref]");
      var firstCard;
      var lastCard;

      if (card) {
        return {
          upgradeId: card.dataset.favoriteRef,
          insertAfter: shouldInsertAfter(card, event)
        };
      }

      if (!cards.length) {
        return {
          upgradeId: "",
          insertAfter: false
        };
      }

      firstCard = cards[0];
      lastCard = cards[cards.length - 1];

      if (event.clientY < firstCard.getBoundingClientRect().top) {
        return {
          upgradeId: firstCard.dataset.favoriteRef,
          insertAfter: false
        };
      }

      return {
        upgradeId: lastCard.dataset.favoriteRef,
        insertAfter: true
      };
    }

    function buildFavoriteOrderFromDrop() {
      var nextOrder = getRenderedFavoriteIds().filter(function (upgradeId) {
        return upgradeId !== draggedFavoriteId;
      });
      var insertIndex;

      if (!dropTargetFavoriteId) {
        return getRenderedFavoriteIds();
      }

      insertIndex = nextOrder.indexOf(dropTargetFavoriteId);

      if (insertIndex === -1) {
        nextOrder.push(draggedFavoriteId);
        return nextOrder;
      }

      if (dropTargetInsertAfter) {
        insertIndex += 1;
      }

      nextOrder.splice(insertIndex, 0, draggedFavoriteId);
      return nextOrder;
    }

    function setFavoritesFullscreen(nextState) {
      if (isFavoritesFullscreen === nextState) {
        return;
      }

      isFavoritesFullscreen = nextState;

      if (!isFavoritesFullscreen) {
        closeFavoritesLayoutDialog();
      }

      clearFavoriteDragState();
      render();
    }

    function render() {
      var state = window.DMZStorage.getState();
      var favoritesLayout = state.favoritesLayout;
      var stats = window.DMZApp.getOverallStats(state);
      var favoriteState;
      var searchState;

      if (!favoritesLayout.showSearch && favoriteQuery) {
        favoriteQuery = "";
      }

      homeColumnCount = clampHomeFavoritesColumns(favoritesLayout.homeColumns);
      fullscreenColumnCount = getFavoritesFullscreenColumnCount(favoritesLayout.fullscreenColumns);
      favoriteState = renderFavoriteSection(state, isFavoritesFullscreen, favoriteQuery, favoritesLayout);
      searchState = renderSearchMatches(homeQuery, state);

      window.DMZApp.renderMeter(meter, stats.percent, "overall completion");
      metrics.innerHTML = renderMetricGrid(stats);
      favoritesMeta.textContent = favoriteState.meta;
      favoritesGrid.innerHTML = favoriteState.content;
      favoritesGrid.style.setProperty("--favorites-home-columns", String(homeColumnCount));
      favoritesGrid.style.setProperty("--favorites-fullscreen-columns", String(fullscreenColumnCount));
      syncFavoritesSearchInput();
      syncHomeLayoutButton();
      syncFavoritesFullscreenState(favoritesLayout);

      if (layoutDialog && layoutDialog.open) {
        renderFavoritesLayoutDialog(favoritesLayout);
      }

      Array.prototype.forEach.call(favoritesGrid.querySelectorAll(".favorite-card"), function (card) {
        card.addEventListener("toggle", function () {
          collapsedFavoriteIds[card.dataset.favoriteRef] = !card.open;
          syncFavoritesToggleAllButton();
        });
      });
      syncFavoritesToggleAllButton();
      categoryGrid.innerHTML = renderCategoryCards(homeQuery, state);
      resultsSection.hidden = searchState.hidden;
      resultsMeta.textContent = searchState.meta;
      resultsGrid.innerHTML = searchState.content;
    }

    searchInput.addEventListener("input", function (event) {
      setHomeQuery(event.target.value);
    });

    if (fullscreenSearchInput) {
      fullscreenSearchInput.addEventListener("input", function (event) {
        setFavoriteQuery(event.target.value);
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        var fullscreenRequest;

        if (isFavoritesFullscreen) {
          if (getActiveBrowserFullscreenElement()) {
            exitBrowserFullscreen();
          }

          setFavoritesFullscreen(false);
          return;
        }

        setFavoritesFullscreen(true);
        fullscreenRequest = requestBrowserFullscreen();

        if (fullscreenRequest && typeof fullscreenRequest.catch === "function") {
          fullscreenRequest.catch(function () {
            // Keep the existing expanded in-page mode even if the browser blocks fullscreen.
          });
        }
      });
    }

    document.addEventListener("fullscreenchange", function () {
      if (!getActiveBrowserFullscreenElement() && isFavoritesFullscreen) {
        setFavoritesFullscreen(false);
      }
    });

    document.addEventListener("webkitfullscreenchange", function () {
      if (!getActiveBrowserFullscreenElement() && isFavoritesFullscreen) {
        setFavoritesFullscreen(false);
      }
    });

    if (favoritesToggleAllButton) {
      favoritesToggleAllButton.addEventListener("click", function () {
        setAllVisibleFavoritesExpanded(!areAllVisibleFavoritesExpanded());
      });
    }

    if (homeLayoutButton) {
      homeLayoutButton.addEventListener("click", function () {
        window.DMZStorage.setFavoritesLayoutSettings({
          homeColumns: homeColumnCount === 1 ? 2 : 1
        });
      });
    }

    if (fullscreenLayoutButton) {
      fullscreenLayoutButton.addEventListener("click", function () {
        openFavoritesLayoutDialog();
      });
    }

    if (layoutDialog) {
      layoutDialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeFavoritesLayoutDialog();
      });

      layoutDialog.addEventListener("click", function (event) {
        var action = event.target.closest("[data-action]");

        if (event.target === layoutDialog) {
          closeFavoritesLayoutDialog();
          return;
        }

        if (!action) {
          return;
        }

        if (action.dataset.action === "close-layout-settings") {
          closeFavoritesLayoutDialog();
        }
      });

      layoutColumnsInput.addEventListener("change", function () {
        var nextColumns = clampFavoritesFullscreenColumns(layoutColumnsInput.value);

        layoutColumnsInput.value = String(nextColumns);
        window.DMZStorage.setFavoritesLayoutSettings({ fullscreenColumns: nextColumns });
      });

      layoutSearchToggle.addEventListener("change", function () {
        if (!layoutSearchToggle.checked && favoriteQuery) {
          favoriteQuery = "";
          syncFavoritesSearchInput();
        }

        window.DMZStorage.setFavoritesLayoutSettings({ showSearch: layoutSearchToggle.checked });
      });
    }

    document.addEventListener("mouseup", function () {
      if (!draggedFavoriteId) {
        armedFavoriteId = "";
      }
    });

    window.addEventListener("resize", function () {
      var nextColumnCount = getFavoritesFullscreenColumnCount(window.DMZStorage.getFavoritesLayoutSettings().fullscreenColumns);

      if (nextColumnCount === fullscreenColumnCount) {
        return;
      }

      fullscreenColumnCount = nextColumnCount;

      if (isFavoritesFullscreen) {
        render();
      }
    });

    favoritesGrid.addEventListener("mousedown", function (event) {
      var handle;
      var card;

      if (!isFavoritesFullscreen) {
        return;
      }

      handle = event.target.closest(".favorite-card__drag-handle");

      if (!handle) {
        return;
      }

      card = handle.closest(".favorite-card[data-favorite-ref]");
      armedFavoriteId = card ? card.dataset.favoriteRef : "";
    });

    favoritesGrid.addEventListener("dragstart", function (event) {
      var card = event.target.closest(".favorite-card[data-favorite-ref]");

      if (!isFavoritesFullscreen || !card) {
        return;
      }

      if (armedFavoriteId !== card.dataset.favoriteRef) {
        event.preventDefault();
        return;
      }

      draggedFavoriteId = card.dataset.favoriteRef;
      setFavoriteDropTarget("", false);

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedFavoriteId);
      }

      syncFavoriteDragClasses();
    });

    favoritesGrid.addEventListener("dragover", function (event) {
      var target;

      if (!isFavoritesFullscreen || !draggedFavoriteId) {
        return;
      }

      event.preventDefault();
      target = getFavoriteDropTarget(event);

      if (!target.upgradeId || target.upgradeId === draggedFavoriteId) {
        setFavoriteDropTarget("", false);
      } else {
        setFavoriteDropTarget(target.upgradeId, target.insertAfter);
      }

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });

    favoritesGrid.addEventListener("drop", function (event) {
      var nextOrder;

      if (!isFavoritesFullscreen || !draggedFavoriteId) {
        return;
      }

      event.preventDefault();
      nextOrder = buildFavoriteOrderFromDrop();
      clearFavoriteDragState();
      window.DMZStorage.setFavoriteOrder(nextOrder);
    });

    favoritesGrid.addEventListener("dragend", function () {
      clearFavoriteDragState();
    });

    favoritesGrid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-action]");
      var total;
      var current;

      if (!trigger) {
        return;
      }

      if (trigger.dataset.action === "drag-handle") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (trigger.dataset.action === "toggle-favorite") {
        event.preventDefault();
        event.stopPropagation();

        if (trigger.dataset.favoriteType === "recipe") {
          window.DMZStorage.toggleFavoriteRecipe(trigger.dataset.favoriteId || trigger.dataset.recipeKey);
        } else {
          window.DMZStorage.toggleFavoriteUpgrade(trigger.dataset.favoriteId || trigger.dataset.upgradeId);
        }

        return;
      }

      total = Number(trigger.dataset.total || 0);
      current = window.DMZStorage.getTaskCount(trigger.dataset.taskId);

      if (trigger.dataset.action === "decrement") {
        window.DMZStorage.setTaskCount(trigger.dataset.taskId, Math.max(0, current - 1));
      }

      if (trigger.dataset.action === "increment") {
        window.DMZStorage.setTaskCount(trigger.dataset.taskId, Math.min(total, current + 1));
      }

      if (trigger.dataset.action === "toggle-complete") {
        window.DMZStorage.setTaskCount(trigger.dataset.taskId, current >= total ? 0 : total);
      }
    });

    favoritesGrid.addEventListener("change", function (event) {
      if (!event.target.matches(".task-input")) {
        return;
      }

      window.DMZStorage.setTaskCount(
        event.target.dataset.taskId,
        window.DMZApp.clampTaskCount(
          { totalCount: Number(event.target.dataset.total || 0) },
          event.target.value
        )
      );
    });

    window.DMZStorage.subscribe(render);
    render();
  });
}());