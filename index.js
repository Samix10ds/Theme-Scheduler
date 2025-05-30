import { defaultSettings, loadSettings, setSetting, getSetting } from "./settings.js";
import { applyThemeByTime } from "./themeLogic.js";

// Validazione input orario HH:MM
function isValidTime(str) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);
}

// Impostazioni Vencord - SOLO TESTO
const settings = [
    {
        type: "text",
        id: "lightThemeTime",
        name: "Orario tema chiaro (formato HH:MM, es: 07:00)",
        note: "Orario in cui attivare il tema chiaro",
        default: defaultSettings.lightThemeTime,
        get value() { return getSetting("lightThemeTime"); },
        set value(val) {
            if (isValidTime(val)) {
                setSetting("lightThemeTime", val);
                applyThemeByTime();
            }
        }
    },
    {
        type: "text",
        id: "darkThemeTime",
        name: "Orario tema scuro (formato HH:MM, es: 20:00)",
        note: "Orario in cui attivare il tema scuro",
        default: defaultSettings.darkThemeTime,
        get value() { return getSetting("darkThemeTime"); },
        set value(val) {
            if (isValidTime(val)) {
                setSetting("darkThemeTime", val);
                applyThemeByTime();
            }
        }
    }
];

let intervalId = null;

export default {
    name: "Theme Scheduler",
    description: "Cambia automaticamente il tema Discord (chiaro/scuro) in base all'orario scelto (impostazioni solo testo).",
    authors: [{ name: "Samix10ds" }],
    version: "3.0.0",

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
