
import React from 'react';
import { ArrowLeft, Mail, Smartphone, Globe, User } from 'lucide-react';
import { HomeData } from '../types';

interface TeamViewProps {
  data: HomeData;
  onBack: () => void;
}

const TeamView: React.FC<TeamViewProps> = ({ data, onBack }) => {
  return (
    <div className="space-y-16 md:space-y-24 animate-fade-in pb-20 md:pb-40 text-white max-w-6xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center border-b border-white/10 pb-6 md:pb-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-[#FF6B00] transition-all group"
        >
          <ArrowLeft size={14} md:size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>
        <span className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] md:tracking-[0.5em]">{data.brandName} / Core Team</span>
      </div>

      {/* 히어로 섹션 */}
      <div className="space-y-6 md:space-y-8 max-w-3xl">
        <h2 className="big-title text-5xl md:text-7xl lg:text-8xl italic leading-none whitespace-pre-line">
          {data.teamHeroTitle}
        </h2>
        <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
          {data.teamHeroDescription}
        </p>
      </div>

      {/* 멤버 리스트 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {data.members.map((member) => (
          <div key={member.id} className="group relative">
            <div className="bg-white/5 border border-white/10 aspect-[3/4] relative overflow-hidden transition-all duration-500 group-hover:border-[#FF6B00]/50 group-hover:shadow-[12px_12px_0_0_rgba(255,107,0,0.2)]">
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex flex-col items-center justify-center relative group-hover:bg-white/15 transition-opacity">
                  <User size={80} md:size={120} strokeWidth={0.5} className="mb-4 text-white/40" />
                  <span className="editorial-title text-4xl md:text-6xl text-white/10 absolute inset-0 flex items-center justify-center pointer-events-none uppercase">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#FF6B00] mb-1 md:mb-2">{member.role}</p>
                <h3 className="editorial-title text-2xl md:text-3xl italic text-white mb-2 md:mb-4">{member.name}</h3>
                <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500">
                  <p className="text-[11px] md:text-xs text-white/70 leading-relaxed font-medium mb-4 md:mb-6">
                    {member.bio}
                  </p>
                  <div className="flex gap-4 text-white/50">
                    <Mail size={14} className="hover:text-[#FF6B00] cursor-pointer transition-colors" />
                    <Smartphone size={14} className="hover:text-[#FF6B00] cursor-pointer transition-colors" />
                    <Globe size={14} className="hover:text-[#FF6B00] cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-[#FF6B00]/50 pointer-events-none"></div>
          </div>
        ))}
        {data.members.length === 0 && (
          <div className="col-span-full py-40 text-center text-white/30 italic uppercase tracking-[1em] text-2xl border-4 border-dashed border-white/10">
            NO_MEMBERS_FOUND
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;
