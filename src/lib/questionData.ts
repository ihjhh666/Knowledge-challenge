import { NEW_GENERAL } from './questions/general';
import { NEW_FOOTBALL } from './questions/football';
import { NEW_HISTORY } from './questions/history';
import { NEW_SCIENCE } from './questions/science';
import { NEW_MOVIES } from './questions/movies';
import { NEW_ANIME } from './questions/anime';
import { NEW_ISLAMIC } from './questions/islamic';

import { MEGA_GENERAL, MEGA_FOOTBALL, MEGA_SCIENCE } from './megaData1';
import { MEGA_ISLAMIC, MEGA_ANIME, MEGA_MOVIES, MEGA_HISTORY } from './megaData2';

import { MASSIVE_GENERAL } from './massive/general';
import { MASSIVE_FOOTBALL } from './massive/football';
import { MASSIVE_SCIENCE } from './massive/science';
import { MASSIVE_HISTORY } from './massive/history';
import { MASSIVE_ANIME } from './massive/anime';
import { MASSIVE_MOVIES } from './massive/movies';
import { MASSIVE_ISLAMIC } from './massive/islamic';

import { BULK_GENERAL, BULK_FOOTBALL, BULK_MOVIES, BULK_ANIME, BULK_SCIENCE, BULK_HISTORY, BULK_ISLAMIC } from './massive/bulkData1';
import { GENERAL_BULK_2, FOOTBALL_BULK_2, MOVIES_BULK_2, HISTORY_BULK_2 } from './massive/bulkData2';

import { GENERAL_ADDITIONS_1 } from './questions/general_additions_1';
import { GENERAL_ADDITIONS_2 } from './questions/general_additions_2';
import { GENERAL_ADDITIONS_3 } from './questions/general_additions_3';
import { GENERAL_ADDITIONS_4 } from './questions/general_additions_4';
import { GENERAL_ADDITIONS_5 } from './questions/general_additions_5';
import { GENERAL_ADDITIONS_6 } from './questions/general_additions_6';
import { GENERAL_ADDITIONS_7 } from './questions/general_additions_7';
import { GENERAL_ADDITIONS_8 } from './questions/general_additions_8';
import { GENERAL_ADDITIONS_9 } from './questions/general_additions_9';
import { GENERAL_ADDITIONS_10 } from './questions/general_additions_10';

import { 
  getDynamicGeneral, 
  getDynamicFootball, 
  getDynamicScience, 
  getDynamicHistory, 
  getDynamicAnime, 
  getDynamicMovies, 
  getDynamicIslamic
} from './massiveDynamic';

import { FOOTBALL_ADDITIONS_1 } from './questions/football_additions_1';
import { FOOTBALL_ADDITIONS_2 } from './questions/football_additions_2';
import { FOOTBALL_ADDITIONS_3 } from './questions/football_additions_3';
import { FOOTBALL_ADDITIONS_4 } from './questions/football_additions_4';
import { FOOTBALL_ADDITIONS_5 } from './questions/football_additions_5';
import { FOOTBALL_ADDITIONS_6 } from './questions/football_additions_6';
import { FOOTBALL_ADDITIONS_7 } from './questions/football_additions_7';

import { HISTORY_ADDITIONS_1 } from './questions/history_additions_1';
import { HISTORY_ADDITIONS_2 } from './questions/history_additions_2';
import { HISTORY_ADDITIONS_3 } from './questions/history_additions_3';
import { HISTORY_ADDITIONS_4 } from './questions/history_additions_4';
import { HISTORY_ADDITIONS_5 } from './questions/history_additions_5';
import { HISTORY_ADDITIONS_6 } from './questions/history_additions_6';
import { HISTORY_ADDITIONS_7 } from './questions/history_additions_7';

