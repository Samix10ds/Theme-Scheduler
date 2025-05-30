// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto, impostazioni solo testo
// @version      3.1.0
// @author       Samix10ds
// ==/UserScript==

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let pluginSettings = {...defaultSettings};
let intervalId = null;

// Carica impostazioni
function loadSettings() {
    try {
        if (window.Vencord?.PluginStorage?.load) {
            pluginSettings = window.Vencord.PluginStorage.load("ThemeScheduler") || {...defaultSettings};
        } else {
            pluginSettings = JSON.parse(localStorage.getItem("ThemeSchedulerSettings") || "null") || {...defaultSettings};
        }
    } catch {
        pluginSettings = {...defaultSettings};
    }
}

// Salva impostazioni
function saveSettings() {
    if (window.Vencord?.PluginStorage?.save) {
        window.Vencord.PluginStorage.save("ThemeScheduler", pluginSettings);
    }
    localStorage.setItem("ThemeSchedulerSettings", JSON.stringify(pluginSettings));
}

// Validazione HH:MM
function isValidTime(str) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);
}

function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

function applyThemeByTime() {
    const ThemeStore =
        window?.BdApi?.findModuleByProps?.("theme", "setTheme") ||
        window?.Vencord?.Webpack?.findByProps?.("theme", "setTheme");
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

// Array impostazioni SOLO TESTO
const settings = [
    {
        type: "text",
        id: "lightThemeTime",
        name: "Orario tema chiaro (HH:MM)",
        note: "Quando attivare il tema chiaro (es: 07:00)",
        default: defaultSettings.lightThemeTime,
        get value() { return pluginSettings.lightThemeTime; },
        set value(val) {
            if (isValidTime(val)) {
                pluginSettings.lightThemeTime = val;
                saveSettings();
                applyThemeByTime();
            }
        }
    },
    {
        type: "text",
        id: "darkThemeTime",
        name: "Orario tema scuro (HH:MM)",
        note: "Quando attivare il tema scuro (es: 20:00)",
        default: defaultSettings.darkThemeTime,
        get value() { return pluginSettings.darkThemeTime; },
        set value(val) {
            if (isValidTime(val)) {
                pluginSettings.darkThemeTime = val;
                saveSettings();
                applyThemeByTime();
            }
        }
    },
    {
        type: "button",
        name: "Ripristina valori di default",
        color: "red",
        onClick: () => {
            pluginSettings = {...defaultSettings};
            saveSettings();
            applyThemeByTime();
        }
    }
];

export default {
    name: "Theme Scheduler",
    description: "Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto. Impostazioni solo testo, compatibile Vencord.",
    authors: [{ name: "Samix10ds" }],
    version: "3.1.0",

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
