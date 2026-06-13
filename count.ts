import { PROVERBS_DB, RAW_DB } from './src/lib/proverbsData';

const typeCounts = PROVERBS_DB.reduce((acc, curr) => {
  acc[curr.type] = (acc[curr.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('--- تقرير الأمثال النهائي ---');
console.log('📝 العدد الإجمالي قبل التصفية (الخام):', RAW_DB.length);
console.log('✅ العدد الحقيقي الصافي (الأمثال الأصلية بدون تكرار):', PROVERBS_DB.length);
console.log('🗑️ عدد الأمثال المكررة التي تم حذفها:', RAW_DB.length - PROVERBS_DB.length);
console.log('-----------------------------');
console.log('توزيع الأمثال حسب الفئات والأنواع:');
Object.entries(typeCounts).forEach(([type, count]) => {
  console.log(`- ${type}: ${count}`);
});
console.log('-----------------------------');

