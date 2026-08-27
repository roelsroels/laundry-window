(() => {
  "use strict";

  const storageKey = "laundry-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const listeners = [];
  let preference = null;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") preference = saved;
  } catch (_) {}

  const currentTheme = () => preference || (systemTheme.matches ? "dark" : "light");

  function apply() {
    const theme = currentTheme();
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0f1815" : "#174e3e");
    listeners.forEach((listener) => listener(theme));
  }

  function toggle() {
    preference = currentTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem(storageKey, preference); } catch (_) {}
    apply();
  }

  const systemChanged = () => { if (!preference) apply(); };
  if (systemTheme.addEventListener) systemTheme.addEventListener("change", systemChanged);
  else systemTheme.addListener(systemChanged);

  apply();

  window.LaundryTheme = Object.freeze({
    toggle,
    onChange: (listener) => listeners.push(listener),
    get current() { return currentTheme(); },
    get followsSystem() { return preference === null; }
  });
})();
