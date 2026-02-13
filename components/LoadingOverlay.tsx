
import React from 'react';
import { Database } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter italic">NexTo Labs.</h1>
      </div>
      <div className="w-12 h-[1px] bg-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
        Booting Infrastructure
      </div>
    </div>
  );
};

export default LoadingOverlay;
