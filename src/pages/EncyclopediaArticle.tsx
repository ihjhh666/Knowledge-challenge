import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { encyclopediaCategories, encyclopediaArticles } from '../data/encyclopediaData';
import { ArrowRight, Calendar, Folder } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function EncyclopediaArticle() {
  const { categoryId, articleId } = useParams<{ categoryId: string, articleId: string }>();
  
  const category = encyclopediaCategories.find(c => c.id === categoryId);
  const article = encyclopediaArticles.find(a => a.id === articleId && a.categoryId === categoryId);
  
  if (!category || !article) {
    return <Navigate to="/encyclopedia" replace />;
  }

  // Schema.org structured data for Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "author": {
      "@type": "Organization",
      "name": "تحدي المعرفة"
    },
    "datePublished": article.date,
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4" dir="rtl">
      <SEO 
        title={article.title} 
        description={article.summary}
        url={`/encyclopedia/${category.id}/${article.id}`}
        type="article"
      />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link 
          to={`/encyclopedia/${category.id}`} 
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          <ArrowRight className="w-5 h-5" /> عودة إلى قسم {category.name}
        </Link>
        
        <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
          <header className="mb-10 border-b border-slate-800 pb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
              <Link to={`/encyclopedia/${category.id}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors bg-slate-800 px-3 py-1.5 rounded-full">
                <Folder className="w-4 h-4" />
                {category.name}
              </Link>
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed italic border-r-4 border-indigo-500 pr-4 py-1">
              {article.summary}
            </p>
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-300 prose-headings:font-bold prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-p:leading-relaxed prose-p:text-slate-300 prose-li:text-slate-300"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>
    </div>
  );
}
