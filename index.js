// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto
// @version      1.4.0
// @author       Samix_10
// @website      https://github.com/Samix10ds/Theme-Scheduler.git
// ==/UserScript==

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let settings = BdApi.loadData("ThemeScheduler", "settings") || { ...defaultSettings };
let intervalId = null;

function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

function applyThemeByTime() {
    const themeSettings = BdApi.findModuleByProps("theme", "setTheme");
    if (!themeSettings) return;

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
    if (themeSettings.theme !== theme) {
        themeSettings.setTheme(theme);
        console.log(`[Theme Scheduler] Tema applicato: ${theme}`);
    }
}

function saveSettings() {
    BdApi.saveData("ThemeScheduler", "settings", settings);
}

// Settings panel con time picker grafico
function getSettingsPanel() {
    const React = BdApi.React;
    return React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 16, padding: 16, maxWidth: 350 }
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
            "Il tema cambierà automaticamente in base agli orari impostati (usa il selettore orario sopra)."
        )
    );
}

export default {
    name: "Theme Scheduler",
    description: "Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto",
    authors: [{ name: "Samix10ds", github_username: "Samix10ds" }],
    version: "1.4.0",

    getSettingsPanel,

    onLoad() {
        settings = BdApi.loadData("ThemeScheduler", "settings") || { ...defaultSettings };
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
