(function () {
  var data = Array.isArray(window.DMZ_BARTER_RECIPES) ? window.DMZ_BARTER_RECIPES.slice() : [];
  var collapsedRecipeKeys = Object.create(null);
  var REGION_META = {
    all: {
      label: "All Regions",
      copy: "Compare shared crafts and region-specific variants side by side."
    },
    "al-mazrah": {
      label: "Al Mazrah",
      copy: "Original barter set with Koschei-adjacent utility crafts and key trades."
    },
    "ashika-island": {
      label: "Ashika Island",
      copy: "Ashika variants mix island valuables with the shared Season 3 barter unlocks."
    },
    vondel: {
      label: "Vondel",
      copy: "Vondel keeps the shared staples while adding its own mission and weapon trades."
    }
  };
  var FAMILY_META = {
    vests: "Vests",
    backpacks: "Backpacks",
    keys: "Keys",
    utility: "Utility",
    weapons: "Weapons",
    special: "Special Items"
  };
  var FAMILY_ORDER = {
    vests: 0,
    backpacks: 1,
    keys: 2,
    utility: 3,
    weapons: 4,
    special: 5
  };
  var TYPE_META = {
    gold: {
      label: "Gold-tier",
      className: "chip chip--accent"
    },
    red: {
      label: "Weapon trade",
      className: "chip chip--warning"
    }
  };
  var REGION_ORDER = ["al-mazrah", "ashika-island", "vondel"];
  var RECIPE_ICON_PATHS = {
    "three-plate-comms-vest": "./assets/images/dmz/rewards/commvest_3.png",
    "three-plate-medic-vest": "./assets/images/dmz/rewards/medical_vest_3.png",
    "three-plate-stealth-vest": "./assets/images/dmz/rewards/stealthvest_3.png",
    "scavenger-backpack": "./assets/images/dmz/rewards/scavengerbackpack.png",
    "secure-backpack": "./assets/images/dmz/rewards/securebackpack.png",
    "revive-pistol": "./assets/images/dmz/rewards/revivepistol.png",
    "skeleton-key": "./assets/images/dmz/rewards/skeleton_key.png",
    "grenade-launcher": "./assets/images/dmz/rewards/mk32.png",
    "assault-rifle": "./assets/images/dmz/rewards/assault_rifle.png",
    "rebreather": "./assets/images/dmz/rewards/unlock_rebreather.png",
    "armor-box": "./assets/images/dmz/rewards/unlock_armor_box.png",
    "self-revive-kit": "./assets/images/dmz/rewards/unlock_self_revive.png",
    "gold-fish": "./assets/images/dmz/rewards/gold_fish.png",
    "durable-gas-mask": "./assets/images/dmz/items/durable_gasmask.png",
    "fortress-key": "./assets/images/dmz/items/dmz_key.png",
    "encrypted-key": "./assets/images/dmz/items/dmz_key.png",
    "poppy-farmer-house-key": "./assets/images/dmz/items/dmz_key.png",
    "night-vision-goggles": "./assets/images/dmz/items/night_vision_googles.png",
    "radiation-blocker": "./assets/images/dmz/items/radiationblockers.png",
    "console-devkit": "./assets/images/dmz/items/game_console.png",
    "munitions-box": "./assets/images/dmz/items/launcher_ammo.png"
  };
  var ITEM_ICON_PATHS = {
    "aged-wine": "./assets/images/dmz/items/aged_wine.png",
    "ashika-kitsune-original": "./assets/images/dmz/items/original_ashika_masks.png",
    bandage: "./assets/images/dmz/items/bandage.png",
    battery: "./assets/images/dmz/items/batteries.png",
    "blow-torch": "./assets/images/dmz/items/blowtorch.png",
    c4: "./assets/images/dmz/items/plastic_explosive.png",
    "canned-foods": "./assets/images/dmz/items/cans_food.png",
    "car-battery": "./assets/images/dmz/items/carbattery.png",
    cash: "./assets/images/dmz/items/cash.png",
    "comic-book": "./assets/images/dmz/items/comicbook.png",
    "dog-bank": "./assets/images/dmz/items/water.png",
    "durable-gas-mask": "./assets/images/dmz/items/durable_gasmask.png",
    "electric-drill": "./assets/images/dmz/items/electric_drill.png",
    "electrical-tape": "./assets/images/dmz/items/electric_tape.png",
    "emergency-rations": "./assets/images/dmz/items/food_rations.png",
    "encrypted-hard-drive": "./assets/images/dmz/items/encrypted_harddrive.png",
    "encrypted-usb-stick": "./assets/images/dmz/items/thumbdrives.png",
    "first-edition-comic-book": "./assets/images/dmz/items/comicbook.png",
    "game-console": "./assets/images/dmz/items/game_console.png",
    "gas-can": "./assets/images/dmz/items/gascans.png",
    "gas-mask": "./assets/images/dmz/items/gas_mask.png",
    "gold-bar": "./assets/images/dmz/items/gold.png",
    "gold-skull": "./assets/images/dmz/items/skull.png",
    "golden-skull-of-al-bagra": "./assets/images/dmz/items/skull.png",
    gpu: "./assets/images/dmz/items/gpu.png",
    "gun-cleaning-oil": "./assets/images/dmz/items/gun_oil.png",
    "hard-drive": "./assets/images/dmz/items/harddrives.png",
    "imported-tea": "./assets/images/dmz/items/imported_tea.png",
    launcher: "./assets/images/dmz/items/launcher_ammo.png",
    lighter: "./assets/images/dmz/items/lighter.png",
    liquor: "./assets/images/dmz/items/liquor.png",
    "nuclear-fuel-rod": "./assets/images/dmz/items/nuclearfuel.png",
    "purified-water": "./assets/images/dmz/items/water.png",
    "radiation-blocker": "./assets/images/dmz/items/radiationblockers.png",
    screwdriver: "./assets/images/dmz/items/screwdriver.png",
    "self-revive-kit": "./assets/images/dmz/items/self_revive.png",
    "soothing-hand-cream": "./assets/images/dmz/items/hand_cream.png",
    "stronghold-keycard": "./assets/images/dmz/items/stronghold_key.png",
    "three-plate-armor-vest": "./assets/images/dmz/items/armor_plate_carrier.png",
    toothpaste: "./assets/images/dmz/items/toothpaste.png",
    "video-cassette-recorder": "./assets/images/dmz/items/VCR.png",
    watch: "./assets/images/dmz/items/watch.png",
    "vintage-wine": "./assets/images/dmz/items/vintage_wine.png"
  };

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getEscapeHtml() {
    return window.DMZApp && window.DMZApp.escapeHtml
      ? window.DMZApp.escapeHtml
      : function (value) {
          return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
        };
  }

  function getRegionLabel(region) {
    return REGION_META[region] ? REGION_META[region].label : region;
  }

  function getFamilyLabel(family) {
    return FAMILY_META[family] || family;
  }

  function getFallbackLabel(label) {
    return String(label || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("") || "?";
  }

  function renderIcon(iconPath, label, className) {
    var escapeHtml = getEscapeHtml();

    if (iconPath) {
      return window.DMZApp.renderItemIcon(iconPath, className);
    }

    return "<span class=\"item-icon " + className + " item-icon--fallback\" aria-hidden=\"true\"><span>" +
      escapeHtml(getFallbackLabel(label)) +
    "</span></span>";
  }

  function getRecipeIconPath(recipe) {
    return RECIPE_ICON_PATHS[recipe.id] || ITEM_ICON_PATHS[recipe.id] || "";
  }

  function getIngredientIconPath(ingredient) {
    return ITEM_ICON_PATHS[ingredient.id] || RECIPE_ICON_PATHS[ingredient.id] || "";
  }

  function recipeMatchesQuery(recipe, query) {
    var normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return true;
    }

    return normalize([
      recipe.name,
      recipe.unlock,
      recipe.family,
      getFamilyLabel(recipe.family),
      recipe.region,
      getRegionLabel(recipe.region),
      recipe.ingredients.map(function (ingredient) {
        return ingredient.name;
      }).join(" ")
    ].join(" ")).indexOf(normalizedQuery) !== -1;
  }

  function getRegionCounts(query) {
    return REGION_ORDER.reduce(function (counts, region) {
      counts[region] = data.filter(function (recipe) {
        return recipe.region === region && recipeMatchesQuery(recipe, query);
      }).length;
      return counts;
    }, {
      all: data.filter(function (recipe) {
        return recipeMatchesQuery(recipe, query);
      }).length
    });
  }

  function getVisibleRecipes(region, query) {
    return data.filter(function (recipe) {
      return (region === "all" || recipe.region === region) && recipeMatchesQuery(recipe, query);
    }).sort(function (left, right) {
      var familyDiff = (FAMILY_ORDER[left.family] || 99) - (FAMILY_ORDER[right.family] || 99);

      if (familyDiff !== 0) {
        return familyDiff;
      }

      return left.name.localeCompare(right.name);
    });
  }

  function computeStats(recipes) {
    var regionSet = Object.create(null);
    var ingredientSet = Object.create(null);

    recipes.forEach(function (recipe) {
      regionSet[recipe.region] = true;
      recipe.ingredients.forEach(function (ingredient) {
        ingredientSet[ingredient.id] = true;
      });
    });

    return {
      visibleRecipes: recipes.length,
      visibleRegions: Object.keys(regionSet).length,
      ingredientKinds: Object.keys(ingredientSet).length,
      distinctRecipes: Object.keys(data.reduce(function (set, recipe) {
        set[recipe.id] = true;
        return set;
      }, Object.create(null))).length
    };
  }

  function renderHeroSummary() {
    var stats = computeStats(data);

    return [
      { value: data.length, label: "region recipes" },
      { value: stats.distinctRecipes, label: "distinct crafts" },
      { value: REGION_ORDER.length, label: "exclusion zones" }
    ].map(function (item) {
      return "<div class=\"barter-hero__stat\">" +
        "<span class=\"barter-hero__stat-value\">" + item.value + "</span>" +
        "<span class=\"barter-hero__stat-label\">" + getEscapeHtml()(item.label) + "</span>" +
      "</div>";
    }).join("");
  }

  function renderMetricGrid(recipes) {
    var stats = computeStats(recipes);
    var escapeHtml = getEscapeHtml();

    return [
      {
        label: "Recipes Shown",
        value: stats.visibleRecipes + " / " + data.length,
        detail: "Cards after the current search and region filters."
      },
      {
        label: "Regions In View",
        value: String(stats.visibleRegions),
        detail: "How many exclusion zones are represented in the current board."
      },
      {
        label: "Ingredient Types",
        value: String(stats.ingredientKinds),
        detail: "Distinct ingredient types across visible recipes."
      }
    ].map(function (item) {
      return "<article class=\"metric-card\">" +
        "<span class=\"metric-card__label\">" + escapeHtml(item.label) + "</span>" +
        "<div class=\"metric-card__value\">" + escapeHtml(item.value) + "</div>" +
        "<div class=\"metric-card__detail\">" + escapeHtml(item.detail) + "</div>" +
      "</article>";
    }).join("");
  }

  function renderRegionFilters(activeRegion, query) {
    var escapeHtml = getEscapeHtml();
    var counts = getRegionCounts(query);
    var items = ["all"].concat(REGION_ORDER);

    return items.map(function (region) {
      var isActive = region === activeRegion;
      return "<button class=\"filter-chip-button" + (isActive ? " is-active" : "") + "\" type=\"button\" data-region=\"" + region + "\" aria-pressed=\"" + (isActive ? "true" : "false") + "\">" +
        "<span class=\"filter-chip-button__label\">" + escapeHtml(getRegionLabel(region)) + "</span>" +
        "<span class=\"filter-chip-button__count\">" + escapeHtml(String(counts[region] || 0)) + "</span>" +
      "</button>";
    }).join("");
  }

  function renderTypeChip(recipe) {
    var meta = recipe.rarity ? TYPE_META[recipe.rarity] : null;
    var escapeHtml = getEscapeHtml();

    if (!meta) {
      return "";
    }

    return "<span class=\"" + meta.className + "\">" + escapeHtml(meta.label) + "</span>";
  }

  function renderIngredientRow(ingredient) {
    var escapeHtml = getEscapeHtml();

    return "<li class=\"task-row barter-ingredient\">" +
      "<div class=\"task-row__main\">" +
        renderIcon(getIngredientIconPath(ingredient), ingredient.name, "task-row__icon") +
        "<div class=\"task-row__content\">" +
          "<div class=\"task-row__header\">" +
            "<span class=\"task-row__title\">" + escapeHtml(ingredient.name) + "</span>" +
            "<span class=\"task-row__count\">x" + escapeHtml(String(ingredient.quantity)) + "</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</li>";
  }

  function shouldCollapseRecipe(recipeKey, query) {
    var hash = window.location.hash ? window.location.hash.slice(1) : "";

    if (Object.prototype.hasOwnProperty.call(collapsedRecipeKeys, recipeKey)) {
      return collapsedRecipeKeys[recipeKey];
    }

    if (hash === recipeKey) {
      return false;
    }

    if (query) {
      return false;
    }

    return true;
  }

  function renderRecipeCard(recipe, query) {
    var escapeHtml = getEscapeHtml();
    var ingredientLabel = recipe.ingredients.length + (recipe.ingredients.length === 1 ? " ingredient" : " ingredients");
    var isCollapsed = shouldCollapseRecipe(recipe.key, query);

    return "<details class=\"upgrade-card recipe-card\" id=\"" + recipe.key + "\"" + (isCollapsed ? "" : " open") + ">" +
      "<summary class=\"upgrade-card__summary\">" +
        "<div class=\"upgrade-card__summary-main\">" +
          "<div class=\"upgrade-card__title-row\">" +
            renderIcon(getRecipeIconPath(recipe), recipe.name, "upgrade-card__summary-icon") +
            "<h3 class=\"upgrade-card__title\">" + escapeHtml(recipe.name) + "</h3>" +
          "</div>" +
          "<div class=\"upgrade-card__chips\">" +
            "<span class=\"chip chip--accent\">" + escapeHtml(getFamilyLabel(recipe.family)) + "</span>" +
            "<span class=\"chip\">" + escapeHtml(ingredientLabel) + "</span>" +
            renderTypeChip(recipe) +
          "</div>" +
        "</div>" +
        "<span class=\"upgrade-card__collapse\" aria-hidden=\"true\">" +
          "<span class=\"upgrade-card__collapse-icon\" aria-hidden=\"true\"></span>" +
        "</span>" +
      "</summary>" +
      "<div class=\"upgrade-card__details\">" +
        "<ul class=\"task-list barter-ingredient-list\">" +
          recipe.ingredients.map(renderIngredientRow).join("") +
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

  function renderGroups(recipes, activeRegion, query) {
    var escapeHtml = getEscapeHtml();
    var regions = activeRegion === "all" ? REGION_ORDER : [activeRegion];

    if (!recipes.length) {
      return "<div class=\"empty-state\"><h3 class=\"empty-state__title\">No barter recipes match</h3><p class=\"empty-state__copy\">Try a broader search term like backpack, keycard, GPU, or imported tea.</p></div>";
    }

    return regions.map(function (region) {
      var regionRecipes = recipes.filter(function (recipe) {
        return recipe.region === region;
      });

      if (!regionRecipes.length) {
        return "";
      }

      return "<section class=\"group-card barter-region-group\">" +
        "<div class=\"group-card__header\">" +
          "<div>" +
            "<p class=\"group-card__title\">" + escapeHtml(getRegionLabel(region)) + "</p>" +
            "<p class=\"group-card__copy\">" + escapeHtml(REGION_META[region].copy) + "</p>" +
          "</div>" +
          "<span class=\"chip\">" + escapeHtml(regionRecipes.length + (regionRecipes.length === 1 ? " recipe" : " recipes")) + "</span>" +
        "</div>" +
        "<div class=\"upgrade-grid\">" +
          regionRecipes.map(function (recipe) {
            return renderRecipeCard(recipe, query);
          }).join("") +
        "</div>" +
      "</section>";
    }).join("");
  }

  function revealHashTarget() {
    var hash = window.location.hash ? window.location.hash.slice(1) : "";
    var target;

    if (!hash) {
      return;
    }

    target = document.getElementById(hash);

    if (target && target.matches(".recipe-card")) {
      collapsedRecipeKeys[hash] = false;
      target.open = true;
    }

    if (window.DMZApp && window.DMZApp.highlightHashTarget) {
      window.DMZApp.highlightHashTarget();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var heroSummary = document.getElementById("barterHeroSummary");
    var metrics = document.getElementById("barterMetrics");
    var filterMeta = document.getElementById("barterFilterMeta");
    var filters = document.getElementById("barterRegionFilters");
    var groups = document.getElementById("barterGroups");
    var searchInput = document.getElementById("barterSearch");
    var expandAllButton = document.getElementById("toggleBarterCardsButton");
    var activeRegion = "all";
    var query = "";

    if (!body || body.dataset.page !== "barter-recipes") {
      return;
    }

    function getVisibleCards() {
      return groups.querySelectorAll(".recipe-card[id]");
    }

    function areAllVisibleCardsExpanded() {
      var cards = getVisibleCards();

      return cards.length > 0 && Array.prototype.every.call(cards, function (card) {
        return card.open;
      });
    }

    function syncExpandAllButton() {
      var hasCards;
      var shouldCollapse;

      if (!expandAllButton) {
        return;
      }

      hasCards = getVisibleCards().length > 0;
      shouldCollapse = hasCards && areAllVisibleCardsExpanded();
      expandAllButton.disabled = !hasCards;
      expandAllButton.dataset.state = shouldCollapse ? "collapse" : "expand";
      expandAllButton.setAttribute("aria-label", (shouldCollapse ? "Collapse" : "Expand") + " all visible recipe cards");
      expandAllButton.title = shouldCollapse ? "Collapse all visible recipe cards" : "Expand all visible recipe cards";
    }

    function setAllVisibleCardsExpanded(shouldExpand) {
      Array.prototype.forEach.call(getVisibleCards(), function (card) {
        collapsedRecipeKeys[card.id] = !shouldExpand;
        card.open = shouldExpand;
      });

      syncExpandAllButton();
    }

    function render() {
      var visibleRecipes = getVisibleRecipes(activeRegion, query);
      var regionLabel = getRegionLabel(activeRegion);

      heroSummary.innerHTML = renderHeroSummary();
      metrics.innerHTML = renderMetricGrid(visibleRecipes);
      filters.innerHTML = renderRegionFilters(activeRegion, query);
      groups.innerHTML = renderGroups(visibleRecipes, activeRegion, query);
      filterMeta.textContent = query
        ? visibleRecipes.length + " matches in " + regionLabel + " for \"" + query + "\""
        : visibleRecipes.length + " recipes shown in " + regionLabel;

      Array.prototype.forEach.call(groups.querySelectorAll(".recipe-card"), function (card) {
        card.addEventListener("toggle", function () {
          collapsedRecipeKeys[card.id] = !card.open;
          syncExpandAllButton();
        });
      });

      syncExpandAllButton();
      revealHashTarget();
    }

    filters.addEventListener("click", function (event) {
      var button = event.target.closest("[data-region]");

      if (!button) {
        return;
      }

      activeRegion = button.dataset.region;
      render();
    });

    searchInput.addEventListener("input", function (event) {
      query = event.target.value;
      render();
    });

    if (expandAllButton) {
      expandAllButton.addEventListener("click", function () {
        setAllVisibleCardsExpanded(!areAllVisibleCardsExpanded());
      });
    }

    window.addEventListener("hashchange", function () {
      revealHashTarget();
      syncExpandAllButton();
    });

    render();
  });
}());