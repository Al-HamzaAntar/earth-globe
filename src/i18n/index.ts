import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      'globe.title': 'خريطة دول العالم',
      'globe.instructions': 'اسحب للدوران. قم بالتمرير للتكبير. حرك الماوس فوق دولة لرؤية اسمها وعاصمتها.',
      'globe.loading': 'تحميل الخريطة...',
      'globe.capital': 'العاصمة',
      'globe.unknown': 'غير معروف'
    }
  },
  en: {
    translation: {
      'globe.title': 'World Countries Globe',
      'globe.instructions': 'Drag to rotate. Scroll to zoom. Hover a country to see its name and capital.',
      'globe.loading': 'Loading map...',
      'globe.capital': 'Capital',
      'globe.unknown': 'Unknown'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language is Arabic
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;