export const ALL_COUNTRIES = [
  { code: 'sa', name: 'السعودية' }, { code: 'eg', name: 'مصر' }, { code: 'ae', name: 'الإمارات' }, { code: 'dz', name: 'الجزائر' }, { code: 'ma', name: 'المغرب' }, { code: 'iq', name: 'العراق' }, { code: 'sy', name: 'سوريا' }, { code: 'ye', name: 'اليمن' }, { code: 'tn', name: 'تونس' }, { code: 'jo', name: 'الأردن' }, { code: 'lb', name: 'لبنان' }, { code: 'qa', name: 'قطر' }, { code: 'kw', name: 'الكويت' }, { code: 'bh', name: 'البحرين' }, { code: 'om', name: 'عُمان' }, { code: 'sd', name: 'السودان' }, { code: 'ly', name: 'ليبيا' }, { code: 'ps', name: 'فلسطين' }, { code: 'mr', name: 'موريتانيا' }, { code: 'so', name: 'الصومال' }, { code: 'dj', name: 'جيبوتي' }, { code: 'km', name: 'جزر القمر' },
  { code: 'us', name: 'الولايات المتحدة' }, { code: 'gb', name: 'بريطانيا' }, { code: 'fr', name: 'فرنسا' }, { code: 'de', name: 'ألمانيا' }, { code: 'it', name: 'إيطاليا' }, { code: 'es', name: 'إسبانيا' }, { code: 'cn', name: 'الصين' }, { code: 'jp', name: 'اليابان' }, { code: 'kr', name: 'كوريا الجنوبية' }, { code: 'ru', name: 'روسيا' }, { code: 'in', name: 'الهند' }, { code: 'br', name: 'البرازيل' }, { code: 'ar', name: 'الأرجنتين' }, { code: 'ca', name: 'كندا' }, { code: 'au', name: 'أستراليا' }, { code: 'mx', name: 'المكسيك' }, { code: 'za', name: 'جنوب أفريقيا' }, { code: 'ng', name: 'نيجيريا' }, { code: 'tr', name: 'تركيا' }, { code: 'ir', name: 'إيران' }, { code: 'pk', name: 'باكستان' }, { code: 'id', name: 'إندونيسيا' }, { code: 'my', name: 'ماليزيا' }, { code: 'sg', name: 'سنغافورة' }, { code: 'se', name: 'السويد' }, { code: 'no', name: 'النرويج' }, { code: 'fi', name: 'فنلندا' }, { code: 'dk', name: 'الدنمارك' }, { code: 'nl', name: 'هولندا' }, { code: 'be', name: 'بلجيكا' }, { code: 'ch', name: 'سويسرا' }, { code: 'at', name: 'النمسا' }, { code: 'gr', name: 'اليونان' }, { code: 'pt', name: 'البرتغال' }, { code: 'ie', name: 'أيرلندا' }, { code: 'nz', name: 'نيوزيلندا' },
  { code: 've', name: 'فنزويلا' }, { code: 'co', name: 'كولومبيا' }, { code: 'cl', name: 'تشيلي' }, { code: 'pe', name: 'بيرو' }, { code: 'uy', name: 'أوروغواي' }, { code: 'py', name: 'باراغواي' }, { code: 'bo', name: 'بوليفيا' }, { code: 'ec', name: 'الإكوادور' }, { code: 'ua', name: 'أوكرانيا' }, { code: 'pl', name: 'بولندا' }, { code: 'ro', name: 'رومانيا' }, { code: 'cz', name: 'التشيك' }, { code: 'hu', name: 'المجر' }, { code: 'bg', name: 'بلغاريا' }, { code: 'rs', name: 'صربيا' }, { code: 'hr', name: 'كرواتيا' }, { code: 'ba', name: 'البوسنة' }, { code: 'al', name: 'ألبانيا' }, { code: 'mk', name: 'مقدونيا' }, { code: 'th', name: 'تايلاند' }, { code: 'vn', name: 'فيتنام' }, { code: 'ph', name: 'الفلبين' }, { code: 'kh', name: 'كمبوديا' }, { code: 'mm', name: 'ميانمار' }, { code: 'bd', name: 'بنغلاديش' }, { code: 'lk', name: 'سريلانكا' }, { code: 'af', name: 'أفغانستان' }, { code: 'uz', name: 'أوزبكستان' }, { code: 'kz', name: 'كازاخستان' }, { code: 'ke', name: 'كينيا' }, { code: 'et', name: 'إثيوبيا' }, { code: 'tz', name: 'تنزانيا' }, { code: 'ug', name: 'أوغندا' }, { code: 'gh', name: 'غانا' }, { code: 'ci', name: 'ساحل العاج' }, { code: 'sn', name: 'السنغال' }, { code: 'cm', name: 'الكاميرون' }, { code: 'ao', name: 'أنغولا' }, { code: 'mz', name: 'موزمبيق' }, { code: 'mg', name: 'مدغشقر' }, { code: 'zw', name: 'زيمبابوي' }, { code: 'cu', name: 'كوبا' }, { code: 'jm', name: 'جامايكا' }, { code: 'ht', name: 'هايتي' }, { code: 'do', name: 'الدومينيكان' }, { code: 'is', name: 'آيسلندا' }, { code: 'cy', name: 'قبرص' }, { code: 'mt', name: 'مالطا' }, { code: 'np', name: 'نيبال' }, { code: 'bt', name: 'بوتان' }, { code: 'mv', name: 'المالديف' }
];

