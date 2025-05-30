// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto, con impostazioni grafiche
// @version      2.0.0
// @author       Samix_10
// ==/UserScript==

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let settings = { ...defaultSettings };
let intervalId = null;

// Utilità per salvare/caricare impostazioni (Vencord)
function loadSettings() {
    const data = Vencord.Plugins?.ThemeScheduler?.storage || {};
    settings = { ...defaultSettings, ...data };
}
function saveSettings() {
    if (!Vencord.Plugins.ThemeScheduler) Vencord.Plugins.ThemeScheduler = {};
    Vencord.Plugins.ThemeScheduler.storage = { ...settings };
}

// Parsing orario tipo "07:00"
function parseTime(str) {
    if (!str) return { h: 0, m: 0 };
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

// Cambia automatico tema
function applyThemeByTime() {
    const ThemeStore = Vencord.Webpack.findByProps("theme", "setTheme");
    if (!ThemeStore) return;

    const now = new Date();
    const { h: lightH, m: lightM } = parseTime(settings.lightThemeTime);
    const { h: darkH, m: darkM } = parseTime(settings.darkThemeTime);

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

// Pannello impostazioni grafico
function getSettingsPanel() {
    const React = Vencord.React;
    return React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 16, padding: 16 }
    },
        React.createElement("label", {}, "Orario tema chiaro"),
        React.createElement("input", {
            type: "time",
            value: settings.lightThemeTime,
            onChange: (e) => {
                settings.lightThemeTime = e.target.value;
                saveSettings();
                applyThemeByTime();
            }
        }),
        React.createElement("label", {}, "Orario tema scuro"),
        React.createElement("input", {
            type: "time",
            value: settings.darkThemeTime,
            onChange: (e) => {
                settings.darkThemeTime = e.target.value;
                saveSettings();
                applyThemeByTime();
            }
        }),
        React.createElement("div", { style: { color: "#888", fontSize: 13, marginTop: 12 } },
            "Il tema cambierà automaticamente agli orari scelti."
        )
    );
}

export default {
    name: "Theme Scheduler",
    description: "Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto.",
    authors: [{ name: "Samix10ds" }],
    version: "2.0.0",

    getSettingsPanel,

    onLoad() {
        loadSettings();
        applyThemeByTime();
    },
    onStart() {
        applyThemeByTime();
        intervalId = setInterval(applyThemeByTime, 60 * 1000);
    },
    onStop() {
        if (intervalId) clearInterval(intervalId);
    }
};
