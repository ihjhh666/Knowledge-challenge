import { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  className?: string;
}

export function AdBanner({ dataAdSlot, className = '' }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`w-full relative flex items-center justify-center overflow-hidden bg-slate-900/30 border border-white/5 rounded-2xl min-h-[100px] ${className}`}>
      {/* Fallback label if ad is blocked or not loaded */}
      <span className="absolute text-slate-500/50 text-sm font-semibold pointer-events-none">مساحة إعلانية</span>
      
      {/* The actual google ad ins tag */}
      <ins
        className="adsbygoogle relative z-10 w-full"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3802946765798171"
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