// Helper to remove duplicates based on question text
(globalThis as any).duplicateCount = (globalThis as any).duplicateCount || 0;
const deduplicateQs = (qs: { text: string; correctAnswer: string; wrongOptions: string[] }[]) => {
  const seen = new Set<string>();
  const origLength = qs.length;
  const filtered = qs.filter(q => {
    if (seen.has(q.text)) return false;
    seen.add(q.text);
    return true;
  });
  const dups = origLength - filtered.length;
  (globalThis as any).duplicateCount += dups;
  return filtered;
};

export const GENERAL_KNOWLEDGE = deduplicateQs([
  ...NEW_GENERAL, 
  ...MEGA_GENERAL, 
  ...MASSIVE_GENERAL, 
  ...BULK_GENERAL, 
  ...GENERAL_BULK_2, 
  ...GENERAL_ADDITIONS_1,
  ...GENERAL_ADDITIONS_2,
  ...GENERAL_ADDITIONS_3,
  ...GENERAL_ADDITIONS_4,
  ...GENERAL_ADDITIONS_5,
  ...GENERAL_ADDITIONS_6,
  ...GENERAL_ADDITIONS_7,
  ...GENERAL_ADDITIONS_8,
  ...GENERAL_ADDITIONS_9,
  ...GENERAL_ADDITIONS_10,
  ...getDynamicGeneral(5000)
]);
export const FOOTBALL = deduplicateQs([...NEW_FOOTBALL, ...MEGA_FOOTBALL, ...MASSIVE_FOOTBALL, ...BULK_FOOTBALL, ...FOOTBALL_BULK_2, ...FOOTBALL_ADDITIONS_1, ...FOOTBALL_ADDITIONS_2, ...FOOTBALL_ADDITIONS_3, ...FOOTBALL_ADDITIONS_4, ...FOOTBALL_ADDITIONS_5, ...FOOTBALL_ADDITIONS_6, ...FOOTBALL_ADDITIONS_7, ...getDynamicFootball(5000)]);
export const MOVIES = deduplicateQs([...NEW_MOVIES, ...MEGA_MOVIES, ...MASSIVE_MOVIES, ...BULK_MOVIES, ...MOVIES_BULK_2, ...getDynamicMovies(5000)]);
export const ANIME = deduplicateQs([...NEW_ANIME, ...MEGA_ANIME, ...MASSIVE_ANIME, ...BULK_ANIME, ...getDynamicAnime(5000)]);
export const SCIENCE = deduplicateQs([...NEW_SCIENCE, ...MEGA_SCIENCE, ...MASSIVE_SCIENCE, ...BULK_SCIENCE, ...getDynamicScience(5000)]);
export const HISTORY = deduplicateQs([...NEW_HISTORY, ...MEGA_HISTORY, ...MASSIVE_HISTORY, ...BULK_HISTORY, ...HISTORY_BULK_2, ...HISTORY_ADDITIONS_1, ...HISTORY_ADDITIONS_2, ...HISTORY_ADDITIONS_3, ...HISTORY_ADDITIONS_4, ...HISTORY_ADDITIONS_5, ...HISTORY_ADDITIONS_6, ...HISTORY_ADDITIONS_7, ...getDynamicHistory(5000)]);
export const ISLAMIC = deduplicateQs([...NEW_ISLAMIC, ...MEGA_ISLAMIC, ...MASSIVE_ISLAMIC, ...BULK_ISLAMIC, ...getDynamicIslamic(5000)]);
import { MATH_GENERATED } from './questions/math_generated';
export const MATH = deduplicateQs([...MATH_GENERATED]);
