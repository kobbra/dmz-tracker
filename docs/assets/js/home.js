(function () {
  var collapsedFavoriteIds = Object.create(null);

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

  function shouldCollapseFavorite(upgradeId) {
    if (Object.prototype.hasOwnProperty.call(collapsedFavoriteIds, upgradeId)) {
      return collapsedFavoriteIds[upgradeId];
    }

    return false;
  }

  function renderFavoriteSection(state) {
    var entries = state.favoriteUpgradeIds.map(function (upgradeId) {
      return window.DMZApp.getUpgradeEntry(upgradeId);
    }).filter(function (entry) {
      return Boolean(entry);
    });

    if (!entries.length) {
      return {
        meta: "No favorites pinned yet",
        content: "<div class=\"empty-state\"><h3 class=\"empty-state__title\">No favorites yet</h3><p class=\"empty-state__copy\">Use the star on any category page and it will appear here for quick access and progress updates.</p></div>"
      };
    }

    return {
      meta: entries.length + (entries.length === 1 ? " favorite pinned" : " favorites pinned"),
      content: entries.map(function (entry) {
        var meta = window.DMZApp.getCategoryMeta(entry.category.slug);
        var stats = window.DMZApp.getUpgradeStats(entry.upgrade, state);
        var isCollapsed = shouldCollapseFavorite(entry.upgrade.id);
        var unlockLabel = (entry.upgrade.unlock && entry.upgrade.unlock.name ? entry.upgrade.unlock.name : "DMZ") +
          (entry.upgrade.unlock && entry.upgrade.unlock.level ? " " + entry.upgrade.unlock.level : "");
        var preview = entry.upgrade.reward || entry.upgrade.tasks.slice(0, 2).map(function (task) {
          return task.title;
        }).join(" | ");

        return "<details class=\"match-card favorite-card\" data-upgrade-id=\"" + entry.upgrade.id + "\"" + (isCollapsed ? "" : " open") + ">" +
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
            "<span class=\"upgrade-card__collapse\" aria-hidden=\"true\">" +
              "<span class=\"upgrade-card__collapse-icon\" aria-hidden=\"true\"></span>" +
            "</span>" +
          "</summary>" +
          "<div class=\"favorite-card__details\">" +
            "<ul class=\"task-list favorite-card__tasks\">" +
              entry.upgrade.tasks.map(function (task) {
                return window.DMZApp.renderTaskControlRow(task, state);
              }).join("") +
            "</ul>" +
          "</div>" +
        "</details>";
      }).join("")
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "home") {
      return;
    }

    var searchInput = document.getElementById("homeSearch");
    var storageNotice = document.getElementById("storageNotice");
    var meter = document.getElementById("overallMeter");
    var metrics = document.getElementById("metricGrid");
    var categoryGrid = document.getElementById("categoryGrid");
    var favoritesMeta = document.getElementById("favoritesMeta");
    var favoritesGrid = document.getElementById("favoritesGrid");
    var resultsSection = document.getElementById("searchResultsSection");
    var resultsMeta = document.getElementById("searchResultsMeta");
    var resultsGrid = document.getElementById("searchResults");
    var query = "";

    function render() {
      var state = window.DMZStorage.getState();
      var stats = window.DMZApp.getOverallStats(state);
      var favoriteState = renderFavoriteSection(state);
      var searchState = renderSearchMatches(query, state);

      window.DMZApp.renderStorageNotice(storageNotice);
      window.DMZApp.renderMeter(meter, stats.percent, "overall completion");
      metrics.innerHTML = renderMetricGrid(stats);
      favoritesMeta.textContent = favoriteState.meta;
      favoritesGrid.innerHTML = favoriteState.content;
      Array.prototype.forEach.call(favoritesGrid.querySelectorAll(".favorite-card"), function (card) {
        card.addEventListener("toggle", function () {
          collapsedFavoriteIds[card.dataset.upgradeId] = !card.open;
        });
      });
      categoryGrid.innerHTML = renderCategoryCards(query, state);
      resultsSection.hidden = searchState.hidden;
      resultsMeta.textContent = searchState.meta;
      resultsGrid.innerHTML = searchState.content;
    }

    searchInput.addEventListener("input", function (event) {
      query = event.target.value;
      render();
    });

    favoritesGrid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-action]");
      var total;
      var current;

      if (!trigger) {
        return;
      }

      if (trigger.dataset.action === "toggle-favorite") {
        event.preventDefault();
        event.stopPropagation();
        window.DMZStorage.toggleFavoriteUpgrade(trigger.dataset.upgradeId);
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