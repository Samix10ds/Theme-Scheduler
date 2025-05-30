// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto, con impostazioni grafiche
// @version      2.1.0
// @author       Samix10ds
// ==/UserScript==

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let settings = { ...defaultSettings };
let intervalId = null;

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem("ThemeSchedulerSettings") || "{}");
        settings = { ...defaultSettings, ...s };
    } catch {
        settings = { ...defaultSettings };
    }
}
function saveSettings() {
    localStorage.setItem("ThemeSchedulerSettings", JSON.stringify(settings));
}

function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

function applyThemeByTime() {
    const ThemeStore = window?.Vencord?.Webpack?.findByProps("theme", "setTheme") 
        || (window?.webpackChunkdiscord_app?.push([
            [Symbol()], {}, e => { m = []; for (let i in e.c) m.push(e.c[i]); return m }
        ]), window?.webpackChunkdiscord_app?.pop());
    if (!ThemeStore || !ThemeStore.setTheme) return;

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

// IMPOSTAZIONI GRAFICHE
function settingsPanel() {
    const React = window.vendetta?.metro?.React || window.React;
    return React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 16, padding: 16, maxWidth: 320 }
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
    version: "2.1.0",

    settings: settingsPanel,

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
