(() => {
  function createController({ document, window, HTMLElement }) {
    let appActionDialogState = null;

    function setAppActionDialogOpen(dialog, isOpen) {
      if (!dialog) {
        return;
      }

      dialog.hidden = !isOpen;
      document.body.classList.toggle("app-action-dialog-open", isOpen);
    }

    function closeAppActionDialog(result) {
      const state = appActionDialogState;
      const dialog = document.getElementById("app-action-dialog");

      appActionDialogState = null;
      setAppActionDialogOpen(dialog, false);

      if (state?.lastFocused && typeof state.lastFocused.focus === "function") {
        state.lastFocused.focus();
      }

      if (typeof state?.resolve === "function") {
        state.resolve(result);
      }
    }

    function ensureAppActionDialog() {
      let dialog = document.getElementById("app-action-dialog");

      if (dialog) {
        return dialog;
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
      <div id="app-action-dialog" class="app-action-dialog" hidden>
        <button class="app-action-dialog-backdrop" type="button" data-app-action-cancel aria-label="Cancel action"></button>
        <section class="app-action-dialog-card" role="dialog" aria-modal="true" aria-labelledby="app-action-dialog-title" aria-describedby="app-action-dialog-message">
          <form id="app-action-dialog-form" class="app-action-dialog-form" novalidate>
            <header class="app-action-dialog-head">
              <span id="app-action-dialog-kicker">Confirm action</span>
              <h2 id="app-action-dialog-title">Confirm action</h2>
            </header>
            <p id="app-action-dialog-message" class="app-action-dialog-message"></p>
            <p id="app-action-dialog-details" class="app-action-dialog-details" hidden></p>
            <label id="app-action-dialog-prompt" class="app-action-dialog-prompt" hidden>
              <span id="app-action-dialog-input-label">Value</span>
              <input id="app-action-dialog-input" type="text" autocomplete="off" />
              <small id="app-action-dialog-error"></small>
            </label>
            <div class="app-action-dialog-actions">
              <button id="app-action-dialog-cancel" class="app-action-dialog-cancel" type="button" data-app-action-cancel>Cancel</button>
              <button id="app-action-dialog-confirm" class="app-action-dialog-confirm" type="submit">Continue</button>
            </div>
          </form>
        </section>
      </div>
    `;
      document.body.appendChild(wrapper.firstElementChild);
      dialog = document.getElementById("app-action-dialog");

      dialog.addEventListener("click", (event) => {
        if (event.target.closest("[data-app-action-cancel]")) {
          closeAppActionDialog({ confirmed: false, value: null });
        }
      });

      dialog.querySelector("#app-action-dialog-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = dialog.querySelector("#app-action-dialog-input");
        const error = dialog.querySelector("#app-action-dialog-error");
        const isPrompt = dialog.dataset.mode === "prompt";
        const isRequired = dialog.dataset.required === "true";
        const value = input ? input.value.trim() : "";

        if (isPrompt && isRequired && !value) {
          if (error) {
            error.textContent = "This field is required.";
          }
          input?.focus();
          return;
        }

        closeAppActionDialog({ confirmed: true, value: isPrompt ? value : true });
      });

      dialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAppActionDialog({ confirmed: false, value: null });
        }
      });

      return dialog;
    }

    function openAppActionDialog(options = {}) {
      if (!document.body) {
        return Promise.resolve({ confirmed: false, value: null });
      }

      const dialog = ensureAppActionDialog();
      const mode = options.mode === "prompt" ? "prompt" : "confirm";
      const variant = ["danger", "success", "primary"].includes(options.variant) ? options.variant : "primary";
      const title = String(options.title || "Confirm action").trim();
      const message = String(options.message || "Do you want to continue?").trim();
      const details = String(options.details || "").trim();
      const confirmLabel = String(options.confirmLabel || "Continue").trim();
      const cancelLabel = String(options.cancelLabel || "Cancel").trim();
      const inputLabel = String(options.inputLabel || "Value").trim();
      const placeholder = String(options.placeholder || "").trim();
      const defaultValue = String(options.defaultValue || "").trim();

      if (appActionDialogState?.resolve) {
        closeAppActionDialog({ confirmed: false, value: null });
      }

      return new Promise((resolve) => {
        appActionDialogState = {
          resolve,
          lastFocused: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        };

        dialog.dataset.mode = mode;
        dialog.dataset.required = options.required ? "true" : "false";

        const kicker = dialog.querySelector("#app-action-dialog-kicker");
        const titleTarget = dialog.querySelector("#app-action-dialog-title");
        const messageTarget = dialog.querySelector("#app-action-dialog-message");
        const detailsTarget = dialog.querySelector("#app-action-dialog-details");
        const promptTarget = dialog.querySelector("#app-action-dialog-prompt");
        const inputLabelTarget = dialog.querySelector("#app-action-dialog-input-label");
        const input = dialog.querySelector("#app-action-dialog-input");
        const error = dialog.querySelector("#app-action-dialog-error");
        const cancelButton = dialog.querySelector("#app-action-dialog-cancel");
        const confirmButton = dialog.querySelector("#app-action-dialog-confirm");

        if (kicker) {
          kicker.textContent = mode === "prompt" ? "Input required" : "Confirm action";
        }
        if (titleTarget) {
          titleTarget.textContent = title;
        }
        if (messageTarget) {
          messageTarget.textContent = message;
        }
        if (detailsTarget) {
          detailsTarget.textContent = details;
          detailsTarget.hidden = !details;
        }
        if (promptTarget) {
          promptTarget.hidden = mode !== "prompt";
        }
        if (inputLabelTarget) {
          inputLabelTarget.textContent = inputLabel;
        }
        if (input) {
          input.value = defaultValue;
          input.placeholder = placeholder;
        }
        if (error) {
          error.textContent = "";
        }
        if (cancelButton) {
          cancelButton.textContent = cancelLabel;
        }
        if (confirmButton) {
          confirmButton.textContent = confirmLabel;
          confirmButton.className = `app-action-dialog-confirm is-${variant}`;
        }

        setAppActionDialogOpen(dialog, true);

        window.setTimeout(() => {
          if (mode === "prompt") {
            input?.focus();
            input?.select?.();
            return;
          }
          cancelButton?.focus();
        }, 0);
      });
    }

    async function showAppConfirm(options = {}) {
      const result = await openAppActionDialog({ ...options, mode: "confirm" });
      return Boolean(result.confirmed);
    }

    async function showAppPrompt(options = {}) {
      const result = await openAppActionDialog({ ...options, mode: "prompt" });
      return result.confirmed ? String(result.value || "") : null;
    }

    return { openAppActionDialog, showAppConfirm, showAppPrompt };
  }

  window.SchoolSphereActionDialogs = { createController };
})();
