
import React from 'react';
import { Database, Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import { ScopeCategory } from '../types';

interface ScopeViewProps {
  categories: ScopeCategory[];
  onSelectCategory: (categoryId: string) => void;
}

const ScopeView: React.FC<ScopeViewProps> = ({ categories, onSelectCategory }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'infra': return Database;
      case 'security': return Shield;
      case 'monitoring': return Zap;
      case 'global': return Globe;
      default: return Database;
    }
  };

  return (
    <div className="space-y-24 animate-fade-in text-white">
      <div className="border-b-4 border-white pb-12 flex justify-between items-end">
        <div>
          <h2 className="editorial-title text-6xl mb-6">BUSINESS_SCOPE.</h2>
          <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40">넥스토 랩스의 전문 업무 범위</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/20 border-2 border-white/20">
        {categories.map((s) => {
          const Icon = getIcon(s.id);
          return (
            <button 
              key={s.id} 
              onClick={() => onSelectCategory(s.id)}
              className="bg-black p-20 space-y-10 hover:bg-white text-left group transition-all relative overflow-hidden"
            >
              <Icon size={40} className="opacity-40 group-hover:opacity-100 group-hover:text-black transition-all text-white" />
              <div>
                <h3 className="text-3xl font-black mb-6 uppercase italic tracking-tighter group-hover:text-black transition-colors">{s.title}</h3>
                <p className="text-lg font-bold opacity-60 leading-relaxed group-hover:opacity-100 group-hover:text-black transition-colors">{s.desc}</p>
              </div>
              <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ArrowRight size={32} className="text-black" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScopeView;
