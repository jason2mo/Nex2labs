
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ScopeCategory } from '../types';

interface ScopeViewProps {
  categories: ScopeCategory[];
  onSelectCategory: (categoryId: string) => void;
}

const ScopeView: React.FC<ScopeViewProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="space-y-24 animate-fade-in text-white">
      <div className="border-b-4 border-[#FF6B00] pb-12 flex justify-between items-end">
        <div>
          <h2 className="big-title text-6xl mb-6">BUSINESS_SCOPE.</h2>
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/50">넥스투 랩스의 전문 업무 범위</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {categories.map((s) => {
          return (
            <button 
              key={s.id} 
              onClick={() => onSelectCategory(s.id)}
              className="bg-[#FAF9F6] text-black p-20 py-28 space-y-10 hover:bg-[#FF6B00] hover:text-white text-left group transition-all relative overflow-hidden"
            >
              <div>
                <h3 className="text-4xl font-black mb-8 uppercase italic tracking-tighter transition-colors leading-[1.1] whitespace-pre-line group-hover:text-white">
                  {s.title}
                </h3>
                <p className="text-xl font-bold text-black/60 leading-relaxed group-hover:text-white/90 transition-colors max-w-[85%]">
                  {s.desc}
                </p>
              </div>
              <div className="absolute bottom-10 right-10 opacity-30 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ArrowRight size={32} className="group-hover:text-white" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScopeView;
