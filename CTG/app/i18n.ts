import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      settingsTitle: "Welcome to the settings page",
      darkMode: "Dark Mode",
      textSize: "Text Size",
      language: "Language",
      logout: "Logout",
      deleteAccount: "Delete Account",
      warningText: "Warning: This will permanently delete your account.",
      warningTextBold: "THIS ACTION CAN NOT BE UNDONE.",
      cancel: "Cancel",
      englishLabel: "English",
      spanishLabel: "Español",
    },
  },
  es: {
    translation: {
      welcome: "Bienvenido",
      settingsTitle: "Bienvenido a la página de configuración",
      darkMode: "Modo oscuro",
      textSize: "Tamaño de texto",
      language: "Idioma",
      logout: "Cerrar sesión",
      deleteAccount: "Eliminar cuenta",
      warningText: "Advertencia: Esto eliminará permanentemente su cuenta.",
      warningTextBold: "ESTA ACCIÓN NO SE PUEDE DESHACER.",
      cancel: "Cancelar",
      englishLabel: "Inglés",
      spanishLabel: "Español",
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    nonExplicitSupportedLngs: true, // handle e.g. "en-US" as "en"
    load: "languageOnly",           // use only the language part
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
