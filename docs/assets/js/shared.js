(function () {
  var data = Array.isArray(window.DMZ_UPGRADES) ? window.DMZ_UPGRADES : [];
  var CATEGORY_META = {
    "stash": {
      code: "ST",
      href: "./stash.html",
      eyebrow: "Wallet + keys",
      accent: "var(--nord13)",
      overviewIconKeys: ["stash_wallet.png", "stash_stash.png"]
    },
    "weapons-locker": {
      code: "WL",
      href: "./weapons-locker.html",
      eyebrow: "Insured + contraband",
      accent: "var(--nord8)",
      overviewIconKeys: ["weapons_locker_slot.png", "weapons_locker_contraband.png"]
    },
    "bounty-board": {
      code: "BB",
      href: "./bounty-board.html",
      eyebrow: "Barter + discounts",
      accent: "var(--nord12)",
      overviewIconKeys: ["car_boss.png", "armored_boss.png"]
    },
    "communications": {
      code: "CO",
      href: "./communications.html",
      eyebrow: "Urgents + intel",
      accent: "var(--nord7)",
      overviewIconKeys: ["black_mous.png", "white_lotus.png"]
    },
    "equipment": {
      code: "EQ",
      href: "./equipment.html",
      eyebrow: "Gear + survival",
      accent: "var(--nord14)",
      overviewIconKeys: ["unlock_rebreather.png", "unlock_armor_box.png"]
    }
  };
  var GROUP_RULES = {
    "stash": [
      {
        key: "wallet",
        title: "Wallet Expansions",
        copy: "Capacity unlocks and Crown follow-up wallet upgrades.",
        test: function (upgrade) {
          return /wallet/i.test(upgrade.title);
        }
      },
      {
        key: "stash",
        title: "Mission + Key Stash",
        copy: "Mission item and key stash slot expansions.",
        test: function (upgrade) {
          return /stash expansion/i.test(upgrade.title);
        }
      }
    ],
    "weapons-locker": [
      {
        key: "insured",
        title: "Insured Slots",
        copy: "Slot unlocks and insured-slot cooldown reductions.",
        test: function (upgrade) {
          return /insured slot/i.test(upgrade.title);
        }
      },
      {
        key: "contraband",
        title: "Contraband Stash",
        copy: "Contraband stash expansions, including Crown tiers.",
        test: function (upgrade) {
          return /contraband stash/i.test(upgrade.title);
        }
      }
    ],
    "bounty-board": [
      {
        key: "barters",
        title: "Barter Unlocks",
        copy: "Recipe and barter unlocks for specialty gear.",
        test: function (upgrade) {
          return /barter/i.test(upgrade.title);
        }
      },
      {
        key: "utility",
        title: "Exfil Access",
        copy: "Personal exfil unlocks before discount tuning starts.",
        test: function (upgrade) {
          return /^personal exfils$/i.test(upgrade.title);
        }
      },
      {
        key: "discounts",
        title: "Discount Tuning",
        copy: "Price reductions for killstreaks, exfils, plates, and workbench use.",
        test: function (upgrade) {
          return /discount/i.test(upgrade.title);
        }
      }
    ],
    "communications": [
      {
        key: "urgents",
        title: "Urgent Mission Access",
        copy: "Daily and weekly urgent mission unlocks by faction.",
        test: function (upgrade) {
          return /urgent missions/i.test(upgrade.title);
        }
      },
      {
        key: "economy",
        title: "Contracts + Loot",
        copy: "Payment, safe-content, and supply cache improvements.",
        test: function (upgrade) {
          return /contract payment|safe contents|supply cache contents/i.test(upgrade.title);
        }
      },
      {
        key: "intel",
        title: "Intel Signals",
        copy: "Commander, safe, and weapon stash intel improvements.",
        test: function (upgrade) {
          return /intel/i.test(upgrade.title);
        }
      },
      {
        key: "durations",
        title: "Duration Tuning",
        copy: "UAV, SAM site, and exfil timing upgrades.",
        test: function (upgrade) {
          return /duration|exfil chopper speed/i.test(upgrade.title);
        }
      }
    ],
    "equipment": [
      {
        key: "armor",
        title: "Armor Tiers",
        copy: "Persistent starting armor increases.",
        test: function (upgrade) {
          return /starting armor/i.test(upgrade.title);
        }
      },
      {
        key: "gear",
        title: "Field Gear",
        copy: "Utility equipment and self-revive access.",
        test: function () {
          return true;
        }
      }
    ]
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function isCrownUpgrade(upgrade) {
    var title = upgrade && upgrade.title ? normalize(upgrade.title) : "";
    var unlockName = upgrade && upgrade.unlock && upgrade.unlock.name ? normalize(upgrade.unlock.name) : "";
    var iconPath = upgrade && upgrade.iconPath ? normalize(upgrade.iconPath) : "";

    return title.indexOf("crown") !== -1 ||
      unlockName === "crown" ||
      iconPath.indexOf("crown.png") !== -1;
  }

  function shouldShowCrownUpgrades(state) {
    return !state || !state.upgradeVisibility || state.upgradeVisibility.showCrownUpgrades !== false;
  }

  function filterVisibleUpgrades(upgrades, state) {
    if (!Array.isArray(upgrades)) {
      return [];
    }

    if (shouldShowCrownUpgrades(state)) {
      return upgrades.slice();
    }

    return upgrades.filter(function (upgrade) {
      return !isCrownUpgrade(upgrade);
    });
  }

  function cloneCategory(category, state) {
    return Object.assign({}, category, {
      upgrades: filterVisibleUpgrades(category.upgrades, state)
    });
  }

  function getCategories(state) {
    return data.map(function (category) {
      return cloneCategory(category, state);
    });
  }

  function getCategory(slug, state) {
    return getCategories(state).find(function (category) {
      return category.slug === slug;
    }) || null;
  }

  function getUpgradeEntry(upgradeId, state) {
    var categoryIndex;
    var upgradeIndex;
    var category;
    var upgrade;
    var categories = getCategories(state);

    for (categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
      category = categories[categoryIndex];

      for (upgradeIndex = 0; upgradeIndex < category.upgrades.length; upgradeIndex += 1) {
        upgrade = category.upgrades[upgradeIndex];

        if (upgrade.id === upgradeId) {
          return {
            category: category,
            upgrade: upgrade
          };
        }
      }
    }

    return null;
  }

  function getCategoryMeta(slug) {
    return CATEGORY_META[slug] || {
      code: slug.slice(0, 2).toUpperCase(),
      href: "./index.html",
      eyebrow: "DMZ upgrades",
      accent: "var(--nord8)"
    };
  }

  function getTaskCount(task, state) {
    var amount = state && state.taskCounts ? Number(state.taskCounts[task.id]) : 0;

    if (!Number.isFinite(amount) || amount < 0) {
      return 0;
    }

    return Math.min(Math.floor(amount), task.totalCount);
  }

  function isFavoriteUpgrade(upgradeId, state) {
    return Boolean(state && state.favoriteUpgradeIds && state.favoriteUpgradeIds.indexOf(upgradeId) !== -1);
  }

  function isFavoriteRecipe(recipeKey, state) {
    return Boolean(state && state.favoriteRecipeKeys && state.favoriteRecipeKeys.indexOf(recipeKey) !== -1);
  }

  function clampTaskCount(task, value) {
    var amount = Math.floor(Number(value) || 0);

    if (!Number.isFinite(amount) || amount < 0) {
      return 0;
    }

    return Math.min(amount, task.totalCount);
  }

  function getTaskStats(task, state) {
    var currentCount = getTaskCount(task, state);
    var totalCount = Math.max(1, Number(task.totalCount) || 1);
    var percent = Math.min((currentCount / totalCount) * 100, 100);

    return {
      currentCount: currentCount,
      totalCount: totalCount,
      percent: percent,
      isComplete: currentCount >= totalCount
    };
  }

  function getUpgradeStats(upgrade, state) {
    var taskStats = upgrade.tasks.map(function (task) {
      return getTaskStats(task, state);
    });
    var completedTasks = taskStats.filter(function (task) {
      return task.isComplete;
    }).length;
    var totalTasks = taskStats.length || 1;
    var percent = taskStats.reduce(function (sum, task) {
      return sum + task.percent;
    }, 0) / totalTasks;

    return {
      completedTasks: completedTasks,
      totalTasks: upgrade.tasks.length,
      percent: percent,
      isComplete: completedTasks === upgrade.tasks.length,
      taskStats: taskStats
    };
  }

  function getCategoryStats(category, state) {
    var visibleUpgrades = filterVisibleUpgrades(category.upgrades, state);
    var upgradeStats = visibleUpgrades.map(function (upgrade) {
      return getUpgradeStats(upgrade, state);
    });
    var completedUpgrades = upgradeStats.filter(function (upgrade) {
      return upgrade.isComplete;
    }).length;
    var completedTasks = upgradeStats.reduce(function (sum, upgrade) {
      return sum + upgrade.completedTasks;
    }, 0);
    var totalTasks = upgradeStats.reduce(function (sum, upgrade) {
      return sum + upgrade.totalTasks;
    }, 0);
    var percent = upgradeStats.length
      ? upgradeStats.reduce(function (sum, upgrade) {
          return sum + upgrade.percent;
        }, 0) / upgradeStats.length
      : 0;

    return {
      completedUpgrades: completedUpgrades,
      totalUpgrades: visibleUpgrades.length,
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      percent: percent
    };
  }

  function getOverallStats(state) {
    var categories = getCategories(state);
    var categoryStats = categories.map(function (category) {
      return getCategoryStats(category, state);
    });
    var completedUpgrades = categoryStats.reduce(function (sum, category) {
      return sum + category.completedUpgrades;
    }, 0);
    var totalUpgrades = categoryStats.reduce(function (sum, category) {
      return sum + category.totalUpgrades;
    }, 0);
    var completedTasks = categoryStats.reduce(function (sum, category) {
      return sum + category.completedTasks;
    }, 0);
    var totalTasks = categoryStats.reduce(function (sum, category) {
      return sum + category.totalTasks;
    }, 0);
    var percent = categoryStats.length
      ? categoryStats.reduce(function (sum, category) {
          return sum + category.percent;
        }, 0) / categoryStats.length
      : 0;

    return {
      completedUpgrades: completedUpgrades,
      totalUpgrades: totalUpgrades,
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      percent: percent
    };
  }

  function upgradeMatchesQuery(upgrade, query, state) {
    var normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return true;
    }

    if (!shouldShowCrownUpgrades(state) && isCrownUpgrade(upgrade)) {
      return false;
    }

    return normalize([
      upgrade.title,
      upgrade.reward,
      upgrade.unlock && upgrade.unlock.name,
      upgrade.tasks.map(function (task) {
        return task.title;
      }).join(" ")
    ].join(" ")).indexOf(normalizedQuery) !== -1;
  }

  function categoryMatchesQuery(category, query, state) {
    var normalizedQuery = normalize(query);
    var visibleUpgrades = filterVisibleUpgrades(category.upgrades, state);

    if (!normalizedQuery) {
      return true;
    }

    if (normalize(category.title).indexOf(normalizedQuery) !== -1) {
      return true;
    }

    if (shouldShowCrownUpgrades(state) && normalize(category.title + " " + category.summary).indexOf(normalizedQuery) !== -1) {
      return true;
    }

    return visibleUpgrades.some(function (upgrade) {
      return upgradeMatchesQuery(upgrade, normalizedQuery, state);
    });
  }

  function getMatchingTasks(upgrade, query) {
    var normalizedQuery = normalize(query);

    return upgrade.tasks.filter(function (task) {
      return normalize(task.title).indexOf(normalizedQuery) !== -1;
    });
  }

  function getSearchMatches(query, state) {
    var normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return getCategories(state).reduce(function (matches, category) {
      var matchingUpgrades = category.upgrades.filter(function (upgrade) {
        return upgradeMatchesQuery(upgrade, normalizedQuery, state);
      }).map(function (upgrade) {
        return {
          category: category,
          upgrade: upgrade,
          tasks: getMatchingTasks(upgrade, normalizedQuery),
          stats: getUpgradeStats(upgrade, state)
        };
      });

      return matches.concat(matchingUpgrades);
    }, []);
  }

  function groupUpgrades(category, state) {
    var rules = GROUP_RULES[category.slug] || [
      {
        key: "default",
        title: category.title,
        copy: category.summary,
        test: function () {
          return true;
        }
      }
    ];
    var groups = rules.map(function (rule) {
      return {
        key: rule.key,
        title: rule.title,
        copy: rule.copy,
        upgrades: []
      };
    });

    filterVisibleUpgrades(category.upgrades, state).forEach(function (upgrade) {
      var match = rules.find(function (rule) {
        return rule.test(upgrade);
      });
      var group = groups.find(function (item) {
        return item.key === match.key;
      });

      group.upgrades.push(upgrade);
    });

    return groups.filter(function (group) {
      return group.upgrades.length > 0;
    });
  }

  function renderProgressTrack(percent, leftText, rightText, small) {
    return "<div>" +
      "<div class=\"progress-track" + (small ? " progress-track--small" : "") + "\">" +
        "<div class=\"progress-track__fill\" style=\"width:" + percent.toFixed(2) + "%\"></div>" +
      "</div>" +
      "<div class=\"progress-track__text\">" +
        "<span>" + escapeHtml(leftText) + "</span>" +
        "<span>" + escapeHtml(rightText) + "</span>" +
      "</div>" +
    "</div>";
  }

  function renderFavoriteToggle(favoriteId, isFavorite, favoriteType) {
    var type = favoriteType === "recipe" ? "recipe" : "upgrade";
    var label = (isFavorite ? "Remove " : "Add ") + type + (isFavorite ? " from favorites" : " to favorites");
    var typeAttribute = type === "recipe"
      ? " data-recipe-key=\"" + favoriteId + "\""
      : " data-upgrade-id=\"" + favoriteId + "\"";

    return "<button class=\"favorite-toggle" + (isFavorite ? " is-active" : "") + "\" type=\"button\" data-action=\"toggle-favorite\" data-favorite-type=\"" + type + "\" data-favorite-id=\"" + favoriteId + "\"" + typeAttribute + " aria-pressed=\"" + (isFavorite ? "true" : "false") + "\" aria-label=\"" + escapeHtml(label) + "\" title=\"" + escapeHtml(label) + "\">" +
      "<span class=\"favorite-toggle__icon\" aria-hidden=\"true\">" + (isFavorite ? "&#9733;" : "&#9734;") + "</span>" +
    "</button>";
  }

  function renderItemIcon(iconPath, className) {
    if (!iconPath) {
      return "";
    }

    return "<span class=\"item-icon " + className + "\" aria-hidden=\"true\"><img src=\"" + escapeHtml(iconPath) + "\" alt=\"\" loading=\"lazy\" decoding=\"async\"></span>";
  }

  function renderTaskControlRow(task, state) {
    var stats = getTaskStats(task, state);

    return "<li class=\"task-row" + (stats.isComplete ? " is-complete" : "") + "\">" +
      "<div class=\"task-row__main\">" +
        renderItemIcon(task.iconPath, "task-row__icon") +
        "<div class=\"task-row__content\">" +
          "<div class=\"task-row__header\">" +
            "<span class=\"task-row__title\">" + escapeHtml(task.title) + "</span>" +
            "<span class=\"task-row__count\">" + stats.currentCount + " / " + stats.totalCount + "</span>" +
          "</div>" +
          renderProgressTrack(stats.percent, stats.currentCount + " tracked", task.totalCount + " required", true) +
        "</div>" +
      "</div>" +
      "<div class=\"task-controls\">" +
        "<button class=\"stepper\" type=\"button\" data-action=\"decrement\" data-task-id=\"" + task.id + "\" data-total=\"" + task.totalCount + "\" aria-label=\"Decrease progress for " + escapeHtml(task.title) + "\">-</button>" +
        "<input class=\"task-input\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"" + task.totalCount + "\" value=\"" + stats.currentCount + "\" data-task-id=\"" + task.id + "\" data-total=\"" + task.totalCount + "\" aria-label=\"Tracked amount for " + escapeHtml(task.title) + "\">" +
        "<button class=\"stepper\" type=\"button\" data-action=\"increment\" data-task-id=\"" + task.id + "\" data-total=\"" + task.totalCount + "\" aria-label=\"Increase progress for " + escapeHtml(task.title) + "\">+</button>" +
        "<button class=\"button button--ghost button--small\" type=\"button\" data-action=\"toggle-complete\" data-task-id=\"" + task.id + "\" data-total=\"" + task.totalCount + "\">" + (stats.isComplete ? "Clear" : "Done") + "</button>" +
      "</div>" +
    "</li>";
  }

  function formatPercent(value) {
    return Math.round(value) + "%";
  }

  function clampPercent(value) {
    if (typeof value !== "number" || !isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  }

  function getMeterProgressColor(percent) {
    var safePercent = clampPercent(percent);
    var hue = safePercent * 1.2;

    return "hsl(" + hue.toFixed(2) + "deg 72% 58%)";
  }

  function renderMeter(container, percent, label) {
    var safePercent;

    if (!container) {
      return;
    }

    safePercent = clampPercent(percent);

    container.style.setProperty("--progress", safePercent.toFixed(2) + "%");
    container.style.setProperty("--progress-end", getMeterProgressColor(safePercent));
    container.innerHTML = "<div class=\"meter__content\"><div class=\"meter__value\">" + escapeHtml(formatPercent(safePercent)) + "</div><span class=\"meter__label\">" + escapeHtml(label) + "</span></div>";
  }

  function highlightHashTarget() {
    var hash = window.location.hash ? window.location.hash.slice(1) : "";
    var target;

    if (!hash) {
      return;
    }

    target = document.getElementById(hash);

    if (!target) {
      return;
    }

    target.classList.remove("is-highlighted");
    window.requestAnimationFrame(function () {
      target.classList.add("is-highlighted");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function initMobileNav() {
    var header = document.querySelector(".site-header");
    var bar = header && header.querySelector(".site-header__bar");
    var nav = header && header.querySelector(".site-nav");
    var mobileQuery;
    var toggle;
    var navId;

    if (!header || !bar || !nav) {
      return;
    }

    mobileQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 640px)")
      : null;
    navId = nav.id || "site-nav-primary";
    nav.id = navId;
    header.classList.add("is-nav-enhanced");

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-controls", navId);
    toggle.innerHTML = "" +
      '<span class="visually-hidden">Toggle navigation menu</span>' +
      '<span class="nav-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>';

    function isMobileNav() {
      return Boolean(mobileQuery && mobileQuery.matches);
    }

    function setNavState(isOpen) {
      header.classList.toggle("is-nav-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

      if (isMobileNav()) {
        nav.hidden = !isOpen;
      } else {
        nav.hidden = false;
      }
    }

    function syncNavState() {
      if (!isMobileNav()) {
        setNavState(false);
        return;
      }

      setNavState(header.classList.contains("is-nav-open"));
    }

    toggle.addEventListener("click", function () {
      setNavState(!header.classList.contains("is-nav-open"));
    });

    nav.addEventListener("click", function (event) {
      if (!isMobileNav()) {
        return;
      }

      if (event.target.closest(".site-nav__link")) {
        setNavState(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (!isMobileNav() || !header.classList.contains("is-nav-open")) {
        return;
      }

      if (!header.contains(event.target)) {
        setNavState(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !header.classList.contains("is-nav-open")) {
        return;
      }

      setNavState(false);
      toggle.focus();
    });

    if (mobileQuery) {
      if (typeof mobileQuery.addEventListener === "function") {
        mobileQuery.addEventListener("change", syncNavState);
      } else if (typeof mobileQuery.addListener === "function") {
        mobileQuery.addListener(syncNavState);
      }
    }

    bar.insertBefore(toggle, nav);
    syncNavState();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
  });

  window.DMZApp = {
    escapeHtml: escapeHtml,
    getCategories: getCategories,
    getCategory: getCategory,
    getUpgradeEntry: getUpgradeEntry,
    getCategoryMeta: getCategoryMeta,
    getTaskCount: getTaskCount,
    getTaskStats: getTaskStats,
    getUpgradeStats: getUpgradeStats,
    getCategoryStats: getCategoryStats,
    getOverallStats: getOverallStats,
    isFavoriteUpgrade: isFavoriteUpgrade,
    isFavoriteRecipe: isFavoriteRecipe,
    upgradeMatchesQuery: upgradeMatchesQuery,
    categoryMatchesQuery: categoryMatchesQuery,
    getMatchingTasks: getMatchingTasks,
    getSearchMatches: getSearchMatches,
    groupUpgrades: groupUpgrades,
    renderProgressTrack: renderProgressTrack,
    renderFavoriteToggle: renderFavoriteToggle,
    renderItemIcon: renderItemIcon,
    renderTaskControlRow: renderTaskControlRow,
    renderMeter: renderMeter,
    formatPercent: formatPercent,
    clampTaskCount: clampTaskCount,
    highlightHashTarget: highlightHashTarget
  };
}());