(function () {
  const SESSION_KEYS = [
    "schoolsphere.session.transient.v1",
    "schoolsphere.session.persistent.v1",
  ];

  function parseJson(value, fallback = null) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function normalizeWorkspaceId(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || "public";
  }

  function getSessionSnapshot() {
    const transient = parseJson(sessionStorage.getItem(SESSION_KEYS[0]), null);
    if (transient) {
      return transient;
    }
    return parseJson(localStorage.getItem(SESSION_KEYS[1]), null);
  }

  function getWorkspaceId() {
    const session = getSessionSnapshot();
    return normalizeWorkspaceId(session?.workspaceId || session?.email || session?.userId || "public");
  }

  function buildRegistrationUrl(type) {
    const registrationType = String(type || "").toLowerCase() === "staff" ? "staff" : "student";
    const url = new URL("./self-register.html", window.location.href);
    url.searchParams.set("type", registrationType);
    url.searchParams.set("workspace", getWorkspaceId());
    return url.toString();
  }

  function setStatus(target, tone, message) {
    if (!target) {
      return;
    }

    target.hidden = !message;
    target.textContent = message || "";
    target.className = "auth-status";
    if (message) {
      target.classList.add(`auth-status--${tone || "info"}`);
    }
  }

  function copyTextFromInput(input) {
    const value = String(input?.value || "").trim();
    if (!value) {
      return Promise.reject(new Error("No registration link available."));
    }

    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(value);
    }

    input.focus();
    input.select();
    const copied = document.execCommand("copy");
    return copied
      ? Promise.resolve()
      : Promise.reject(new Error("Clipboard copy was blocked."));
  }

  function initRegistrationLinkCard({ type, inputId, copySelector, openSelector, statusId }) {
    const input = document.getElementById(inputId);
    const copyButton = document.querySelector(copySelector);
    const openLink = document.querySelector(openSelector);
    const status = document.getElementById(statusId);

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const refreshLink = () => {
      const url = buildRegistrationUrl(type);
      input.value = url;
      input.disabled = false;
      if (copyButton) {
        copyButton.disabled = false;
      }
      if (openLink) {
        openLink.setAttribute("href", url);
        openLink.setAttribute("target", "_blank");
        openLink.setAttribute("rel", "noopener noreferrer");
      }
      return url;
    };

    const showCopied = () => {
      const previousLabel = copyButton?.textContent || "Copy";
      if (copyButton) {
        copyButton.textContent = "Copied";
      }
      setStatus(status, "success", "Registration link copied.");
      window.setTimeout(() => {
        if (copyButton) {
          copyButton.textContent = previousLabel;
        }
        setStatus(status, "", "");
      }, 1800);
    };

    const handleCopy = async (event) => {
      event?.preventDefault?.();
      refreshLink();
      try {
        await copyTextFromInput(input);
        showCopied();
      } catch {
        input.focus();
        input.select();
        setStatus(status, "info", "Select and copy the link manually.");
      }
    };

    const handleOpen = (event) => {
      event?.preventDefault?.();
      const url = refreshLink();
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (opened) {
        setStatus(status, "success", "Registration form opened in a new tab.");
      } else {
        setStatus(status, "error", "Your browser blocked the new tab. Allow pop-ups for this site and try again.");
      }
    };

    refreshLink();
    input.addEventListener("click", handleCopy);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleOpen(event);
      }
    });
    copyButton?.addEventListener("click", handleCopy);
    openLink?.addEventListener("click", handleOpen);
    window.addEventListener("storage", refreshLink);
    window.setTimeout(refreshLink, 250);
    window.setTimeout(refreshLink, 1000);
  }

  function init() {
    initRegistrationLinkCard({
      type: "student",
      inputId: "student-self-registration-link",
      copySelector: "[data-student-self-registration-copy]",
      openSelector: "[data-student-self-registration-open]",
      statusId: "student-self-registration-status",
    });
    initRegistrationLinkCard({
      type: "staff",
      inputId: "staff-self-registration-link",
      copySelector: "[data-staff-self-registration-copy]",
      openSelector: "[data-staff-self-registration-open]",
      statusId: "staff-self-registration-status",
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
