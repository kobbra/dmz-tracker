(function () {
  function ingredient(id, name, quantity, rarity, type) {
    return {
      id: id,
      name: name,
      quantity: quantity,
      rarity: rarity,
      type: type || null
    };
  }

  function recipe(region, id, name, family, rarity, unlock, ingredients) {
    return {
      key: region + "-" + id,
      id: id,
      name: name,
      region: region,
      family: family,
      rarity: rarity || null,
      unlock: unlock || null,
      ingredients: ingredients
    };
  }

  window.DMZ_BARTER_RECIPES = [
    recipe("al-mazrah", "three-plate-comms-vest", "3-Plate Comms Vest", "vests", "gold", "White Lotus rep 2 + eliminate Wheelson", [
      ingredient("encrypted-hard-drive", "Encrypted Hard Drive", 1, 3, "gold"),
      ingredient("battery", "Battery", 2, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("al-mazrah", "three-plate-stealth-vest", "3-Plate Stealth Vest", "vests", "gold", "White Lotus rep 2 + eliminate Sniper", [
      ingredient("encrypted-usb-stick", "Encrypted USB Stick", 1, 3, "gold"),
      ingredient("comic-book", "Comic Book", 1, 2),
      ingredient("game-console", "Game Console", 1, 1)
    ]),
    recipe("al-mazrah", "armor-box", "Armor Box", "utility", null, null, [
      ingredient("electrical-tape", "Electrical Tape", 1, 1),
      ingredient("screwdriver", "Screwdriver", 1, 1),
      ingredient("c4", "C4 Explosives", 1, 2)
    ]),
    recipe("al-mazrah", "console-devkit", "Console Devkit", "special", null, null, [
      ingredient("game-console", "Game Console", 3, 2),
      ingredient("golden-skull-of-al-bagra", "Golden Skull of Al Bagra", 1, 4),
      ingredient("nuclear-fuel-rod", "Nuclear Fuel Rod", 2, 2)
    ]),
    recipe("al-mazrah", "fortress-key", "Fortress Key", "keys", "blue", null, [
      ingredient("stronghold-keycard", "Stronghold Keycard", 6, 2, "blue")
    ]),
    recipe("al-mazrah", "grenade-launcher", "Grenade Launcher", "weapons", "red", "White Lotus rep 2 + eliminate Velikan 9 times", [
      ingredient("vintage-wine", "Vintage Wine", 2, 4, "gold"),
      ingredient("launcher", "Launcher Ammo", 3, 2),
      ingredient("cash", "Cash", 5000, 1, "gold")
    ]),
    recipe("al-mazrah", "munitions-box", "Munitions Box", "utility", null, null, [
      ingredient("imported-tea", "Imported Tea", 2, 1)
    ]),
    recipe("al-mazrah", "night-vision-goggles", "Night Vision Goggles", "utility", null, null, [
      ingredient("aged-wine", "Aged Wine", 1, 2),
      ingredient("emergency-rations", "Emergency Rations", 2, 1)
    ]),
    recipe("al-mazrah", "poppy-farmer-house-key", "Poppy Farmer House Key", "keys", "blue", null, [
      ingredient("radiation-blocker", "Radiation Blocker", 3, 2, "gold")
    ]),
    recipe("al-mazrah", "radiation-blocker", "Radiation Blocker", "utility", "gold", null, [
      ingredient("blow-torch", "Blow Torch", 1, 2)
    ]),
    recipe("al-mazrah", "rebreather", "Rebreather", "utility", null, null, [
      ingredient("hard-drive", "Hard Drive", 1, 1),
      ingredient("imported-tea", "Imported Tea", 1, 1)
    ]),
    recipe("al-mazrah", "revive-pistol", "Revive Pistol", "utility", "gold", "White Lotus rep 2 + eliminate Chemist", [
      ingredient("bandage", "Bandage", 1, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("al-mazrah", "scavenger-backpack", "Scavenger Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger", [
      ingredient("battery", "Battery", 1, 1),
      ingredient("canned-foods", "Canned Foods", 1, 1),
      ingredient("gun-cleaning-oil", "Gun Cleaning Oil", 2, 2)
    ]),
    recipe("al-mazrah", "secure-backpack", "Secure Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger 9 times", [
      ingredient("electric-drill", "Electric Drill", 2, 2),
      ingredient("gas-can", "Gas Can", 2, 1),
      ingredient("gold-skull", "Gold Skull", 1, 4, "gold")
    ]),
    recipe("al-mazrah", "skeleton-key", "Skeleton Key", "keys", "blue", "White Lotus rep 2 + eliminate Velikan in Building 21", [
      ingredient("gpu", "GPU", 1, 5, "gold"),
      ingredient("gold-bar", "Gold Bar", 2, 4, "gold")
    ]),
    recipe("al-mazrah", "tactical-camera", "Tactical Camera", "utility", null, null, [
      ingredient("car-battery", "Car Battery", 1, 1)
    ]),
    recipe("al-mazrah", "three-plate-medic-vest", "3-Plate Medic Vest", "vests", "gold", "White Lotus rep 2 + eliminate Pyro", [
      ingredient("bandage", "Bandage", 3, 1),
      ingredient("liquor", "Liquor", 1, 2),
      ingredient("watch", "Watch", 1, 1)
    ]),

    recipe("ashika-island", "three-plate-comms-vest", "3-Plate Comms Vest", "vests", "gold", "White Lotus rep 2 + eliminate Wheelson", [
      ingredient("encrypted-hard-drive", "Encrypted Hard Drive", 1, 3, "gold"),
      ingredient("battery", "Battery", 2, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("ashika-island", "armor-box", "Armor Box", "utility", null, null, [
      ingredient("electrical-tape", "Electrical Tape", 1, 1),
      ingredient("screwdriver", "Screwdriver", 1, 1),
      ingredient("c4", "C4 Explosives", 1, 2)
    ]),
    recipe("ashika-island", "assault-rifle", "Assault Rifle", "weapons", "red", null, [
      ingredient("first-edition-comic-book", "First Edition Comic Book", 1, 2, "gold"),
      ingredient("watch", "Watch", 1, 1),
      ingredient("game-console", "Game Console", 1, 1)
    ]),
    recipe("ashika-island", "durable-gas-mask", "Durable Gas Mask", "utility", "gold", null, [
      ingredient("toothpaste", "Toothpaste", 2, 1),
      ingredient("lighter", "Lighter", 1, 1)
    ]),
    recipe("ashika-island", "fortress-key", "Fortress Key", "keys", "blue", null, [
      ingredient("stronghold-keycard", "Stronghold Keycard", 3, 2, "blue"),
      ingredient("blow-torch", "Blow Torch", 1, 2),
      ingredient("gun-cleaning-oil", "Gun Cleaning Oil", 2, 2)
    ]),
    recipe("ashika-island", "gold-fish", "Gold Fish", "special", null, null, [
      ingredient("ashika-kitsune-original", "Ashika Kitsune Original", 1, 2),
      ingredient("dog-bank", "Purified Water", 1, 1)
    ]),
    recipe("ashika-island", "munitions-box", "Munitions Box", "utility", null, null, [
      ingredient("imported-tea", "Imported Tea", 2, 1)
    ]),
    recipe("ashika-island", "rebreather", "Rebreather", "utility", null, null, [
      ingredient("durable-gas-mask", "Durable Gas Mask", 1, 3),
      ingredient("gas-mask", "Gas Mask", 1, 2)
    ]),
    recipe("ashika-island", "revive-pistol", "Revive Pistol", "utility", "gold", "White Lotus rep 2 + eliminate Chemist", [
      ingredient("bandage", "Bandage", 1, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("ashika-island", "scavenger-backpack", "Scavenger Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger", [
      ingredient("battery", "Battery", 1, 1),
      ingredient("canned-foods", "Canned Foods", 1, 1),
      ingredient("gun-cleaning-oil", "Gun Cleaning Oil", 2, 2)
    ]),
    recipe("ashika-island", "secure-backpack", "Secure Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger 9 times", [
      ingredient("electric-drill", "Electric Drill", 2, 2),
      ingredient("gas-can", "Gas Can", 2, 1),
      ingredient("gold-skull", "Gold Skull", 1, 4, "gold")
    ]),
    recipe("ashika-island", "self-revive-kit", "Self-Revive Kit", "utility", null, null, [
      ingredient("bandage", "Bandage", 2, 1),
      ingredient("purified-water", "Purified Water", 1, 1)
    ]),
    recipe("ashika-island", "skeleton-key", "Skeleton Key", "keys", "blue", "White Lotus rep 2 + eliminate Velikan in Building 21", [
      ingredient("video-cassette-recorder", "Videocassette Recorder", 1, 2),
      ingredient("vintage-wine", "Vintage Wine", 1, 4, "gold"),
      ingredient("encrypted-hard-drive", "Encrypted Hard Drive", 1, 3, "gold")
    ]),
    recipe("ashika-island", "three-plate-medic-vest", "3-Plate Medic Vest", "vests", "gold", "White Lotus rep 2 + eliminate Pyro", [
      ingredient("bandage", "Bandage", 3, 1),
      ingredient("liquor", "Liquor", 1, 2),
      ingredient("watch", "Watch", 1, 1)
    ]),

    recipe("vondel", "three-plate-comms-vest", "3-Plate Comms Vest", "vests", "gold", "White Lotus rep 2 + eliminate Wheelson", [
      ingredient("encrypted-hard-drive", "Encrypted Hard Drive", 1, 3, "gold"),
      ingredient("battery", "Battery", 2, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("vondel", "armor-box", "Armor Box", "utility", null, null, [
      ingredient("electrical-tape", "Electrical Tape", 1, 1),
      ingredient("screwdriver", "Screwdriver", 1, 1),
      ingredient("c4", "C4 Explosives", 1, 2)
    ]),
    recipe("vondel", "assault-rifle", "Assault Rifle", "weapons", "red", null, [
      ingredient("first-edition-comic-book", "First Edition Comic Book", 1, 2, "gold"),
      ingredient("watch", "Watch", 1, 1),
      ingredient("game-console", "Game Console", 1, 1)
    ]),
    recipe("vondel", "durable-gas-mask", "Durable Gas Mask", "utility", "gold", null, [
      ingredient("toothpaste", "Toothpaste", 2, 1),
      ingredient("lighter", "Lighter", 1, 1)
    ]),
    recipe("vondel", "encrypted-key", "Encrypted Key", "keys", "gold", null, [
      ingredient("stronghold-keycard", "Stronghold Keycard", 1, 2, "blue"),
      ingredient("throwing-knife", "Throwing Knife", 1, 2),
      ingredient("inflatable-decoy", "Inflatable Decoy", 1, 2),
      ingredient("smoke-grenade", "Smoke Grenade", 1, 1)
    ]),
    recipe("vondel", "fortress-key", "Fortress Key", "keys", "blue", null, [
      ingredient("stronghold-keycard", "Stronghold Keycard", 3, 2, "blue"),
      ingredient("blow-torch", "Blow Torch", 1, 2),
      ingredient("gun-cleaning-oil", "Gun Cleaning Oil", 2, 2)
    ]),
    recipe("vondel", "munitions-box", "Munitions Box", "utility", null, null, [
      ingredient("imported-tea", "Imported Tea", 2, 1)
    ]),
    recipe("vondel", "rebreather", "Rebreather", "utility", null, null, [
      ingredient("durable-gas-mask", "Durable Gas Mask", 1, 3),
      ingredient("gas-mask", "Gas Mask", 1, 2)
    ]),
    recipe("vondel", "revive-pistol", "Revive Pistol", "utility", "gold", "White Lotus rep 2 + eliminate Chemist", [
      ingredient("bandage", "Bandage", 1, 1),
      ingredient("soothing-hand-cream", "Soothing Hand Cream", 1, 1)
    ]),
    recipe("vondel", "scavenger-backpack", "Scavenger Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger", [
      ingredient("battery", "Battery", 1, 1),
      ingredient("canned-foods", "Canned Foods", 1, 1),
      ingredient("gun-cleaning-oil", "Gun Cleaning Oil", 2, 2)
    ]),
    recipe("vondel", "secure-backpack", "Secure Backpack", "backpacks", "gold", "White Lotus rep 2 + eliminate Scavenger 9 times", [
      ingredient("electric-drill", "Electric Drill", 2, 2),
      ingredient("gas-can", "Gas Can", 2, 1),
      ingredient("gold-skull", "Gold Skull", 1, 4, "gold")
    ]),
    recipe("vondel", "self-revive-kit", "Self-Revive Kit", "utility", null, null, [
      ingredient("bandage", "Bandage", 2, 1),
      ingredient("purified-water", "Purified Water", 1, 1)
    ]),
    recipe("vondel", "skeleton-key", "Skeleton Key", "keys", "blue", "White Lotus rep 2 + eliminate Velikan in Building 21", [
      ingredient("three-plate-armor-vest", "3-Plate Armor Vest", 3, 3, "gold"),
      ingredient("self-revive-kit", "Self Revive Kit", 3, 2, "gold"),
      ingredient("gold-bar", "Gold Bar", 1, 4, "gold")
    ]),
    recipe("vondel", "three-plate-medic-vest", "3-Plate Medic Vest", "vests", "gold", "White Lotus rep 2 + eliminate Pyro", [
      ingredient("bandage", "Bandage", 3, 1),
      ingredient("liquor", "Liquor", 1, 2),
      ingredient("watch", "Watch", 1, 1)
    ])
  ];
}());