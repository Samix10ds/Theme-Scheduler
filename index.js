// ==UserScript==
// @name         Theme Scheduler
// @description  Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto
// @version      1.1.0
// @author       Samix10ds
// @website      https://github.com/Samix10ds
// ==/UserScript==

import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";

// Trova il modulo che gestisce il tema
const ThemeStore = findByProps("theme", "setTheme");

const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

function applyThemeByTime(settings) {
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
    if (ThemeStore?.theme !== theme) {
        ThemeStore?.setTheme(theme);
        logger.log(`[Theme Scheduler] Tema applicato: ${theme}`);
    }
}

let intervalId = null;

export default {
    onLoad() {
        if (!storage.lightThemeTime) storage.lightThemeTime = defaultSettings.lightThemeTime;
        if (!storage.darkThemeTime) storage.darkThemeTime = defaultSettings.darkThemeTime;
        applyThemeByTime(storage);
    },
    onStart() {
        applyThemeByTime(storage);
        intervalId = setInterval(() => applyThemeByTime(storage), 60 * 1000);
    },
    onStop() {
        if (intervalId) clearInterval(intervalId);
    },
    settings: [
        {
            type: "text",
            id: "lightThemeTime",
            name: "Orario tema chiaro",
            note: "Quando attivare il tema chiaro (formato 24h, es: 07:00)",
            default: defaultSettings.lightThemeTime,
            onChange: (value) => { storage.lightThemeTime = value; }
        },
        {
            type: "text",
            id: "darkThemeTime",
            name: "Orario tema scuro",
            note: "Quando attivare il tema scuro (formato 24h, es: 20:00)",
            default: defaultSettings.darkThemeTime,
            onChange: (value) => { storage.darkThemeTime = value; }
        }
    ]
};
