import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector"
import en_translation from './en/translation.json'
import pl_translation from './pl/translation.json'

const resources = {
  en: {
    translation: en_translation
  },
  pl: {
    translation: pl_translation
  }
};

const DETECTION_OPTIONS = {
  order: ['localStorage', 'navigator'],
  caches: ['localStorage']
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    languages: ['en', 'pl'],
    detection: DETECTION_OPTIONS,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;