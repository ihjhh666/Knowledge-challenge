import React from 'react';
import { Link } from 'react-router-dom';
import { encyclopediaCategories } from '../data/encyclopediaData';
import { BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function Encyclopedia() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4" dir="rtl">
      <SEO 
        title="موسوعة المعرفة" 
        description="استكشف موسوعة تحدي المعرفة الشاملة. مقالات حصرية في التاريخ، الجغرافيا، الفضاء، العلوم، والمزيد لإثراء حصيلتك الثقافية."
        url="/encyclopedia"
      />
      
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
            <BookOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">موسوعة المعرفة</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            مكتبة متكاملة من المقالات الحصرية والمعلومات القيمة المصممة لإثراء عقلك وتوسيع مداركك في مختلف مجالات الحياة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {encyclopediaCategories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/encyclopedia/${category.id}`}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-300 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-bottom">
                {category.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{category.name}</h2>
              <p className="text-slate-400 leading-relaxed flex-grow">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
