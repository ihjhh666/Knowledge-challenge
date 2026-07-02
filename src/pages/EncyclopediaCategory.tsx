import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { encyclopediaCategories, encyclopediaArticles } from '../data/encyclopediaData';
import { ArrowRight, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function EncyclopediaCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const category = encyclopediaCategories.find(c => c.id === categoryId);
  
  if (!category) {
    return <Navigate to="/encyclopedia" replace />;
  }

  const articles = encyclopediaArticles.filter(a => a.categoryId === categoryId);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4" dir="rtl">
      <SEO 
        title={`${category.name} | موسوعة المعرفة`} 
        description={category.description}
        url={`/encyclopedia/${category.id}`}
      />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <Link to="/encyclopedia" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          <ArrowRight className="w-5 h-5" /> عودة للموسوعة
        </Link>
        
        <div className="border-b border-slate-800 pb-8 animate-in fade-in">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{category.name}</h1>
          </div>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
            {category.description}
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-xl">جاري إضافة المقالات لهذا القسم قريباً...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article, index) => (
              <Link 
                key={article.id} 
                to={`/encyclopedia/${categoryId}/${article.id}`}
                className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.date).toLocaleDateString('ar-EG')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
