
import React, { useState } from 'react';
import { HomeData, ScopeCategory } from '../types';
import { ArrowUpRight, Play, Globe, MessageSquare, Mail, Smartphone, Database, Shield, Zap, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  data: HomeData;
  scopeCategories: ScopeCategory[];
  onNavigateToScope: () => void;
  onNavigateToContact: () => void;
  onNavigate: (view: string) => void;
  onSendInquiry: (name: string, contact: string, content: string) => void;
  onSelectCategory: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ data, scopeCategories, onNavigateToScope, onNavigateToContact, onNavigate, onSendInquiry, onSelectCategory }) => {
  const tags = data.aboutTags.split(',').map(t => t.trim()).filter(Boolean);
  
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    content: ''
  });

  const getIcon = (id: string) => {
    switch (id) {
      case 'infra': return Database;
      case 'security': return Shield;
      case 'monitoring': return Zap;
      case 'global': return Globe;
      default: return Database;
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, email, content } = inquiryForm;
    if (!name || !content || (!phone && !email)) {
      alert('이름, 문의 내용 및 연락처 정보(이메일 또는 전화번호)를 입력해주세요.');
      return;
    }
    const combinedContact = `Email: ${email || 'N/A'} | Phone: ${phone || 'N/A'}`;
    onSendInquiry(name, combinedContact, content);
    setInquiryForm({ name: '', phone: '', email: '', content: '' });
    alert('문의가 성공적으로 접수되었습니다. 곧 연락드리겠습니다.');
  };

  // 섹션 렌더러 맵
  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return (
          <section key="hero" className="relative min-h-[90vh] flex flex-col justify-center pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-12 z-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.6em] uppercase opacity-40 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-white opacity-40"></span>
                    {data.heroSmallTag}
                  </span>
                  <h1 className="editorial-title text-[8vw] lg:text-[7.5vw] leading-[0.85] neo-gradient-text italic whitespace-pre-line">
                    {data.mainTitle}
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <button onClick={onNavigateToScope} className="bg-white text-black px-10 py-5 font-bold text-sm tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3 group">
                    업무범위 <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <button onClick={onNavigateToContact} className="px-10 py-5 font-bold text-sm tracking-widest border border-white/20 hover:border-white transition-all group">
                    문의하기
                  </button>
                </div>
                <p className="text-lg opacity-40 leading-relaxed font-light max-w-xl">{data.description}</p>
              </div>
              <div className="lg:col-span-5 relative hidden lg:block">
                <div className="relative aspect-[3/4] hero-image-mask rounded-3xl overflow-hidden border border-white/10 glow">
                  <img src={data.heroImage || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Hero" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'logos':
        return (
          <section key="logos" className="py-20 border-y border-white/10 overflow-hidden">
            <div className="container mx-auto space-y-16">
              <div className="flex flex-col items-center space-y-4">
                 <div className="w-12 h-[1px] bg-white opacity-20"></div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.8em] opacity-30 text-center">NEXTO PARTNERS</h3>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-between gap-12 items-center px-4 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {data.partnerLogos?.length > 0 ? (
                  data.partnerLogos.map((logo, i) => (
                    <div key={i} className="h-10 flex items-center justify-center">
                      <img src={logo} alt={`Partner ${i}`} className="max-h-full max-w-[140px] object-contain" />
                    </div>
                  ))
                ) : (
                  ['PARTNER_01', 'PARTNER_02', 'PARTNER_03', 'PARTNER_04', 'PARTNER_05'].map((l, i) => (
                    <div key={i} className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div> {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );
      case 'about':
        return (
          <section key="about" className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative group">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
                <img src={data.aboutImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-all duration-700" alt="About" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white text-black p-12 rounded-3xl hidden lg:block brutal-shadow z-20">
                <p className="text-sm font-bold leading-relaxed max-w-[200px]">{data.aboutCardText}</p>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-40">{data.aboutSmallTag}</span>
                <h2 className="editorial-title text-6xl leading-[1] italic whitespace-pre-line">{data.aboutTitle}</h2>
                <div className="flex gap-4">{tags.map((tag, idx) => (<span key={idx} className="px-4 py-1 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">{tag}</span>))}</div>
              </div>
              <p className="text-lg opacity-50 leading-relaxed font-light">{data.aboutDescription}</p>
              <div className="flex gap-12 pt-4">
                <button onClick={() => onNavigate('team')} className="bg-white text-black px-8 py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all">OUR TEAM</button>
              </div>
            </div>
          </section>
        );
      case 'scope':
        return (
          <section key="scope" id="scope-section" className="pt-24 space-y-20">
            <div className="border-b-4 border-white pb-12 flex justify-between items-end">
              <div>
                <h2 className="editorial-title text-6xl mb-6">BUSINESS_SCOPE.</h2>
                <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40">넥스토 랩스의 전문 업무 범위</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-2 border-white/10">
              {scopeCategories.map((s) => {
                const Icon = getIcon(s.id);
                return (
                  <button key={s.id} onClick={() => onSelectCategory(s.id)} className="bg-black p-16 space-y-8 hover:bg-white text-left group transition-all relative overflow-hidden min-h-[320px]">
                    <Icon size={32} className="opacity-40 group-hover:opacity-100 group-hover:text-black transition-all text-white" />
                    <div>
                      <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter group-hover:text-black transition-colors">{s.title}</h3>
                      <p className="text-sm font-bold opacity-40 leading-relaxed group-hover:opacity-100 group-hover:text-black transition-colors">{s.desc}</p>
                    </div>
                    <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={28} className="text-black" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      case 'testimonials':
        return (
          <section key="testimonials" className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            <div className="space-y-12">
              <h2 className="editorial-title text-7xl italic whitespace-pre-line">{data.testimonialsTitle}</h2>
              <p className="text-lg opacity-40 leading-relaxed font-light max-w-md">{data.testimonialsDescription}</p>
            </div>
            <div className="space-y-6">
              {data.testimonials.map((t, i) => (
                <div key={i} className="neo-card p-8 rounded-3xl flex justify-between items-center group">
                  <div className="space-y-4">
                    <p className="text-sm italic opacity-60 leading-relaxed">"{t.text}"</p>
                    <div><p className="font-bold text-sm">{t.name}</p><p className="text-[10px] opacity-30 uppercase tracking-widest">{t.role}</p></div>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 grayscale group-hover:grayscale-0 transition-all">
                    <img src={t.avatar || `https://i.pravatar.cc/100?img=${i+30}`} alt={t.name} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'cta':
        return (
          <section key="cta" className="relative overflow-hidden rounded-[3rem] p-24 text-center border border-white/10 bg-black min-h-[500px] flex flex-col justify-center items-center">
            {data.ctaVideo ? (
              <div className="absolute inset-0 z-0">
                <video src={data.ctaVideo} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80"></div>
              </div>
            ) : (<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0"></div>)}
            <div className="relative z-10 space-y-12 max-w-4xl">
              <h2 className="editorial-title text-[5vw] lg:text-7xl italic whitespace-pre-line leading-[0.9]">{data.ctaTitle}</h2>
              <div className="flex justify-center">
                 <button className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all group backdrop-blur-sm">
                   <Play size={32} fill="currentColor" className="ml-1" />
                 </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40">{data.ctaTag}</p>
            </div>
          </section>
        );
      case 'contact':
        return (
          <section key="contact" id="contact-section" className="pt-24 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-12">
                <div className="space-y-6">
                  <h2 className="editorial-title text-6xl italic leading-[1.1] whitespace-pre-line">{data.contactTitle}</h2>
                  <div className="space-y-2">
                    <p className="text-xl font-bold opacity-60 whitespace-pre-line">{data.contactDescription}</p>
                  </div>
                </div>
                <div className="space-y-8 pt-6">
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all"><Mail className="text-white/60 group-hover:text-black" size={24} /></div>
                    <div><p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Email</p><p className="text-xl font-black tracking-tight">{data.contactEmail}</p></div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all"><Smartphone className="text-white/60 group-hover:text-black" size={24} /></div>
                    <div><p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Phone</p><p className="text-xl font-black tracking-tight">{data.contactPhone}</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A0A0A] p-12 rounded-[2.5rem] border-2 border-white/10 shadow-2xl relative overflow-hidden group">
                <form className="space-y-8 relative z-10" onSubmit={handleInquirySubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3"><label className="text-[11px] font-black uppercase tracking-widest opacity-30">이름</label><input type="text" required value={inquiryForm.name} onChange={e => setInquiryForm({...inquiryForm, name: e.target.value})} placeholder="홍길동" className="w-full bg-black border-b-2 border-white/20 px-6 py-4 font-bold text-lg outline-none focus:border-white transition-all" /></div>
                    <div className="space-y-3"><label className="text-[11px] font-black uppercase tracking-widest opacity-30">연락처</label><input type="text" value={inquiryForm.phone} onChange={e => setInquiryForm({...inquiryForm, phone: e.target.value})} placeholder="010-0000-0000" className="w-full bg-black border-b-2 border-white/20 px-6 py-4 font-bold text-lg outline-none focus:border-white transition-all" /></div>
                  </div>
                  <div className="space-y-3"><label className="text-[11px] font-black uppercase tracking-widest opacity-30">이메일</label><input type="email" value={inquiryForm.email} onChange={e => setInquiryForm({...inquiryForm, email: e.target.value})} placeholder="example@email.com" className="w-full bg-black border-b-2 border-white/20 px-6 py-4 font-bold text-lg outline-none focus:border-white transition-all" /></div>
                  <div className="space-y-3"><label className="text-[11px] font-black uppercase tracking-widest opacity-30">프로젝트 내용</label><textarea required value={inquiryForm.content} onChange={e => setInquiryForm({...inquiryForm, content: e.target.value})} placeholder="어떤 프로젝트를 구상 중이신가요?" className="w-full bg-black border-b-2 border-white/20 px-6 py-4 font-bold text-lg h-40 outline-none focus:border-white transition-all resize-none" /></div>
                  <button type="submit" className="w-full bg-white text-black py-6 rounded-none font-black text-sm uppercase tracking-[0.6em] hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]">문의 보내기</button>
                </form>
              </div>
            </div>
          </section>
        );
      case 'footer_info':
        return (
          <div key="footer_info" className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-24 border-t border-white/10">
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Quick Links</h4>
              <ul className="space-y-3 text-[12px] opacity-40">{data.footerQuickLinks.map((link, i) => (<li key={i} onClick={() => onNavigate(link.target)} className="hover:opacity-100 transition-all cursor-pointer">{link.label}</li>))}</ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Explore</h4>
              <ul className="space-y-3 text-[12px] opacity-40">{data.footerExploreLinks.map((link, i) => (<li key={i} onClick={() => onNavigate(link.target)} className="hover:opacity-100 transition-all cursor-pointer">{link.label}</li>))}</ul>
            </div>
            <div className="col-span-2 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Futuristic Tech & VR Website</h4>
              <p className="text-sm opacity-40 leading-relaxed font-light">{data.footerInfo}</p>
              <div className="flex gap-6">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-40 hover:opacity-100 cursor-pointer transition-all"><Globe size={14} /></div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-40 hover:opacity-100 cursor-pointer transition-all"><MessageSquare size={14} /></div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-48 animate-fade-in pb-32">
      {/* sectionOrder에 정의된 순서대로 렌더링 */}
      {data.sectionOrder.map(sectionId => renderSection(sectionId))}

      {/* 컨택트 섹션이 sectionOrder에 포함되어 있지 않은 경우를 대비한 렌더링 (하위 호환성) */}
      {!data.sectionOrder.includes('contact') && renderSection('contact')}
    </div>
  );
};

export default HomeView;
