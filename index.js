// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto, impostazioni solo via testo
// @version      2.3.1
// @author       Samix10ds
// ==/UserScript==

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let pluginSettings = { ...defaultSettings };
let intervalId = null;

// Caricamento e salvataggio impostazioni tramite Vencord (se disponibile), fallback su localStorage
function loadSettings() {
    try {
        pluginSettings = Vencord?.PluginStorage?.load?.("ThemeScheduler") || JSON.parse(localStorage.getItem("ThemeSchedulerSettings") || "null") || { ...defaultSettings };
    } catch {
        pluginSettings = { ...defaultSettings };
    }
}
function saveSettings() {
    if (Vencord?.PluginStorage?.save) {
        Vencord.PluginStorage.save("ThemeScheduler", pluginSettings);
    }
    localStorage.setItem("ThemeSchedulerSettings", JSON.stringify(pluginSettings));
}

function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

function applyThemeByTime() {
    const ThemeStore = window?.BdApi?.findModuleByProps?.("theme", "setTheme") || window?.Vencord?.Webpack?.findByProps?.("theme", "setTheme");
    if (!ThemeStore || !ThemeStore.setTheme) return;

    const now = new Date();
    const { h: lightH, m: lightM } = parseTime(pluginSettings.lightThemeTime);
    const { h: darkH, m: darkM } = parseTime(pluginSettings.darkThemeTime);

    const lightMinutes = lightH * 60 + lightM;
    const darkMinutes = darkH * 60 + darkM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let theme = "dark";
    if (lightMinutes < darkMinutes) {
        if (nowMinutes >= lightMinutes && nowMinutes < darkMinutes) theme = "light";
    } else {
        if (nowMinutes >= lightMinutes || nowMinutes < darkMinutes) theme = "light";
    }
    if (ThemeStore.theme !== theme) ThemeStore.setTheme(theme);
}

// Impostazioni solo testo
const settings = [
    {
        type: "text",
        id: "lightThemeTime",
        name: "Orario tema chiaro (formato HH:MM, es: 07:00)",
        note: "Orario in cui attivare il tema chiaro",
        default: defaultSettings.lightThemeTime,
        get value() { return pluginSettings.lightThemeTime; },
        set value(val) {
            pluginSettings.lightThemeTime = val;
            saveSettings();
            applyThemeByTime();
        }
    },
    {
        type: "text",
        id: "darkThemeTime",
        name: "Orario tema scuro (formato HH:MM, es: 20:00)",
        note: "Orario in cui attivare il tema scuro",
        default: defaultSettings.darkThemeTime,
        get value() { return pluginSettings.darkThemeTime; },
        set value(val) {
            pluginSettings.darkThemeTime = val;
            saveSettings();
            applyThemeByTime();
        }
    }
];

export default {
    name: "Theme Scheduler",
    description: "Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto, impostazioni solo via testo.",
    authors: [{ name: "Samix10ds" }],
    version: "2.3.1",

    settings,

    onLoad() {
        loadSettings();
        applyThemeByTime();
    },
    onStart() {
        loadSettings();
        applyThemeByTime();
        intervalId = setInterval(applyThemeByTime, 60 * 1000);
    },
    onStop() {
        if (intervalId) clearInterval(intervalId);
    }
};
