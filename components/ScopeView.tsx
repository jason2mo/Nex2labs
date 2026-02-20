
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ScopeCategory } from '../types';

interface ScopeViewProps {
  categories: ScopeCategory[];
  onSelectCategory: (categoryId: string) => void;
}

const ScopeView: React.FC<ScopeViewProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="space-y-24 animate-fade-in text-black">
      <div className="border-b-4 border-black pb-12 flex justify-between items-end">
        <div>
          <h2 className="editorial-title text-6xl mb-6">BUSINESS_SCOPE.</h2>
          <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40">넥스투 랩스의 전문 업무 범위</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/20 border-2 border-black/20">
        {categories.map((s) => {
          return (
            <button 
              key={s.id} 
              onClick={() => onSelectCategory(s.id)}
              className="bg-[#FAF9F6] p-20 py-28 space-y-10 hover:bg-black text-left group transition-all relative overflow-hidden"
            >
              <div>
                <h3 className="text-4xl font-black mb-8 uppercase italic tracking-tighter group-hover:text-[#FAF9F6] transition-colors leading-[1.1] whitespace-pre-line">
                  {s.title}
                </h3>
                <p className="text-xl font-bold opacity-60 leading-relaxed group-hover:opacity-100 group-hover:text-[#FAF9F6] transition-colors max-w-[85%]">
                  {s.desc}
                </p>
              </div>
              <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ArrowRight size={32} className="text-[#FAF9F6]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScopeView;
