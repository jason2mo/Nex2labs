
import React from 'react';
import { ArrowLeft, Mail, Smartphone, Globe, User } from 'lucide-react';
import { HomeData } from '../types';

interface TeamViewProps {
  data: HomeData;
  onBack: () => void;
}

const TeamView: React.FC<TeamViewProps> = ({ data, onBack }) => {
  return (
    <div className="space-y-24 animate-fade-in pb-40 text-white max-w-6xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center border-b-2 border-white/10 pb-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>
        <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">NexTo Labs / Core Team</span>
      </div>

      {/* 히어로 섹션 */}
      <div className="space-y-8 max-w-3xl">
        <h2 className="editorial-title text-7xl lg:text-8xl italic leading-none neo-gradient-text whitespace-pre-line">
          {data.teamHeroTitle}
        </h2>
        <p className="text-xl opacity-40 leading-relaxed font-light">
          {data.teamHeroDescription}
        </p>
      </div>

      {/* 멤버 리스트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {data.members.map((member) => (
          <div key={member.id} className="group relative">
            {/* 카드 배경 및 테두리 */}
            <div className="bg-white/5 brutal-border aspect-[3/4] relative overflow-hidden transition-all duration-500 group-hover:bg-white/10 group-hover:shadow-[20px_20px_0_0_rgba(255,255,255,0.05)]">
              
              {/* 이미지 영역 */}
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full bg-black flex flex-col items-center justify-center opacity-40 relative group-hover:opacity-60 transition-opacity">
                  <User size={120} strokeWidth={0.5} className="mb-4" />
                  <span className="editorial-title text-6xl opacity-10 absolute inset-0 flex items-center justify-center pointer-events-none uppercase">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* 하단 텍스트 레이어 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">{member.role}</p>
                <h3 className="editorial-title text-3xl italic text-white mb-4">{member.name}</h3>
                
                {/* 호버 시 나타나는 바이오 */}
                <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500">
                  <p className="text-xs opacity-60 leading-relaxed font-medium mb-6">
                    {member.bio}
                  </p>
                  <div className="flex gap-4 opacity-40">
                    <Mail size={14} className="hover:opacity-100 cursor-pointer" />
                    <Smartphone size={14} className="hover:opacity-100 cursor-pointer" />
                    <Globe size={14} className="hover:opacity-100 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 장식 요소 */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
          </div>
        ))}

        {data.members.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-10 italic uppercase tracking-[1em] text-2xl border-4 border-dashed border-white/5">
            NO_MEMBERS_FOUND
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;
