import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      'globe.title': 'خريطة دول العالم',
      'globe.instructions': 'اسحب للدوران. قم بالتمرير للتكبير. حرك الماوس فوق دولة لرؤية اسمها وعاصمتها.',
      'globe.loading': 'تحميل الخريطة...',
      'globe.capital': 'العاصمة',
      'globe.unknown': 'غير معروف',
      // Country names in Arabic
      'countries': {
        'Yemen': 'اليمن',
        'Saudi Arabia': 'المملكة العربية السعودية',
        'Egypt': 'مصر',
        'Jordan': 'الأردن',
        'Lebanon': 'لبنان',
        'Syria': 'سوريا',
        'Iraq': 'العراق',
        'Kuwait': 'الكويت',
        'Qatar': 'قطر',
        'United Arab Emirates': 'الإمارات العربية المتحدة',
        'Oman': 'عُمان',
        'Bahrain': 'البحرين',
        'Palestine': 'فلسطين',
        'Morocco': 'المغرب',
        'Algeria': 'الجزائر',
        'Tunisia': 'تونس',
        'Libya': 'ليبيا',
        'Sudan': 'السودان',
        'Somalia': 'الصومال',
        'Djibouti': 'جيبوتي',
        'Mauritania': 'موريتانيا',
        'Comoros': 'جزر القمر',
        'United States of America': 'الولايات المتحدة الأمريكية',
        'China': 'الصين',
        'Russia': 'روسيا',
        'India': 'الهند',
        'Japan': 'اليابان',
        'Germany': 'ألمانيا',
        'France': 'فرنسا',
        'United Kingdom': 'المملكة المتحدة',
        'Italy': 'إيطاليا',
        'Spain': 'إسبانيا',
        'Canada': 'كندا',
        'Australia': 'أستراليا',
        'Brazil': 'البرازيل',
        'Mexico': 'المكسيك',
        'South Africa': 'جنوب أفريقيا',
        'Nigeria': 'نيجيريا',
        'Kenya': 'كينيا',
        'Ethiopia': 'إثيوبيا',
        'Turkey': 'تركيا',
        'Iran': 'إيران',
        'Afghanistan': 'أفغانستان',
        'Pakistan': 'باكستان',
        'Bangladesh': 'بنغلاديش',
        'Indonesia': 'إندونيسيا',
        'Thailand': 'تايلاند',
        'Vietnam': 'فيتنام',
        'South Korea': 'كوريا الجنوبية',
        'North Korea': 'كوريا الشمالية',
        'Malaysia': 'ماليزيا',
        'Singapore': 'سنغافورة',
        'Philippines': 'الفلبين',
        'Argentina': 'الأرجنتين',
        'Chile': 'تشيلي',
        'Colombia': 'كولومبيا',
        'Peru': 'بيرو',
        'Venezuela': 'فنزويلا',
        'Poland': 'بولندا',
        'Ukraine': 'أوكرانيا',
        'Romania': 'رومانيا',
        'Greece': 'اليونان',
        'Portugal': 'البرتغال',
        'Netherlands': 'هولندا',
        'Belgium': 'بلجيكا',
        'Switzerland': 'سويسرا',
        'Austria': 'النمسا',
        'Sweden': 'السويد',
        'Norway': 'النرويج',
        'Denmark': 'الدنمارك',
        'Finland': 'فنلندا',
        'Ireland': 'أيرلندا'
      },
      // Capitals in Arabic
      'capitals': {
        'Sana\'a': 'صنعاء',
        'Riyadh': 'الرياض',
        'Cairo': 'القاهرة',
        'Amman': 'عمَّان',
        'Beirut': 'بيروت',
        'Damascus': 'دمشق',
        'Baghdad': 'بغداد',
        'Kuwait City': 'مدينة الكويت',
        'Doha': 'الدوحة',
        'Abu Dhabi': 'أبو ظبي',
        'Muscat': 'مسقط',
        'Manama': 'المنامة',
        'Ramallah': 'رام الله',
        'Rabat': 'الرباط',
        'Algiers': 'الجزائر',
        'Tunis': 'تونس',
        'Tripoli': 'طرابلس',
        'Khartoum': 'الخرطوم',
        'Mogadishu': 'مقديشو',
        'Djibouti': 'جيبوتي',
        'Nouakchott': 'نواكشوط',
        'Moroni': 'موروني',
        'Washington, D.C.': 'واشنطن العاصمة',
        'Beijing': 'بكين',
        'Moscow': 'موسكو',
        'New Delhi': 'نيودلهي',
        'Tokyo': 'طوكيو',
        'Berlin': 'برلين',
        'Paris': 'باريس',
        'London': 'لندن',
        'Rome': 'روما',
        'Madrid': 'مدريد',
        'Ottawa': 'أوتاوا',
        'Canberra': 'كانبرا',
        'Brasília': 'برازيليا',
        'Mexico City': 'مكسيكو سيتي'
      }
    }
  },
  en: {
    translation: {
      'globe.title': 'World Countries Globe',
      'globe.instructions': 'Drag to rotate. Scroll to zoom. Hover a country to see its name and capital.',
      'globe.loading': 'Loading map...',
      'globe.capital': 'Capital',
      'globe.unknown': 'Unknown',
      'countries': {},
      'capitals': {}
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