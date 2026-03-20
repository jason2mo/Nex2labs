import React from 'react';

interface LoadingOverlayProps {
  brandName?: string;
  logoImage?: string | null;
  loadingLogo?: string | null;
  loadingSubtext?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  brandName = "NexTo Labs",
  logoImage = null,
  loadingLogo = null,
  loadingSubtext = "BOOTING INFRASTRUCTURE"
}) => {
  const displayLogo = loadingLogo ?? logoImage;
  // 为 GitHub URL 添加时间戳避免缓存
  const getLogoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('raw.githubusercontent.com') && !url.includes('?')) {
      return `${url}?t=${Date.now()}`;
    }
    return url;
  };
  
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
      <div className="mb-8 flex justify-center">
        {displayLogo ? (
          <img 
            src={getLogoUrl(displayLogo) || displayLogo} 
            alt={brandName} 
            className="max-h-16 md:max-h-20 w-auto object-contain"
            onError={(e) => {
              const img = e.currentTarget;
              const url = img.src;
              // 如果是 GitHub URL，尝试添加时间戳强制刷新
              if (url.includes('raw.githubusercontent.com') && !url.includes('?')) {
                img.src = `${url}?t=${Date.now()}`;
              }
            }}
          />
        ) : (
          <h1 className="big-title text-4xl md:text-5xl italic">{brandName}.</h1>
        )}
      </div>
      <div className="w-12 h-[1px] bg-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FF6B00] animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6B00]">
        {loadingSubtext || "BOOTING INFRASTRUCTURE"}
      </div>
    </div>
  );
};

export default LoadingOverlay;
