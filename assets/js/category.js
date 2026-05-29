(function () {
  var collapsedUpgradeIds = Object.create(null);

  function renderCategoryMetrics(category, stats) {
    return [
      {
        label: "Upgrades Complete",
        value: stats.completedUpgrades + " / " + stats.totalUpgrades,
        detail: "Fully completed upgrade cards."
      },
      {
        label: "Tasks Complete",
        value: stats.completedTasks + " / " + stats.totalTasks,
        detail: "Objective rows with their required counts met."
      },
      {
        label: "Search Scope",
        value: category.upgrades.length + " upgrades",
        detail: "Search checks titles, factions, rewards, and objective rows."
      }
    ].map(function (item) {
      return "<article class=\"metric-card\">" +
        "<span class=\"metric-card__label\">" + window.DMZApp.escapeHtml(item.label) + "</span>" +
        "<div class=\"metric-card__value\">" + window.DMZApp.escapeHtml(item.value) + "</div>" +
        "<div class=\"metric-card__detail\">" + window.DMZApp.escapeHtml(item.detail) + "</div>" +
      "</article>";
    }).join("");
  }

  function renderUpgradeCard(upgrade, state, isCollapsed) {
    var stats = window.DMZApp.getUpgradeStats(upgrade, state);
    var unlockLabel = (upgrade.unlock && upgrade.unlock.name ? upgrade.unlock.name : "DMZ") + (upgrade.unlock && upgrade.unlock.level ? " " + upgrade.unlock.level : "");
    var isFavorite = window.DMZApp.isFavoriteUpgrade(upgrade.id, state);

    return "<details class=\"upgrade-card" + (stats.isComplete ? " is-complete" : "") + "\" id=\"" + upgrade.id + "\"" + (isCollapsed ? "" : " open") + ">" +
      "<summary class=\"upgrade-card__summary\">" +
        "<div class=\"upgrade-card__summary-main\">" +
          "<div class=\"upgrade-card__title-row\">" +
            window.DMZApp.renderItemIcon(upgrade.iconPath, "upgrade-card__summary-icon") +
            "<h3 class=\"upgrade-card__title\">" + window.DMZApp.escapeHtml(upgrade.title) + "</h3>" +
            window.DMZApp.renderFavoriteToggle(upgrade.id, isFavorite) +
          "</div>" +
          "<div class=\"upgrade-card__summary-progress\">" +
            window.DMZApp.renderProgressTrack(stats.percent, stats.completedTasks + " / " + stats.totalTasks + " tasks", window.DMZApp.formatPercent(stats.percent), true) +
          "</div>" +
        "</div>" +
        "<span class=\"upgrade-card__collapse\" aria-hidden=\"true\">" +
          "<span class=\"upgrade-card__collapse-icon\" aria-hidden=\"true\"></span>" +
        "</span>" +
      "</summary>" +
      "<div class=\"upgrade-card__details\">" +
        "<div class=\"upgrade-card__chips\">" +
          "<span class=\"chip chip--accent\">" + window.DMZApp.escapeHtml(unlockLabel) + "</span>" +
        "</div>" +
        "<ul class=\"task-list\">" +
          upgrade.tasks.map(function (task) {
            return window.DMZApp.renderTaskControlRow(task, state);
          }).join("") +
        "</ul>" +
        (upgrade.reward
          ? "<div class=\"upgrade-card__reward\">" +
              window.DMZApp.renderItemIcon(upgrade.rewardIconPath, "upgrade-card__reward-icon") +
              "<div class=\"upgrade-card__reward-copy\">" +
                "<p class=\"upgrade-card__reward-label\">Reward</p>" +
                "<p class=\"upgrade-card__reward-value\">" + window.DMZApp.escapeHtml(upgrade.reward) + "</p>" +
              "</div>" +
            "</div>"
          : "") +
      "</div>" +
    "</details>";
  }

  function shouldCollapseUpgrade(upgradeId, query) {
    var hash = window.location.hash ? window.location.hash.slice(1) : "";

    if (query) {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(collapsedUpgradeIds, upgradeId)) {
      return collapsedUpgradeIds[upgradeId];
    }

    if (hash === upgradeId) {
      return false;
    }

    return true;
  }

  function renderGroups(category, query, state) {
    var groups = window.DMZApp.groupUpgrades(category).map(function (group) {
      return {
        key: group.key,
        title: group.title,
        copy: group.copy,
        upgrades: group.upgrades.filter(function (upgrade) {
          return window.DMZApp.upgradeMatchesQuery(upgrade, query);
        })
      };
    }).filter(function (group) {
      return group.upgrades.length > 0;
    });

    if (!groups.length) {
      return "<div class=\"empty-state\"><h3 class=\"empty-state__title\">Nothing matches that filter</h3><p class=\"empty-state__copy\">Try a broader search term like a faction name, barter type, or item drop.</p></div>";
    }

    return groups.map(function (group) {
      return "<section class=\"group-card\">" +
        "<div class=\"group-card__header\">" +
          "<div>" +
            "<p class=\"group-card__title\">" + window.DMZApp.escapeHtml(group.title) + "</p>" +
            "<p class=\"group-card__copy\">" + window.DMZApp.escapeHtml(group.copy) + "</p>" +
          "</div>" +
          "<span class=\"chip\">" + group.upgrades.length + " upgrades shown</span>" +
        "</div>" +
        "<div class=\"upgrade-grid\">" +
          group.upgrades.map(function (upgrade) {
            return renderUpgradeCard(upgrade, state, shouldCollapseUpgrade(upgrade.id, query));
          }).join("") +
        "</div>" +
      "</section>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page !== "category") {
      return;
    }

    var slug = document.body.dataset.category;
    var category = window.DMZApp.getCategory(slug);
    var storageNotice = document.getElementById("storageNotice");
    var titleNode = document.getElementById("categoryTitle");
    var copyNode = document.getElementById("categoryCopy");
    var meter = document.getElementById("categoryMeter");
    var metrics = document.getElementById("categoryMetrics");
    var filterMeta = document.getElementById("filterMeta");
    var groups = document.getElementById("categoryGroups");
    var searchInput = document.getElementById("categorySearch");
    var resetButton = document.getElementById("resetProgress");
    var lastStatsKey = "";
    var query = "";

    if (!category) {
      return;
    }

    document.title = category.title + " | DMZ Tracker";
    titleNode.textContent = category.title;
    copyNode.textContent = category.summary;
    window.DMZApp.renderStorageNotice(storageNotice);

    function getStatsKey(stats) {
      return [
        stats.completedUpgrades,
        stats.totalUpgrades,
        stats.completedTasks,
        stats.totalTasks,
        stats.percent
      ].join("|");
    }

    function render() {
      var state = window.DMZStorage.getState();
      var stats = window.DMZApp.getCategoryStats(category, state);
      var statsKey = getStatsKey(stats);
      var matchingCount = category.upgrades.filter(function (upgrade) {
        return window.DMZApp.upgradeMatchesQuery(upgrade, query);
      }).length;

      filterMeta.textContent = (query ? matchingCount + " of " + category.upgrades.length + " upgrades shown" : category.upgrades.length + " upgrades") + " | " + stats.completedTasks + "/" + stats.totalTasks + " tasks complete";

      if (statsKey !== lastStatsKey) {
        window.DMZApp.renderMeter(meter, stats.percent, category.title + " progress");
        metrics.innerHTML = renderCategoryMetrics(category, stats);
        lastStatsKey = statsKey;
      }

      groups.innerHTML = renderGroups(category, query, state);
      Array.prototype.forEach.call(groups.querySelectorAll(".upgrade-card"), function (card) {
        card.addEventListener("toggle", function () {
          collapsedUpgradeIds[card.id] = !card.open;
        });
      });
      window.DMZApp.highlightHashTarget();
    }

    groups.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-action]");
      var total;
      var current;

      if (!trigger) {
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

      if (trigger.dataset.action === "toggle-favorite") {
        event.preventDefault();
        event.stopPropagation();
        window.DMZStorage.toggleFavoriteUpgrade(trigger.dataset.upgradeId);
      }
    });

    groups.addEventListener("change", function (event) {
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

    searchInput.addEventListener("input", function (event) {
      query = event.target.value;
      render();
    });

    resetButton.addEventListener("click", function () {
      if (window.confirm("Reset all tracked DMZ progress in this browser?")) {
        window.DMZStorage.reset();
      }
    });

    window.addEventListener("hashchange", window.DMZApp.highlightHashTarget);
    window.DMZStorage.subscribe(render);
    render();
  });
}());