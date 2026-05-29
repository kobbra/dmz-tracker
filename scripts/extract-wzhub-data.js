var categoryPages = [
  {
    slug: "stash",
    url: "https://wzhub.gg/dmz-upgrades-tracker/stash",
    title: "Stash",
    summary: "Wallet capacity, mission items, and key stash expansions."
  },
  {
    slug: "weapons-locker",
    url: "https://wzhub.gg/dmz-upgrades-tracker/weapons-locker",
    title: "Weapons Locker",
    summary: "Insured slots, cooldown reductions, and contraband stash expansions."
  },
  {
    slug: "bounty-board",
    url: "https://wzhub.gg/dmz-upgrades-tracker/bounty-board",
    title: "Bounty Board",
    summary: "Barter recipes, killstreak access, and utility unlocks."
  },
  {
    slug: "communications",
    url: "https://wzhub.gg/dmz-upgrades-tracker/communications",
    title: "Communications",
    summary: "Urgent mission unlocks and faction mission expansions."
  },
  {
    slug: "equipment",
    url: "https://wzhub.gg/dmz-upgrades-tracker/equipment",
    title: "Equipment",
    summary: "Persistent gear and deployment equipment unlocks."
  }
];

var fso = new ActiveXObject("Scripting.FileSystemObject");
var shell = new ActiveXObject("WScript.Shell");
var scriptDir = fso.GetParentFolderName(WScript.ScriptFullName);
var repoRoot = fso.GetParentFolderName(scriptDir);
var outputPath = fso.BuildPath(repoRoot, "assets\\data\\dmz-upgrades.js");

function fetchText(url) {
  var request = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
  request.Open("GET", url, false);
  request.SetRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  request.Send();

  if (request.Status !== 200) {
    throw new Error("Request failed for " + url + " with status " + request.Status);
  }

  return request.ResponseText;
}

function extractNuxtScript(html, url) {
  var marker = "window.__NUXT__=";
  var start = html.indexOf(marker);
  var end;

  if (start === -1) {
    throw new Error("Could not find tracker data in " + url);
  }

  end = html.indexOf("</script>", start);

  if (end === -1) {
    throw new Error("Could not find the end of the data script in " + url);
  }

  return html.substring(start, end);
}

function simplifyItems(page, nuxtData) {
  var items = nuxtData.data[0].items;
  var keys = [];
  var key;
  var upgrades = [];
  var index;
  var item;
  var taskIndex;
  var tasks;
  var totalTasks = 0;

  for (key in items) {
    if (items.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  keys.sort(function (left, right) {
    return items[left].id - items[right].id;
  });

  for (index = 0; index < keys.length; index += 1) {
    item = items[keys[index]];
    tasks = [];

    for (taskIndex = 0; taskIndex < item.tasks.length; taskIndex += 1) {
      tasks.push({
        id: page.slug + "-task-" + item.tasks[taskIndex].id,
        title: item.tasks[taskIndex].title,
        totalCount: item.tasks[taskIndex].total_count,
        iconPath: item.tasks[taskIndex].icon_path || ""
      });
      totalTasks += 1;
    }

    upgrades.push({
      id: page.slug + "-upgrade-" + item.id,
      title: item.title,
      iconPath: item.icon_path || "",
      unlock: item.unlock,
      tasks: tasks,
      reward: item.rewards ? item.rewards.title : "",
      rewardIconPath: item.rewards && item.rewards.icon_path ? item.rewards.icon_path : ""
    });
  }

  return {
    slug: page.slug,
    title: page.title,
    summary: page.summary,
    totalUpgrades: upgrades.length,
    totalTasks: totalTasks,
    upgrades: upgrades
  };
}

function escapeString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function repeatString(value, count) {
  var result = "";
  var index;

  for (index = 0; index < count; index += 1) {
    result += value;
  }

  return result;
}

function stringifyValue(value, depth) {
  var indent = repeatString("  ", depth);
  var childIndent = repeatString("  ", depth + 1);
  var parts = [];
  var index;
  var key;
  var keys;

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return '"' + escapeString(value) + '"';
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Array) {
    if (!value.length) {
      return "[]";
    }

    for (index = 0; index < value.length; index += 1) {
      parts.push(childIndent + stringifyValue(value[index], depth + 1));
    }

    return "[\n" + parts.join(",\n") + "\n" + indent + "]";
  }

  keys = [];

  for (key in value) {
    if (value.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  if (!keys.length) {
    return "{}";
  }

  for (index = 0; index < keys.length; index += 1) {
    key = keys[index];
    parts.push(childIndent + '"' + escapeString(key) + '": ' + stringifyValue(value[key], depth + 1));
  }

  return "{\n" + parts.join(",\n") + "\n" + indent + "}";
}

function toPrettyJson(value) {
  return stringifyValue(value, 0);
}

function writeFile(path, contents) {
  var folder = fso.GetParentFolderName(path);
  var stream;

  ensureFolder(folder);

  stream = fso.CreateTextFile(path, true, false);
  stream.Write(contents);
  stream.Close();
}

function ensureFolder(path) {
  var parent;

  if (!path || fso.FolderExists(path)) {
    return;
  }

  parent = fso.GetParentFolderName(path);

  if (parent && !fso.FolderExists(parent)) {
    ensureFolder(parent);
  }

  if (!fso.FolderExists(path)) {
    fso.CreateFolder(path);
  }
}

function main() {
  var dataset = [];
  var pageIndex;
  var html;
  var script;
  var page;
  var window;
  var contents;

  for (pageIndex = 0; pageIndex < categoryPages.length; pageIndex += 1) {
    page = categoryPages[pageIndex];
    html = fetchText(page.url);
    script = extractNuxtScript(html, page.url);
    window = {};
    eval(script);
    dataset.push(simplifyItems(page, window.__NUXT__));
  }

  contents = "window.DMZ_UPGRADES = " + toPrettyJson(dataset) + ";\n";
  writeFile(outputPath, contents);
  WScript.Echo("Wrote " + outputPath + " with " + dataset.length + " categories.");
}

main();