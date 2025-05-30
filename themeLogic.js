import { getSetting } from "./settings.js";

export function parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return { h, m };
}

export function applyThemeByTime() {
    const ThemeStore =
        window?.BdApi?.findModuleByProps?.("theme", "setTheme") ||
        window?.Vencord?.Webpack?.findByProps?.("theme", "setTheme");
    if (!ThemeStore || !ThemeStore.setTheme) return;

    const now = new Date();
    const { h: lightH, m: lightM } = parseTime(getSetting("lightThemeTime"));
    const { h: darkH, m: darkM } = parseTime(getSetting("darkThemeTime"));

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
