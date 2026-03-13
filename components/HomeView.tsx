
import React, { useState } from 'react';
import { HomeData, ScopeCategory } from '../types';
import { ArrowUpRight, Play, Globe, MessageSquare, Mail, Smartphone, Database, Shield, Zap, ArrowRight, User } from 'lucide-react';

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

  const handleLinkClick = (target: string) => {
    if (target === 'team') {
      onNavigate('team');
      return;
    }
    
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return (
          <section key="hero" id="home-top" className="relative min-h-[80vh] md:min-h-[90vh] flex flex-col justify-center pt-10 md:pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="lg:col-span-7 space-y-8 md:space-y-12 z-10">
                <div className="space-y-4">
                  <span className="font-bold tracking-[0.4em] md:tracking-[0.6em] uppercase text-[#FF6B00] flex items-center gap-3 md:gap-4" style={{ fontSize: `${data.heroSmallTagFontSize || 10}px` }}>
                    <span className="w-6 md:w-8 h-[1px] bg-[#FF6B00]"></span>
                    {data.heroSmallTag}
                  </span>
                  <h1 className="big-title text-white italic whitespace-pre-line" style={{ fontSize: `clamp(2rem, 5vw, ${data.mainTitleFontSize || 72}px)` }}>
                    {data.mainTitle}
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-stretch sm:items-center">
                  <button onClick={onNavigateToScope} className="btn-block flex items-center justify-center gap-3 group">
                    업무범위 <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <button onClick={onNavigateToContact} className="bg-[#FAF9F6] text-black px-8 md:px-10 py-4 md:py-5 font-black text-xs md:text-sm uppercase tracking-widest hover:bg-[#e8e6e1] transition-all border-2 border-[#FAF9F6]">
                    문의하기
                  </button>
                </div>
                <p className="text-white/60 leading-relaxed font-light max-w-xl" style={{ fontSize: `${data.descriptionFontSize || 16}px` }}>{data.description}</p>
              </div>
              <div className="lg:col-span-5 relative hidden lg:block">
                <div className="relative aspect-[3/4] hero-image-mask rounded-3xl overflow-hidden border border-white/10">
                  <img src={data.heroImage || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Hero" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'logos':
        return (
          <section key="logos" className="py-12 md:py-20 border-y border-white/10 overflow-hidden">
            <div className="container mx-auto space-y-10 md:space-y-16">
              <div className="flex flex-col items-center space-y-4">
                 <div className="w-12 h-[1px] bg-[#FF6B00]"></div>
                 <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-white/50 text-center">{data.brandName} PARTNERS</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center px-4 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {data.partnerLogos?.length > 0 ? (
                  data.partnerLogos.map((logo, i) => (
                    <div key={i} className="h-8 md:h-10 flex items-center justify-center">
                      <img src={logo} alt={`Partner ${i}`} className="max-h-full max-w-[100px] md:max-w-[140px] object-contain invert" />
                    </div>
                  ))
                ) : (
                  ['PARTNER_01', 'PARTNER_02', 'PARTNER_03', 'PARTNER_04', 'PARTNER_05'].map((l, i) => (
                    <div key={i} className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] flex items-center gap-2 md:gap-3 text-white/60">
                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-[#FF6B00] rounded-full"></div> {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );
      case 'about':
        return (
          <section key="about" id="about-section" className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center scroll-mt-24">
            <div className="relative group order-2 lg:order-1">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
                <img src={data.aboutImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-all duration-700" alt="About" />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-[#FAF9F6] text-black p-6 md:p-12 rounded-2xl md:rounded-3xl hidden sm:block shadow-[8px_8px_0_0_#FF6B00] z-20">
                <p className="text-xs md:text-sm font-bold leading-relaxed max-w-[240px] md:max-w-[320px]">{data.aboutCardText}</p>
              </div>
            </div>
            <div className="space-y-8 md:space-y-12 order-1 lg:order-2">
              <div className="space-y-4 md:space-y-6">
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#FF6B00]">{data.aboutSmallTag}</span>
                <h2 className="big-title text-white italic whitespace-pre-line text-4xl md:text-6xl">{data.aboutTitle}</h2>
                <div className="flex flex-wrap gap-2 md:gap-4">{tags.map((tag, idx) => (<span key={idx} className="px-3 md:px-4 py-1 border border-white/30 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/80">{tag}</span>))}</div>
              </div>
              <p className="text-base md:text-lg text-white/60 leading-relaxed font-light">{data.aboutDescription}</p>
              <div className="flex gap-6 md:gap-12 pt-2 md:pt-4">
                <button onClick={() => onNavigate('team')} className="btn-block text-[10px] md:text-[11px]">OUR TEAM</button>
              </div>
            </div>
          </section>
        );
      case 'scope':
        return (
          <section key="scope" id="scope-section" className="pt-16 md:pt-24 space-y-12 md:space-y-20 scroll-mt-24">
            <div className="border-b-2 md:border-b-4 border-[#FF6B00] pb-8 md:pb-12 flex justify-between items-end">
              <div>
                <h2 className="big-title text-white text-4xl md:text-6xl mb-4 md:mb-6">{data.servicesTitle}</h2>
                <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/50">{data.servicesDescription}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {scopeCategories.map((s) => {
                return (
                  <button key={s.id} onClick={() => onSelectCategory(s.id)} className="bg-[#FAF9F6] text-black p-8 md:p-16 py-12 md:py-24 space-y-6 md:space-y-8 hover:bg-[#FF6B00] hover:text-white text-left group transition-all relative overflow-hidden min-h-[240px] md:min-h-[320px] border-0">
                    <div className="space-y-4 md:space-y-6">
                      <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 uppercase italic tracking-tighter transition-colors whitespace-pre-line leading-[1.1] group-hover:text-white">
                        {s.title}
                      </h3>
                      <p className="text-sm md:text-base font-bold text-black/60 leading-relaxed group-hover:text-white/90 transition-colors max-w-[90%] md:max-w-[80%]">
                        {s.desc}
                      </p>
                    </div>
                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 opacity-30 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={24} className="md:w-7 md:h-7 group-hover:text-white" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      case 'testimonials':
        return (
          <section key="testimonials" className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            <div className="space-y-8 md:space-y-12">
              <h2 className="big-title text-white text-5xl md:text-7xl italic whitespace-pre-line">{data.testimonialsTitle}</h2>
              <p className="text-base md:text-lg text-white/50 leading-relaxed font-light max-w-md">{data.testimonialsDescription}</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              {data.testimonials.map((t, i) => (
                <div key={i} className="neo-card p-6 md:p-8 rounded-2xl md:rounded-3xl flex justify-between items-center group border-white/10">
                  <div className="space-y-3 md:space-y-4 flex-1 pr-4 md:pr-6">
                    <p className="text-xs md:text-sm italic text-white/70 leading-relaxed">"{t.text}"</p>
                    <div><p className="font-bold text-xs md:text-sm text-white">{t.name}</p><p className="text-[9px] md:text-[10px] text-[#FF6B00] uppercase tracking-widest">{t.role}</p></div>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#FF6B00]/50 bg-white/5 flex items-center justify-center shrink-0 grayscale group-hover:grayscale-0 transition-all">
                    {t.avatar ? (
                      <img src={t.avatar} className="w-full h-full object-cover" alt={t.name} />
                    ) : (
                      <User size={18} md:size={20} className="text-white/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'cta':
        return (
          <section key="cta" className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] p-10 md:p-24 text-center border-2 border-white/10 bg-black min-h-[400px] md:min-h-[500px] flex flex-col justify-center items-center">
            {data.ctaVideo ? (
              <div className="absolute inset-0 z-0">
                <video src={data.ctaVideo} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80"></div>
              </div>
            ) : (<div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-transparent z-0"></div>)}
            <div className="relative z-10 space-y-8 md:space-y-12 max-w-4xl">
              <h2 className="big-title text-white text-[10vw] sm:text-[8vw] lg:text-7xl italic whitespace-pre-line leading-[0.9]">{data.ctaTitle}</h2>
              <div className="flex justify-center">
                 <button className="w-24 h-24 md:w-28 md:h-28 rounded-none bg-[#FAF9F6] text-black flex items-center justify-center hover:bg-[#FF6B00] hover:text-white transition-all group">
                   <Play size={32} md:size={36} fill="currentColor" className="ml-1" />
                 </button>
              </div>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#FF6B00]">{data.ctaTag}</p>
            </div>
          </section>
        );
      case 'contact':
        return (
          <section key="contact" id="contact-section" className="pt-16 md:pt-24 animate-fade-in scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
              <div className="space-y-10 md:space-y-12">
                <div className="space-y-4 md:space-y-6">
                  <h2 className="big-title text-white text-4xl md:text-6xl italic leading-[1.1] whitespace-pre-line">{data.contactTitle}</h2>
                  <div className="space-y-2">
                    <p className="text-lg md:text-xl font-bold text-white/60 whitespace-pre-line">{data.contactDescription}</p>
                  </div>
                </div>
                <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
                  <div className="flex items-center gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:border-[#FF6B00] transition-all"><Mail className="text-white/70 group-hover:text-white" size={20} md:size={24} /></div>
                    <div><p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5 md:mb-1">Email</p><p className="text-lg md:text-xl font-black tracking-tight text-white">{data.contactEmail}</p></div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:border-[#FF6B00] transition-all"><Smartphone className="text-white/70 group-hover:text-white" size={20} md:size={24} /></div>
                    <div><p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5 md:mb-1">Phone</p><p className="text-lg md:text-xl font-black tracking-tight text-white">{data.contactPhone}</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <form className="space-y-6 md:space-y-8 relative z-10" onSubmit={handleInquirySubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2 md:space-y-3"><label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50">이름</label><input type="text" required value={inquiryForm.name} onChange={e => setInquiryForm({...inquiryForm, name: e.target.value})} placeholder="홍길동" className="w-full bg-[#FAF9F6] text-black border-2 border-[#FAF9F6] px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg outline-none focus:border-[#FF6B00] transition-all" /></div>
                    <div className="space-y-2 md:space-y-3"><label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50">연락처</label><input type="text" value={inquiryForm.phone} onChange={e => setInquiryForm({...inquiryForm, phone: e.target.value})} placeholder="010-0000-0000" className="w-full bg-[#FAF9F6] text-black border-2 border-[#FAF9F6] px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg outline-none focus:border-[#FF6B00] transition-all" /></div>
                  </div>
                  <div className="space-y-2 md:space-y-3"><label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50">이메일</label><input type="email" value={inquiryForm.email} onChange={e => setInquiryForm({...inquiryForm, email: e.target.value})} placeholder="example@email.com" className="w-full bg-[#FAF9F6] text-black border-2 border-[#FAF9F6] px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg outline-none focus:border-[#FF6B00] transition-all" /></div>
                  <div className="space-y-2 md:space-y-3"><label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50">프로젝트 내용</label><textarea required value={inquiryForm.content} onChange={e => setInquiryForm({...inquiryForm, content: e.target.value})} placeholder="어떤 프로젝트를 구상 중이신가요?" className="w-full bg-[#FAF9F6] text-black border-2 border-[#FAF9F6] px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg h-32 md:h-40 outline-none focus:border-[#FF6B00] transition-all resize-none" /></div>
                  <button type="submit" className="btn-block w-full py-5 md:py-6 text-sm md:text-base">문의 보내기</button>
                </form>
              </div>
            </div>
          </section>
        );
      case 'footer_info':
        return (
          <div key="footer_info" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 pt-16 md:pt-24 border-t border-white/10">
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#FF6B00]">Quick Links</h4>
              <ul className="space-y-2 md:space-y-3 text-[11px] md:text-[12px] text-white/50 hover:text-white">
                {data.footerQuickLinks.map((link, i) => (
                  <li key={i} onClick={() => handleLinkClick(link.target)} className="transition-all cursor-pointer">{link.label}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#FF6B00]">Explore</h4>
              <ul className="space-y-2 md:space-y-3 text-[11px] md:text-[12px] text-white/50 hover:text-white">
                {data.footerExploreLinks.map((link, i) => (
                  <li key={i} onClick={() => handleLinkClick(link.target)} className="transition-all cursor-pointer">{link.label}</li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 space-y-4 md:space-y-6">
              <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#FF6B00]">{data.brandName.toUpperCase()} Labs Infrastructure</h4>
              <p className="text-xs md:text-sm text-white/50 leading-relaxed font-light">{data.footerInfo}</p>
              <div className="flex gap-4 md:gap-6">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-[#FF6B00] hover:border-[#FF6B00] hover:text-white cursor-pointer transition-all"><Globe size={14} /></div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-[#FF6B00] hover:border-[#FF6B00] hover:text-white cursor-pointer transition-all"><MessageSquare size={14} /></div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-24 md:space-y-48 animate-fade-in pb-20 md:pb-32">
      {data.sectionOrder.map(sectionId => renderSection(sectionId))}
      {!data.sectionOrder.includes('contact') && renderSection('contact')}
    </div>
  );
};

export default HomeView;
