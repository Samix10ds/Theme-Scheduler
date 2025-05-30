export const defaultSettings = {
    lightThemeTime: "07:00",
    darkThemeTime: "20:00"
};

let pluginSettings = { ...defaultSettings };

export function loadSettings() {
    try {
        if (window.Vencord?.PluginStorage?.load) {
            pluginSettings = window.Vencord.PluginStorage.load("ThemeScheduler") || { ...defaultSettings };
        } else {
            pluginSettings = JSON.parse(localStorage.getItem("ThemeSchedulerSettings") || "null") || { ...defaultSettings };
        }
    } catch {
        pluginSettings = { ...defaultSettings };
    }
    return pluginSettings;
}

export function saveSettings() {
    if (window.Vencord?.PluginStorage?.save) {
        window.Vencord.PluginStorage.save("ThemeScheduler", pluginSettings);
    }
    localStorage.setItem("ThemeSchedulerSettings", JSON.stringify(pluginSettings));
}

export function setSetting(key, value) {
    pluginSettings[key] = value;
    saveSettings();
}

export function getSetting(key) {
    return pluginSettings[key];
}
