(function () {
  function padNumber(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function formatBackupDate(value) {
    var timestamp = new Date(value);

    if (Number.isNaN(timestamp.getTime())) {
      return "";
    }

    return timestamp.toLocaleString();
  }

  function getBackupFileName() {
    var now = new Date();

    return [
      "dmz-tracker-backup",
      now.getFullYear(),
      padNumber(now.getMonth() + 1),
      padNumber(now.getDate())
    ].join("-") + ".json";
  }

  function buildBackupPayload() {
    return {
      app: "dmz-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      state: window.DMZStorage.getState()
    };
  }

  function downloadBackupFile(fileName, payload) {
    var blob = new window.Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var downloadUrl = window.URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      window.URL.revokeObjectURL(downloadUrl);
    }, 0);
  }

  function summarizeState(state) {
    var favoriteCount = Array.isArray(state.favoriteOrder)
      ? state.favoriteOrder.filter(function (favoriteRef) {
          return typeof favoriteRef === "string" && favoriteRef.indexOf("note:") !== 0;
        }).length
      : (Array.isArray(state.favoriteUpgradeIds) ? state.favoriteUpgradeIds.length : 0) +
        (Array.isArray(state.favoriteRecipeKeys) ? state.favoriteRecipeKeys.length : 0);
    var hasStickyNote = Boolean(
      (state.stickyNote && state.stickyNote.content) ||
      (state.favoritesLayout && state.favoritesLayout.showStickyNote)
    );

    return {
      trackedTasks: Object.keys(state.taskCounts || {}).length,
      favoriteCount: favoriteCount,
      hasStickyNote: hasStickyNote
    };
  }

  function formatCount(value, singularLabel, pluralLabel) {
    return value + " " + (value === 1 ? singularLabel : pluralLabel);
  }

  function parseBackupPayload(text) {
    var parsed;
    var nextState;
    var hasTaskCounts;
    var hasFavorites;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return { error: "This backup file is not valid JSON." };
    }

    if (!parsed || typeof parsed !== "object") {
      return { error: "This backup file must contain a JSON object." };
    }

    nextState = parsed.state && typeof parsed.state === "object" ? parsed.state : parsed;
    hasTaskCounts = Object.prototype.hasOwnProperty.call(nextState, "taskCounts");
    hasFavorites = Object.prototype.hasOwnProperty.call(nextState, "favoriteUpgradeIds") ||
      Object.prototype.hasOwnProperty.call(nextState, "favoriteRecipeKeys") ||
      Object.prototype.hasOwnProperty.call(nextState, "favoriteOrder");

    if (!hasTaskCounts || !hasFavorites) {
      return { error: "This file does not look like a DMZ Tracker backup." };
    }

    return {
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : "",
      state: nextState
    };
  }

  function createSettingsDialog() {
    var dialog = document.createElement("dialog");

    dialog.id = "settingsDialog";
    dialog.className = "settings-dialog";
    dialog.hidden = true;
    dialog.setAttribute("aria-labelledby", "settingsDialogTitle");
    dialog.innerHTML = "" +
      '<div class="settings-dialog__panel">' +
        '<div class="settings-dialog__header">' +
          '<div>' +
            '<p class="settings-dialog__eyebrow">Progress settings</p>' +
            '<h2 id="settingsDialogTitle" class="settings-dialog__title">Backup, restore, and reset</h2>' +
          '</div>' +
          '<button class="settings-dialog__close" type="button" data-action="close-settings" aria-label="Close progress settings">' +
            '<span aria-hidden="true">&times;</span>' +
          '</button>' +
        '</div>' +
        '<p class="settings-dialog__copy">Manage the DMZ progress saved in this browser. Backups and resets include tracked task counts, favorites, the fullscreen sticky note, and the Crown visibility preference.</p>' +
        '<div class="settings-dialog__summary" aria-label="Current saved progress summary">' +
          '<span id="settingsSnapshotTasks" class="settings-dialog__stat"></span>' +
          '<span id="settingsSnapshotFavorites" class="settings-dialog__stat"></span>' +
        '</div>' +
        '<p id="settingsFeedback" class="settings-dialog__feedback" hidden></p>' +
        '<div class="settings-dialog__grid">' +
          '<section class="settings-dialog__card">' +
            '<p class="settings-dialog__card-title">Backup progress</p>' +
            '<p class="settings-dialog__card-copy">Download a JSON backup of the progress, favorites, sticky note, and visibility settings stored in this browser.</p>' +
            '<div class="settings-dialog__action-row">' +
              '<button class="button button--primary" type="button" data-action="download-backup">Download backup</button>' +
            '</div>' +
          '</section>' +
          '<section class="settings-dialog__card">' +
            '<p class="settings-dialog__card-title">Crown upgrades</p>' +
            '<p class="settings-dialog__card-copy">Show or hide Crown faction upgrades across categories, search, and favorites without deleting saved progress.</p>' +
            '<label class="layout-settings-dialog__toggle">' +
              '<input id="settingsCrownUpgradesToggle" class="layout-settings-dialog__checkbox" type="checkbox">' +
              '<span class="layout-settings-dialog__toggle-copy">' +
                '<span class="layout-settings-dialog__label">Show Crown upgrades</span>' +
                '<span class="layout-settings-dialog__hint">Turn this off to hide Crown cards while keeping their saved counts for later.</span>' +
              '</span>' +
            '</label>' +
          '</section>' +
          '<section class="settings-dialog__card">' +
            '<p class="settings-dialog__card-title">Restore progress</p>' +
            '<p class="settings-dialog__card-copy">Choose a JSON backup file to replace the current saved progress, favorites, sticky note, and visibility settings.</p>' +
            '<input id="settingsRestoreInput" class="visually-hidden" type="file" accept=".json,application/json">' +
            '<div class="settings-dialog__action-row">' +
              '<button class="button button--ghost" type="button" data-action="choose-restore">Choose backup file</button>' +
              '<span id="settingsRestoreMeta" class="settings-dialog__meta">No file selected</span>' +
            '</div>' +
            '<div id="settingsRestoreConfirm" class="settings-dialog__confirm" hidden>' +
              '<p id="settingsRestoreConfirmText" class="settings-dialog__confirm-copy"></p>' +
              '<div class="settings-dialog__action-row settings-dialog__action-row--stack">' +
                '<button class="button button--primary button--small" type="button" data-action="confirm-restore">Restore backup</button>' +
                '<button class="button button--ghost button--small" type="button" data-action="cancel-restore">Cancel</button>' +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="settings-dialog__card settings-dialog__card--danger">' +
            '<p class="settings-dialog__card-title">Reset progress</p>' +
            '<p class="settings-dialog__card-copy">Clear every saved task count, favorite, sticky note, and visibility setting from this browser.</p>' +
            '<div class="settings-dialog__action-row">' +
              '<button class="button button--ghost settings-dialog__button--danger" type="button" data-action="request-reset">Reset all progress</button>' +
            '</div>' +
            '<div id="settingsResetConfirm" class="settings-dialog__confirm settings-dialog__confirm--danger" hidden>' +
              '<p class="settings-dialog__confirm-copy">This will remove all tracked progress, favorites, sticky note content, and visibility settings saved in this browser.</p>' +
              '<div class="settings-dialog__action-row settings-dialog__action-row--stack">' +
                '<button class="button button--danger button--small" type="button" data-action="confirm-reset">Confirm reset</button>' +
                '<button class="button button--ghost button--small" type="button" data-action="cancel-reset">Cancel</button>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';

    document.body.appendChild(dialog);
    return dialog;
  }

  function initSettings(trigger) {
    var dialog = createSettingsDialog();
    var feedback = dialog.querySelector("#settingsFeedback");
    var snapshotTasks = dialog.querySelector("#settingsSnapshotTasks");
    var snapshotFavorites = dialog.querySelector("#settingsSnapshotFavorites");
    var crownUpgradesToggle = dialog.querySelector("#settingsCrownUpgradesToggle");
    var restoreInput = dialog.querySelector("#settingsRestoreInput");
    var restoreMeta = dialog.querySelector("#settingsRestoreMeta");
    var restoreConfirm = dialog.querySelector("#settingsRestoreConfirm");
    var restoreConfirmText = dialog.querySelector("#settingsRestoreConfirmText");
    var resetConfirm = dialog.querySelector("#settingsResetConfirm");
    var pendingRestoreState = null;
    var previousFocus = null;

    function setFeedback(message, tone) {
      feedback.className = "settings-dialog__feedback";

      if (!message) {
        feedback.hidden = true;
        feedback.textContent = "";
        return;
      }

      if (tone) {
        feedback.className += " is-" + tone;
      }

      feedback.hidden = false;
      feedback.textContent = message;
    }

    function renderSnapshot() {
      var summary = summarizeState(window.DMZStorage.getState());

      snapshotTasks.textContent = formatCount(summary.trackedTasks, "tracked task", "tracked tasks");
      snapshotFavorites.textContent = formatCount(summary.favoriteCount, "favorite saved", "favorites saved") + (summary.hasStickyNote ? " + sticky note" : "");

      if (crownUpgradesToggle) {
        crownUpgradesToggle.checked = Boolean(window.DMZStorage.getUpgradeVisibilitySettings().showCrownUpgrades);
      }
    }

    function clearRestoreState() {
      pendingRestoreState = null;
      restoreInput.value = "";
      restoreMeta.textContent = "No file selected";
      restoreConfirm.hidden = true;
      restoreConfirmText.textContent = "";
    }

    function clearResetState() {
      resetConfirm.hidden = true;
    }

    function resetDialogState() {
      clearRestoreState();
      clearResetState();
      setFeedback("", "");
    }

    function closeDialog() {
      resetDialogState();
      document.body.classList.remove("has-modal-open");

      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        dialog.hidden = true;
      }

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    }

    function openDialog() {
      var storageStatus = window.DMZStorage.getStatus();

      if (dialog.open) {
        return;
      }

      previousFocus = document.activeElement;
      resetDialogState();
      renderSnapshot();
      dialog.hidden = false;
      document.body.classList.add("has-modal-open");

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "open");
      }

      if (!storageStatus.available) {
        setFeedback("Local storage is currently unavailable. Restore and reset changes may only last until this tab closes.", "warning");
      }
    }

    function queueRestore(file, parsed) {
      var summary = summarizeState(parsed.state);
      var parts = [];
      var exportedAt = formatBackupDate(parsed.exportedAt);

      pendingRestoreState = parsed.state;
      restoreMeta.textContent = file.name + " selected";
      parts.push("Replace current browser data with " + summary.trackedTasks + " tracked tasks and " + summary.favoriteCount + " favorites");

      if (exportedAt) {
        parts.push("from " + exportedAt);
      }

      restoreConfirmText.textContent = parts.join(" ") + "?";
      restoreConfirm.hidden = false;
    }

    trigger.addEventListener("click", openDialog);

    if (crownUpgradesToggle) {
      crownUpgradesToggle.addEventListener("change", function () {
        window.DMZStorage.setUpgradeVisibilitySettings({
          showCrownUpgrades: crownUpgradesToggle.checked
        });
      });
    }

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeDialog();
    });

    dialog.addEventListener("click", function (event) {
      var action = event.target.closest("[data-action]");
      var backupFileName;

      if (event.target === dialog) {
        closeDialog();
        return;
      }

      if (!action) {
        return;
      }

      if (action.dataset.action === "close-settings") {
        closeDialog();
        return;
      }

      if (action.dataset.action === "download-backup") {
        backupFileName = getBackupFileName();
        downloadBackupFile(backupFileName, buildBackupPayload());
        setFeedback("Backup downloaded as " + backupFileName + ".", "success");
        return;
      }

      if (action.dataset.action === "choose-restore") {
        clearResetState();
        setFeedback("", "");
        restoreInput.value = "";
        restoreInput.click();
        return;
      }

      if (action.dataset.action === "cancel-restore") {
        clearRestoreState();
        return;
      }

      if (action.dataset.action === "confirm-restore") {
        if (!pendingRestoreState) {
          setFeedback("Choose a valid backup file before restoring.", "error");
          return;
        }

        window.DMZStorage.replaceState(pendingRestoreState);
        closeDialog();
        return;
      }

      if (action.dataset.action === "request-reset") {
        clearRestoreState();
        clearResetState();
        setFeedback("", "");
        resetConfirm.hidden = false;
        return;
      }

      if (action.dataset.action === "cancel-reset") {
        clearResetState();
        return;
      }

      if (action.dataset.action === "confirm-reset") {
        window.DMZStorage.reset();
        closeDialog();
      }
    });

    restoreInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      var reader;

      clearResetState();
      setFeedback("", "");

      if (!file) {
        return;
      }

      if (typeof window.FileReader !== "function") {
        setFeedback("This browser cannot read backup files.", "error");
        clearRestoreState();
        return;
      }

      restoreMeta.textContent = "Reading " + file.name + "...";
      restoreConfirm.hidden = true;
      reader = new window.FileReader();
      reader.addEventListener("load", function () {
        var parsed = parseBackupPayload(String(reader.result || ""));

        if (parsed.error) {
          setFeedback(parsed.error, "error");
          clearRestoreState();
          return;
        }

        queueRestore(file, parsed);
      });
      reader.addEventListener("error", function () {
        setFeedback("The selected backup file could not be read.", "error");
        clearRestoreState();
      });
      reader.readAsText(file);
    });

    window.DMZStorage.subscribe(renderSnapshot);
    renderSnapshot();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var settingsButton;

    if (!window.DMZStorage) {
      return;
    }

    settingsButton = document.getElementById("settingsButton");

    if (!settingsButton) {
      return;
    }

    initSettings(settingsButton);
  });
}());