// Tema claro u oscuro, compartido por la aplicación y sus páginas de información.
// Se carga en <head> sin defer para fijar el tema antes de pintar y no dar un
// destello claro. Sigue al del dispositivo mientras no se elija otra cosa; si se
// elige justo el que ya trae el dispositivo, se vuelve a seguirlo (como Sirena).
(function () {
  var STORAGE_KEY = "execonvert.dark";
  var system = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  // Iconos moon y sun de Lucide (ISC).
  var ICONS = {
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'
  };

  function stored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function systemDark() {
    return Boolean(system && system.matches);
  }

  function isDark() {
    return document.documentElement.dataset.theme === "dark";
  }

  function paintButtons() {
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i += 1) {
      var svg = buttons[i].querySelector("svg");
      if (svg) svg.innerHTML = isDark() ? ICONS.sun : ICONS.moon;
    }
  }

  function apply(dark, manual) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (manual) {
      try {
        if (dark === systemDark()) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, dark ? "1" : "0");
      } catch (error) {
        // Sin almacenamiento, la elección vale solo para esta visita.
      }
    }
    paintButtons();
  }

  var choice = stored();
  apply(choice === null ? systemDark() : choice === "1");

  if (system && system.addEventListener) {
    system.addEventListener("change", function (event) {
      if (stored() === null) apply(event.matches);
    });
  }

  // La aplicación pinta su cabecera después de cargar este archivo (antes de
  // DOMContentLoaded): se escucha en el documento para no depender de cuándo.
  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-theme-toggle]");
    if (button) apply(!isDark(), true);
  });

  document.addEventListener("DOMContentLoaded", paintButtons);
})();
