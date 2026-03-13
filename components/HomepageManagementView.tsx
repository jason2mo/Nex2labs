
import React, { useState, useEffect } from 'react';
import { Settings, BookOpen, Trash2, Image as ImageIcon, PlusCircle, Monitor, Info, LayoutGrid, Users, Footprints, MousePointerClick, Briefcase, Plus, Command, Video, Play, GripVertical, Database, Shield, Zap, Globe, Key, User, Link as LinkIcon, Mail, Smartphone, ArrowRight, Clock, UserPlus, X, Check, Save, MessageSquare, Loader2, Upload } from 'lucide-react';
import { HomeData, ScopePost, ScopeCategory, TestimonialItem, FooterLink, MemberItem } from '../types';
import { STORAGE_KEYS } from '../constants';
import TeamView from './TeamView';

interface HomepageManagementViewProps {
  homeData: HomeData;
  setHomeData: React.Dispatch<React.SetStateAction<HomeData>>;
  scopePosts: ScopePost[];
  setScopePosts: React.Dispatch<React.SetStateAction<ScopePost[]>>;
  scopeCategories: ScopeCategory[];
  setScopeCategories: React.Dispatch<React.SetStateAction<ScopeCategory[]>>;
}

const HomepageManagementView: React.FC<HomepageManagementViewProps> = ({ homeData, setHomeData, scopePosts, setScopePosts, scopeCategories, setScopeCategories }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'members_mgmt' | 'posts_mgmt'>('home');
  const [homeSubTab, setHomeSubTab] = useState<string>('brand');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 포스트 작성을 위한 상태
  const [newPost, setNewPost] = useState<Partial<ScopePost>>({
    category: '',
    title: '',
    content: '',
    imageUrl: null
  });

  // 홈페이지 내부 섹션들
  const allSubTabs = [
    { id: 'brand', label: '브랜드', icon: Command, isSection: false },
    { id: 'hero', label: '히어로', icon: Monitor, isSection: true },
    { id: 'logos', label: '로고관리', icon: LayoutGrid, isSection: true },
    { id: 'about', label: '소개', icon: Info, isSection: true },
    { id: 'scope', label: '업무범위', icon: Briefcase, isSection: true },
    { id: 'testimonials', label: '리뷰', icon: Users, isSection: true },
    { id: 'cta', label: 'CTA', icon: MousePointerClick, isSection: true },
    { id: 'contact', label: '컨택트', icon: Mail, isSection: true },
    { id: 'footer_info', label: '푸터', icon: Footprints, isSection: true },
    { id: 'mgmt', label: 'UI 문구', icon: Settings, isSection: false }
  ];

  const [displayTabs, setDisplayTabs] = useState(() => {
    const order = homeData.sectionOrder || [];
    const sections = allSubTabs.filter(t => t.isSection);
    const nonSections = allSubTabs.filter(t => !t.isSection);
    const sortedSections = [...sections].sort((a, b) => {
      const aIdx = order.indexOf(a.id);
      const bIdx = order.indexOf(b.id);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
    return [
      ...nonSections.filter(t => t.id === 'brand'), 
      ...sortedSections, 
      ...nonSections.filter(t => t.id === 'mgmt')
    ];
  });

  const handleManualSave = () => {
    // 즉시 localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.HOME_DATA, JSON.stringify(homeData));
    localStorage.setItem(STORAGE_KEYS.SCOPE_POSTS, JSON.stringify(scopePosts));
    localStorage.setItem(STORAGE_KEYS.SCOPE_CATEGORIES, JSON.stringify(scopeCategories));
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      // 성공 메시지 표시 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 600);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    if (draggedItemIndex === null) return;
    const newList = [...displayTabs];
    const [movedItem] = newList.splice(draggedItemIndex, 1);
    newList.splice(targetIndex, 0, movedItem);
    setDisplayTabs(newList);
    const newSectionOrder = newList.filter(t => t.isSection).map(t => t.id);
    setHomeData(prev => ({ ...prev, sectionOrder: newSectionOrder }));
    setDraggedItemIndex(null);
  };

  const handleImgUpload = (setter: (val: string | null) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setter(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateHomeData = (updates: Partial<HomeData>) => setHomeData(prev => ({ ...prev, ...updates }));

  const handleSavePost = () => {
    const categoryId = newPost.category || (scopeCategories.length > 0 ? scopeCategories[0].id : '');
    if (!newPost.title || !newPost.content || !categoryId) {
      alert('제목, 내용, 카테고리를 확인해주세요.');
      return;
    }
    const post: ScopePost = {
      id: `sp_${Date.now()}`,
      category: categoryId,
      title: newPost.title as string,
      content: newPost.content as string,
      imageUrl: newPost.imageUrl || null,
      createdAt: new Date().toISOString(),
    };
    setScopePosts([post, ...scopePosts]);
    setNewPost({ category: categoryId, title: '', content: '', imageUrl: null });
    handleManualSave();
  };

  const deletePost = (postId: string) => {
    if (window.confirm('이 포스트를 삭제하시겠습니까?')) {
      setScopePosts(prev => prev.filter(p => p.id !== postId));
      handleManualSave();
    }
  };

  const tags = homeData.aboutTags.split(',').map(t => t.trim()).filter(Boolean);

  const renderEditor = () => {
    switch(homeSubTab) {
      case 'brand':
        return (
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-2">브랜드 이름 (사이트 전체 적용)</label>
              <input 
                value={homeData.brandName} 
                onChange={e => updateHomeData({ brandName: e.target.value.toUpperCase() })} 
                className="w-full bg-transparent border-b-2 border-white/20 p-3 text-lg font-black outline-none text-white focus:border-[#FF6B00] transition-all placeholder:text-white/40" 
                placeholder="NEXTO"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-2">페이지 제목 (브라우저 탭에 표시)</label>
              <input 
                value={homeData.pageTitle ?? ''} 
                onChange={e => updateHomeData({ pageTitle: e.target.value })} 
                className="w-full bg-transparent border-b-2 border-white/20 p-3 text-base font-bold outline-none text-white focus:border-[#FF6B00] transition-all placeholder:text-white/40" 
                placeholder="NEXTO | 시스템"
              />
              <p className="text-[9px] text-white/50 mt-1">탭/북마크에 보이는 이름입니다.</p>
            </div>
            <div className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">메인 로고 이미지</label>
                {homeData.logoImage && (
                  <button onClick={() => updateHomeData({ logoImage: null })} className="text-[9px] font-black text-red-400 uppercase">로고 삭제</button>
                )}
              </div>
              <label className="block w-full bg-white/5 border-2 border-dashed border-white/20 py-10 text-center cursor-pointer hover:bg-white/10 transition-all group overflow-hidden relative text-white">
                {homeData.logoImage ? (
                  <img src={homeData.logoImage} className="max-h-20 mx-auto object-contain" alt="Logo" />
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="mx-auto opacity-30" size={32}/>
                    <p className="text-[10px] font-black text-white/50">클릭하여 로고 업로드</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={e => handleImgUpload(img => updateHomeData({ logoImage: img }), e)} />
              </label>
              <div className="mt-6">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-3">로고 배경색</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'transparent', label: '투명', style: { background: 'linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%), linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px', backgroundColor: '#333' } },
                    { value: '#FAF9F6', label: '페이지배경' },
                    { value: '#000000', label: '검정' },
                    { value: '#FFFFFF', label: '흰색' },
                    { value: '#FF6B00', label: '오렌지' },
                    { value: '#1a1a1a', label: '다크그레이' },
                  ].map(({ value, label, style }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateHomeData({ logoBackgroundColor: value })}
                      className={`w-10 h-10 rounded-lg border-2 flex-shrink-0 transition-all ${(homeData.logoBackgroundColor ?? 'transparent') === value ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/50 scale-110' : 'border-white/20 hover:border-white/40'}`}
                      style={style || { backgroundColor: value }}
                      title={label}
                    >
                      {value === 'transparent' && (
                        <span className="text-[8px] font-black text-white/80 w-full h-full flex items-center justify-center">T</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/50 mt-2">선택: {homeData.logoBackgroundColor === 'transparent' ? '투명' : homeData.logoBackgroundColor}</p>
              </div>
            </div>
          </div>
        );
      case 'hero':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">히어로 메인 이미지</label>
              <label className="block w-full bg-white/5 border-2 border-dashed border-white/20 aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden group text-white">
                {homeData.heroImage ? (
                  <>
                    <img src={homeData.heroImage} className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all" alt="Hero Preview" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                       <p className="text-[10px] font-black uppercase tracking-widest">이미지 변경</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="mx-auto opacity-30" size={32}/>
                    <p className="text-[10px] font-black text-white/50">히어로 배경 이미지 업로드</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={e => handleImgUpload(img => updateHomeData({ heroImage: img }), e)} />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50">태그</label>
              <div className="flex items-center gap-2">
                <input value={homeData.heroSmallTag} onChange={e => updateHomeData({ heroSmallTag: e.target.value })} className="flex-1 bg-transparent border-b border-white/20 p-2 text-sm font-bold text-white placeholder:text-white/40" />
                <select value={homeData.heroSmallTagFontSize ?? '10'} onChange={e => updateHomeData({ heroSmallTagFontSize: e.target.value })} className="bg-white/10 border border-white/20 px-2 py-1 text-xs font-bold text-white">
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20].map(sz => <option key={sz} value={sz} className="bg-black text-white">{sz}px</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50">메인 타이틀</label>
              <div className="flex items-center gap-2">
                <textarea value={homeData.mainTitle} onChange={e => updateHomeData({ mainTitle: e.target.value })} className="flex-1 bg-transparent border-b border-white/20 p-2 text-sm font-black italic h-24 text-white placeholder:text-white/40" />
                <select value={homeData.mainTitleFontSize ?? '72'} onChange={e => updateHomeData({ mainTitleFontSize: e.target.value })} className="bg-white/10 border border-white/20 px-2 py-1 text-xs font-bold self-start text-white">
                  {[24, 32, 40, 48, 56, 64, 72, 80, 96, 120].map(sz => <option key={sz} value={sz} className="bg-black text-white">{sz}px</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50">설명 문구</label>
              <div className="flex items-center gap-2">
                <textarea value={homeData.description} onChange={e => updateHomeData({ description: e.target.value })} className="flex-1 bg-transparent border-b border-white/20 p-2 text-xs h-24 text-white placeholder:text-white/40" />
                <select value={homeData.descriptionFontSize ?? '16'} onChange={e => updateHomeData({ descriptionFontSize: e.target.value })} className="bg-white/10 border border-white/20 px-2 py-1 text-xs font-bold self-start text-white">
                  {[12, 14, 16, 18, 20, 22, 24].map(sz => <option key={sz} value={sz} className="bg-black text-white">{sz}px</option>)}
                </select>
              </div>
            </div>
          </div>
        );
      case 'logos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><label className="text-[10px] font-black text-white/50 uppercase">파트너 로고 리스트</label>
            <label className="bg-[#FAF9F6] text-black px-3 py-1 text-[10px] font-black cursor-pointer uppercase">Upload<input type="file" className="hidden" onChange={e => {
              const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => updateHomeData({ partnerLogos: [...homeData.partnerLogos, ev.target?.result as string] }); r.readAsDataURL(file);
            }} /></label></div>
            <div className="grid grid-cols-3 gap-3">
              {homeData.partnerLogos.map((l, i) => (
                <div key={i} className="relative group border border-white/20 p-2 bg-white/5 aspect-square flex items-center justify-center">
                  <img src={l} className="max-h-full max-w-full grayscale" alt={`Partner ${i}`} />
                  <button onClick={() => updateHomeData({ partnerLogos: homeData.partnerLogos.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white"><X size={10}/></button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-white/50">섹션 태그</label><input value={homeData.aboutSmallTag} onChange={e => updateHomeData({ aboutSmallTag: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-xs font-bold text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">타이틀</label><textarea value={homeData.aboutTitle} onChange={e => updateHomeData({ aboutTitle: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-sm font-black h-20 text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">설명</label><textarea value={homeData.aboutDescription} onChange={e => updateHomeData({ aboutDescription: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-xs h-32 text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">태그 (쉼표 구분)</label><input value={homeData.aboutTags} onChange={e => updateHomeData({ aboutTags: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-[11px] text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">소개 카드 문구 (검은색 박스)</label><textarea value={homeData.aboutCardText} onChange={e => updateHomeData({ aboutCardText: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-xs h-24 text-white placeholder:text-white/40" /></div>
            <div>
              <label className="text-[10px] font-black text-white/50 uppercase">소개 이미지</label>
              <label className="block w-full bg-white/5 border-2 border-dashed border-white/20 py-8 text-center cursor-pointer hover:bg-white/10 mt-2 text-white">
                {homeData.aboutImage ? <img src={homeData.aboutImage} className="max-h-24 mx-auto" alt="About" /> : <ImageIcon className="mx-auto opacity-20" />}
                <input type="file" className="hidden" onChange={e => handleImgUpload(img => updateHomeData({ aboutImage: img }), e)} />
              </label>
            </div>
          </div>
        );
      case 'scope':
        return (
          <div className="space-y-10">
            <div className="space-y-6 border-b border-white/20 pb-8">
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase block mb-2">섹션 메인 타이틀</label>
                <input 
                  value={homeData.servicesTitle} 
                  onChange={e => updateHomeData({ servicesTitle: e.target.value })} 
                  className="w-full bg-transparent border-b border-white/20 p-2 text-sm font-black italic outline-none text-white focus:border-[#FF6B00] transition-all placeholder:text-white/40" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase block mb-2">섹션 부제목 (설명)</label>
                <input 
                  value={homeData.servicesDescription} 
                  onChange={e => updateHomeData({ servicesDescription: e.target.value })} 
                  className="w-full bg-transparent border-b border-white/20 p-2 text-xs font-bold outline-none text-white focus:border-[#FF6B00] transition-all placeholder:text-white/40" 
                  placeholder="넥스투 랩스의 전문 업무 범위"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pb-4">
              <label className="text-[10px] font-black text-white/50 uppercase">업무 카테고리 설정</label>
              <button 
                onClick={() => setScopeCategories([...scopeCategories, { id: `cat_${Date.now()}`, title: '새 카테고리', desc: '설명을 입력하세요' }])}
                className="bg-[#FAF9F6] text-black px-3 py-1 text-[10px] font-black flex items-center gap-1.5"
              >
                <Plus size={12}/> ADD_CATEGORY
              </button>
            </div>
            
            <div className="space-y-8">
              {scopeCategories.map((c, i) => (
                <div key={c.id} className="p-5 bg-white/5 border border-white/20 relative group space-y-4">
                  <button onClick={() => setScopeCategories(scopeCategories.filter(x => x.id !== c.id))} className="absolute top-2 right-2 text-red-400 opacity-60 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                  <div>
                    <label className="text-[9px] font-black text-white/40 uppercase block mb-1">카테고리명</label>
                    <input 
                      value={c.title} 
                      onChange={e => {
                        const newList = [...scopeCategories];
                        newList[i].title = e.target.value;
                        setScopeCategories(newList);
                      }} 
                      className="w-full bg-transparent border-b border-white/20 text-[12px] font-black outline-none text-white focus:border-[#FF6B00] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/40 uppercase block mb-1">카테고리 설명</label>
                    <textarea 
                      value={c.desc} 
                      onChange={e => {
                        const newList = [...scopeCategories];
                        newList[i].desc = e.target.value;
                        setScopeCategories(newList);
                      }} 
                      className="w-full bg-transparent border-b border-white/20 text-[10px] h-16 outline-none text-white focus:border-[#FF6B00] transition-all resize-none placeholder:text-white/40" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="space-y-6">
            <div className="space-y-4 border-b border-white/20 pb-6">
              <label className="text-[10px] font-black text-white/50 uppercase block">섹션 설명 문구</label>
              <textarea 
                value={homeData.testimonialsDescription} 
                onChange={e => updateHomeData({ testimonialsDescription: e.target.value })} 
                className="w-full bg-transparent border-b border-white/20 p-2 text-xs h-20 outline-none text-white focus:border-[#FF6B00] placeholder:text-white/40" 
                placeholder="리뷰 섹션의 설명 문구를 입력하세요"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <label className="text-[10px] font-black text-white/50 uppercase">리뷰 리스트</label>
              <button onClick={() => updateHomeData({ testimonials: [...homeData.testimonials, { name: '이름', role: '직함', text: '리뷰 내용', avatar: null }] })} className="bg-[#FAF9F6] text-black px-3 py-1 text-[10px] font-black">ADD</button>
            </div>
            
            <div className="space-y-6">
              {homeData.testimonials.map((t, i) => (
                <div key={i} className="p-6 border border-white/20 space-y-4 bg-white/5 relative group">
                  <button onClick={() => updateHomeData({ testimonials: homeData.testimonials.filter((_, idx) => idx !== i) })} className="absolute top-2 right-2 text-red-400 opacity-60 group-hover:opacity-100"><Trash2 size={14}/></button>
                  
                  <div className="flex gap-6 items-start">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-white/40 uppercase block">아바타</label>
                      <div className="w-14 h-14 bg-white/10 border border-white/20 relative overflow-hidden flex items-center justify-center">
                        {t.avatar ? (
                          <img src={t.avatar} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <User size={24} className="opacity-30 text-white" />
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Upload size={16} className="text-white" />
                          <input type="file" className="hidden" onChange={e => handleImgUpload(img => {
                            const list = [...homeData.testimonials];
                            list[i].avatar = img;
                            updateHomeData({ testimonials: list });
                          }, e)} />
                        </label>
                      </div>
                      {t.avatar && (
                        <button onClick={() => {
                          const list = [...homeData.testimonials];
                          list[i].avatar = null;
                          updateHomeData({ testimonials: list });
                        }} className="text-[8px] font-black text-red-400 uppercase block">삭제</button>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <input value={t.name} onChange={e => { const list = [...homeData.testimonials]; list[i].name = e.target.value; updateHomeData({ testimonials: list }); }} className="w-full bg-transparent border-b border-white/20 text-[11px] font-black text-white placeholder:text-white/40" placeholder="성함" />
                      <input value={t.role} onChange={e => { const list = [...homeData.testimonials]; list[i].role = e.target.value; updateHomeData({ testimonials: list }); }} className="w-full bg-transparent border-b border-white/20 text-[10px] text-white/70 font-bold placeholder:text-white/40" placeholder="직함" />
                    </div>
                  </div>
                  
                  <textarea value={t.text} onChange={e => { const list = [...homeData.testimonials]; list[i].text = e.target.value; updateHomeData({ testimonials: list }); }} className="w-full bg-transparent border-b border-white/20 text-[10px] h-20 outline-none text-white placeholder:text-white/40" placeholder="리뷰 내용" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-white/50">CTA 타이틀</label><textarea value={homeData.ctaTitle} onChange={e => updateHomeData({ ctaTitle: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-sm font-black h-24 text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">CTA 하단 태그</label><input value={homeData.ctaTag} onChange={e => updateHomeData({ ctaTag: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-[10px] font-bold text-white placeholder:text-white/40" /></div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/50">배경 비디오 URL (MP4)</label>
              <input value={homeData.ctaVideo || ''} onChange={e => updateHomeData({ ctaVideo: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-[10px] text-white placeholder:text-white/40" placeholder="https://example.com/video.mp4" />
              <div className="bg-white/5 border border-white/20 p-4 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2"><Video size={12}/> Recommended Video Specs</p>
                <ul className="text-[8px] font-bold space-y-1 text-white/50 list-disc pl-4">
                  <li>Resolution: 1920x1080 (FHD) / 1280x720 (HD)</li>
                  <li>Aspect Ratio: 16:9 (Widescreen)</li>
                  <li>Format: MP4 (H.264 Codec)</li>
                  <li>File Size: Under 10MB for optimal performance</li>
                  <li>Tone: Darker or high-contrast videos work best</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-white/50">섹션 타이틀</label><input value={homeData.contactTitle} onChange={e => updateHomeData({ contactTitle: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 font-black text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">설명</label><textarea value={homeData.contactDescription} onChange={e => updateHomeData({ contactDescription: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-xs h-20 text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">이메일</label><input value={homeData.contactEmail} onChange={e => updateHomeData({ contactEmail: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white placeholder:text-white/40" /></div>
            <div><label className="text-[10px] font-black text-white/50">전화번호</label><input value={homeData.contactPhone} onChange={e => updateHomeData({ contactPhone: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white placeholder:text-white/40" /></div>
          </div>
        );
      case 'footer_info':
        return (
          <div className="space-y-10">
            <div><label className="text-[10px] font-black text-white/50">푸터 정보 텍스트</label><textarea value={homeData.footerInfo} onChange={e => updateHomeData({ footerInfo: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-xs h-32 text-white placeholder:text-white/40" /></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center"><label className="text-[10px] font-black text-white/50 uppercase">Quick Links</label><button onClick={() => updateHomeData({ footerQuickLinks: [...homeData.footerQuickLinks, { label: '새 링크', target: 'home' }] })} className="bg-[#FAF9F6] text-black px-2 py-0.5 text-[8px] font-black">ADD</button></div>
              {homeData.footerQuickLinks.map((link, i) => (
                <div key={i} className="space-y-2 bg-white/5 p-3 border border-white/20 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-white/50 font-black uppercase">Link {i+1}</span>
                    <button onClick={() => updateHomeData({ footerQuickLinks: homeData.footerQuickLinks.filter((_, idx) => idx !== i) })} className="text-red-400 opacity-60 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/40 uppercase">Label</label>
                      <input value={link.label} onChange={e => { const list = [...homeData.footerQuickLinks]; list[i].label = e.target.value; updateHomeData({ footerQuickLinks: list }); }} className="w-full bg-transparent text-[10px] font-bold border-b border-white/20 p-1 outline-none text-white focus:border-[#FF6B00]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/40 uppercase">URI / Target</label>
                      <input value={link.target} onChange={e => { const list = [...homeData.footerQuickLinks]; list[i].target = e.target.value; updateHomeData({ footerQuickLinks: list }); }} className="w-full bg-transparent text-[10px] font-bold border-b border-white/20 p-1 outline-none text-white focus:border-[#FF6B00]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center"><label className="text-[10px] font-black text-white/50 uppercase">Explore Links</label><button onClick={() => updateHomeData({ footerExploreLinks: [...homeData.footerExploreLinks, { label: '새 탐색', target: 'scope' }] })} className="bg-[#FAF9F6] text-black px-2 py-0.5 text-[8px] font-black">ADD</button></div>
              {homeData.footerExploreLinks.map((link, i) => (
                <div key={i} className="space-y-2 bg-white/5 p-3 border border-white/20 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-white/50 font-black uppercase">Link {i+1}</span>
                    <button onClick={() => updateHomeData({ footerExploreLinks: homeData.footerExploreLinks.filter((_, idx) => idx !== i) })} className="text-red-400 opacity-60 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/40 uppercase">Label</label>
                      <input value={link.label} onChange={e => { const list = [...homeData.footerExploreLinks]; list[i].label = e.target.value; updateHomeData({ footerExploreLinks: list }); }} className="w-full bg-transparent text-[10px] font-bold border-b border-white/20 p-1 outline-none text-white focus:border-[#FF6B00]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-white/40 uppercase">URI / Target</label>
                      <input value={link.target} onChange={e => { const list = [...homeData.footerExploreLinks]; list[i].target = e.target.value; updateHomeData({ footerExploreLinks: list }); }} className="w-full bg-transparent text-[10px] font-bold border-b border-white/20 p-1 outline-none text-white focus:border-[#FF6B00]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'mgmt':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/50">로그인 버튼</label>
              <div className="flex items-center gap-3">
                <input 
                  value={homeData.loginButtonText} 
                  onChange={e => updateHomeData({ loginButtonText: e.target.value })} 
                  className="flex-1 bg-transparent border-b border-white/20 p-2 text-xs font-bold text-white placeholder:text-white/40" 
                  placeholder="로그인"
                />
                <select 
                  value={homeData.loginButtonFontSize || '12'}
                  onChange={e => updateHomeData({ loginButtonFontSize: e.target.value })}
                  className="bg-white/10 border border-white/20 px-2 py-1 text-xs font-bold text-white"
                >
                  {[10, 11, 12, 13, 14, 15, 16, 18, 20].map(sz => (
                    <option key={sz} value={sz} className="bg-black text-white">{sz}px</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/50">시스템 상태</label>
              <div className="flex items-center gap-3">
                <input 
                  value={homeData.systemStatusText} 
                  onChange={e => updateHomeData({ systemStatusText: e.target.value })} 
                  className="flex-1 bg-transparent border-b border-white/20 p-2 text-xs font-bold text-white placeholder:text-white/40" 
                  placeholder="시스템 정상 작동 중"
                />
                <select 
                  value={homeData.systemStatusFontSize || '10'}
                  onChange={e => updateHomeData({ systemStatusFontSize: e.target.value })}
                  className="bg-white/10 border border-white/20 px-2 py-1 text-xs font-bold text-white"
                >
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(sz => (
                    <option key={sz} value={sz} className="bg-black text-white">{sz}px</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderPreview = () => {
    switch(homeSubTab) {
      case 'brand':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {homeData.logoImage ? <img src={homeData.logoImage} className="max-h-24 object-contain" alt="Logo" /> : <div className="bg-black px-10 py-5 brutal-border"><h1 className="editorial-title text-5xl text-[#FAF9F6] uppercase">{homeData.brandName}</h1></div>}
          </div>
        );
      case 'hero':
        return (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left py-12">
            <div className="lg:col-span-7 space-y-10">
              <span className="font-black tracking-[0.4em] uppercase opacity-40 border-l-2 border-black pl-4" style={{ fontSize: `${homeData.heroSmallTagFontSize || 10}px` }}>{homeData.heroSmallTag}</span>
              <h2 className="editorial-title italic leading-none neo-gradient-text whitespace-pre-line" style={{ fontSize: `${homeData.mainTitleFontSize || 72}px` }}>{homeData.mainTitle}</h2>
              <p className="opacity-40 leading-relaxed max-w-xl" style={{ fontSize: `${homeData.descriptionFontSize || 16}px` }}>{homeData.description}</p>
            </div>
            <div className="lg:col-span-5 relative hidden lg:block">
               <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-black/10 hero-image-mask relative bg-black/5">
                 <img src={homeData.heroImage || "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover grayscale" alt="Hero Preview" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent"></div>
               </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="grid grid-cols-2 gap-12 items-center text-left max-w-4xl mx-auto py-12 relative">
            <div className="relative aspect-[4/5] bg-black/5 brutal-border overflow-hidden">
              {homeData.aboutImage ? <img src={homeData.aboutImage} className="w-full h-full object-cover grayscale opacity-30" alt="About" /> : <div className="w-full h-full bg-black/5 flex items-center justify-center"><ImageIcon size={48} className="opacity-10"/></div>}
              <div className="absolute -bottom-6 -right-6 bg-black text-[#FAF9F6] p-8 rounded-2xl brutal-shadow z-20">
                <p className="text-[11px] font-bold leading-tight max-w-[140px]">{homeData.aboutCardText}</p>
              </div>
            </div>
            <div className="space-y-6">
               <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">{homeData.aboutSmallTag}</span>
               <h2 className="editorial-title text-5xl italic leading-none whitespace-pre-line">{homeData.aboutTitle}</h2>
               <div className="flex flex-wrap gap-2">{tags.map((t, i) => <span key={i} className="px-3 py-1 border border-black/20 text-[9px] font-black uppercase rounded-full">{t}</span>)}</div>
               <p className="text-sm opacity-40 leading-relaxed whitespace-pre-line">{homeData.aboutDescription}</p>
            </div>
          </div>
        );
      case 'logos':
        return (
          <div className="flex flex-col items-center gap-12 py-20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">{homeData.brandName.toUpperCase()}_PARTNERS</h3>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale max-w-3xl">
              {homeData.partnerLogos?.map((l, i) => <img key={i} src={l} className="h-8" alt={`Partner ${i}`} />)}
              {homeData.partnerLogos.length === 0 && <span className="text-[10px] font-black border border-black/10 px-4 py-2">NO_LOGOS_YET</span>}
            </div>
          </div>
        );
      case 'scope':
        return (
          <div className="w-full flex flex-col items-start text-left max-w-4xl mx-auto py-20">
            <div className="mb-10 w-full border-b border-black/10 pb-6">
              <h2 className="editorial-title text-5xl mb-4">{homeData.servicesTitle}</h2>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-40">{homeData.servicesDescription}</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-px bg-black/10 border border-black/10">
              {scopeCategories.map(s => (
                <div key={s.id} className="bg-[#FAF9F6] p-12 space-y-4 text-left">
                   <Database size={24} className="opacity-20" />
                   <h4 className="text-xl font-black italic uppercase tracking-tighter">{s.title}</h4>
                   <p className="text-[11px] opacity-40 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="w-full space-y-6 flex flex-col items-center max-w-2xl mx-auto py-20 text-left">
            <h2 className="editorial-title text-5xl mb-4 text-center italic">{homeData.testimonialsTitle}</h2>
            <p className="text-sm opacity-40 text-center mb-10">{homeData.testimonialsDescription}</p>
            {homeData.testimonials.map((t, i) => (
              <div key={i} className="bg-black/5 border border-black/10 p-10 w-full flex justify-between items-center group">
                <div className="space-y-4 flex-1 pr-6">
                  <p className="text-sm italic opacity-60 leading-relaxed">"{t.text}"</p>
                  <div><p className="font-bold text-sm">{t.name}</p><p className="text-[10px] opacity-30 uppercase">{t.role}</p></div>
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden border border-black/20 bg-[#FAF9F6] flex items-center justify-center shrink-0">
                  {t.avatar ? <img src={t.avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt={t.name} /> : <User size={24} className="opacity-20" />}
                </div>
              </div>
            ))}
          </div>
        );
      case 'cta':
        return (
          <div className="w-full text-center space-y-12 max-w-3xl mx-auto py-24 relative overflow-hidden rounded-[3rem] bg-[#FAF9F6] border border-black/10">
            {homeData.ctaVideo && <video src={homeData.ctaVideo} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-20" />}
            <div className="relative z-10 space-y-8">
              <h2 className="editorial-title text-6xl italic leading-none uppercase whitespace-pre-line">{homeData.ctaTitle}</h2>
              <div className="flex justify-center"><button className="w-20 h-20 rounded-full border-2 border-black/30 flex items-center justify-center"><Play size={28} fill="currentColor" /></button></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{homeData.ctaTag}</p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="w-full max-w-2xl text-left bg-black/5 p-16 brutal-border space-y-10 mx-auto py-20">
             <h2 className="editorial-title text-5xl italic whitespace-pre-line">{homeData.contactTitle}</h2>
             <p className="text-lg opacity-40 leading-relaxed">{homeData.contactDescription}</p>
             <div className="space-y-4 opacity-60 pt-6">
                <div className="flex items-center gap-4"><Mail size={16}/> {homeData.contactEmail}</div>
                <div className="flex items-center gap-4"><Smartphone size={16}/> {homeData.contactPhone}</div>
             </div>
          </div>
        );
      case 'footer_info':
        return (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 text-left py-12 px-4">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Quick Links</h4>
              <ul className="space-y-1.5 opacity-40 text-[10px] font-bold">
                {homeData.footerQuickLinks.map((l, i) => <li key={i}>{l.label}</li>)}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Explore</h4>
              <ul className="space-y-1.5 opacity-40 text-[10px] font-bold">
                {homeData.footerExploreLinks.map((l, i) => <li key={i}>{l.label}</li>)}
              </ul>
            </div>
            <div className="col-span-2 space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Company Info</h4>
              <p className="text-[10px] opacity-40 leading-relaxed font-medium">{homeData.footerInfo}</p>
              <div className="flex gap-4 opacity-30"><Globe size={14}/><MessageSquare size={14}/></div>
            </div>
          </div>
        );
      case 'mgmt':
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-8 py-20">
            <button 
              className="bg-black text-[#FAF9F6] px-10 py-4 font-black uppercase tracking-widest"
              style={{ fontSize: `${homeData.loginButtonFontSize || 12}px` }}
            >
              {homeData.loginButtonText}
            </button>
            <div 
              className="flex items-center gap-3 font-black uppercase tracking-[0.4em] opacity-30"
              style={{ fontSize: `${homeData.systemStatusFontSize || 10}px` }}
            >
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              {homeData.systemStatusText}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const updateMember = (id: string, updates: Partial<MemberItem>) => {
    setHomeData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in text-white">
      {/* 1. 좌측 메인 관리 메뉴 */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-black border border-white/20 p-8">
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => setActiveTab('home')} className={`w-full text-left p-6 font-black uppercase tracking-widest flex items-center gap-4 border-2 transition-all ${activeTab === 'home' ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-transparent border-white/20 text-white/60 hover:text-white'}`}><LayoutGrid size={18} /> 홈페이지 섹션</button>
            <button onClick={() => setActiveTab('members_mgmt')} className={`w-full text-left p-6 font-black uppercase tracking-widest flex items-center gap-4 border-2 transition-all ${activeTab === 'members_mgmt' ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-transparent border-white/20 text-white/60 hover:text-white'}`}><Users size={18} /> 팀원 관리</button>
            <button onClick={() => setActiveTab('posts_mgmt')} className={`w-full text-left p-6 font-black uppercase tracking-widest flex items-center gap-4 border-2 transition-all ${activeTab === 'posts_mgmt' ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-transparent border-white/20 text-white/60 hover:text-white'}`}><BookOpen size={18} /> 포스트 관리</button>
          </div>
        </div>

        {/* 하위 편집 도구 영역 */}
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 space-y-8">
          {activeTab === 'home' && (
            <div className="bg-black border border-white/20 p-8 space-y-8">
              <div className="grid grid-cols-2 gap-2">
                {displayTabs.map((t, idx) => (
                  <div key={t.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, idx)} className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-2 cursor-move transition-all ${homeSubTab === t.id ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'border-white/20 text-white/60 hover:text-white'}`}>
                    <div onClick={() => setHomeSubTab(t.id)} className="flex items-center gap-2 w-full"><GripVertical size={14} className="opacity-20" /><t.icon size={14} /> {t.label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 relative">
                {renderEditor()}
                <div className="mt-12 pt-8 border-t border-white/10">
                   <button 
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className="w-full bg-[#FAF9F6] text-black py-5 font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all hover:bg-[#e8e6e1] active:scale-95 disabled:opacity-50"
                   >
                     {isSaving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <Check className="text-green-600" size={16} /> : <Save size={16} />}
                     {isSaving ? '저장 중...' : saveSuccess ? '저장 완료!' : '현재 설정 저장하기'}
                   </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'members_mgmt' && (
            <div className="bg-black border border-white/20 p-8 space-y-12">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest border-b border-white/20 pb-4">팀 페이지 공통 문구 설정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-white/50 block mb-1">메인 타이틀</label>
                    <textarea value={homeData.teamHeroTitle} onChange={e => updateHomeData({ teamHeroTitle: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-[12px] font-black h-20 outline-none text-white" placeholder="메인 타이틀" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/50 block mb-1">설명 문구</label>
                    <textarea value={homeData.teamHeroDescription} onChange={e => updateHomeData({ teamHeroDescription: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-[10px] h-24 outline-none text-white" placeholder="설명" />
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest">TEAM_MEMBERS 리스트</h3>
                  <button onClick={() => setHomeData(prev => ({ ...prev, members: [...prev.members, { id: `m_${Date.now()}`, name: '새 멤버', role: '직함', bio: '소개글', image: null }] }))} className="bg-[#FAF9F6] text-black px-3 py-1 text-[10px] font-black">ADD_MEMBER</button>
                </div>
                <div className="space-y-6">
                  {homeData.members.map((m, i) => (
                    <div key={m.id} className="p-4 bg-white/5 border border-white/20 group relative space-y-4">
                      <button onClick={() => setHomeData(prev => ({ ...prev, members: prev.members.filter(x => x.id !== m.id) }))} className="absolute top-2 right-2 text-red-400 opacity-60 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                      <input value={m.name} onChange={e => updateMember(m.id, { name: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-[12px] font-black text-white" placeholder="이름" />
                      <input value={m.role} onChange={e => updateMember(m.id, { role: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-[10px] text-white/70 font-bold" placeholder="직함" />
                      <textarea value={m.bio} onChange={e => updateMember(m.id, { bio: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-[10px] h-16 resize-none text-white" placeholder="소개글" />
                      <div>
                        <label className="text-[9px] font-black text-white/50 block mb-1">멤버 이미지</label>
                        <input type="file" className="text-[9px] text-white/80" onChange={e => handleImgUpload(img => updateMember(m.id, { image: img }), e)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleManualSave} className="w-full bg-[#FAF9F6] text-black py-5 font-black text-[11px] uppercase tracking-widest mt-8">멤버 설정 저장하기</button>
            </div>
          )}
          {activeTab === 'posts_mgmt' && (
            <div className="space-y-10">
              <div className="bg-black border border-white/20 p-8 space-y-6">
                 <h3 className="text-[11px] font-black uppercase tracking-widest border-b border-white/20 pb-4">새 포스트 작성</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[9px] font-black text-white/50 block mb-1">카테고리 선택</label>
                     <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full bg-white/10 border border-white/20 p-3 text-[11px] font-bold outline-none text-white">
                       <option value="">카테고리를 선택하세요</option>
                       {scopeCategories.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.title}</option>)}
                     </select>
                   </div>
                   <input placeholder="포스트 제목" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2 text-xs font-bold text-white placeholder:text-white/40" />
                   <textarea placeholder="포스트 내용" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2 text-xs h-32 text-white placeholder:text-white/40" />
                   <div className="space-y-2">
                     <label className="block text-[9px] font-black text-white/50">이미지 첨부</label>
                     <input type="file" className="text-[10px] text-white/80" onChange={e => handleImgUpload(img => setNewPost({...newPost, imageUrl: img}), e)} />
                   </div>
                   <button onClick={handleSavePost} className="w-full bg-[#FAF9F6] text-black py-4 font-black text-xs uppercase tracking-widest hover:bg-[#e8e6e1]">포스트 저장</button>
                 </div>
              </div>
              <div className="bg-black border border-white/20 p-8 space-y-6">
                 <h3 className="text-[11px] font-black uppercase tracking-widest border-b border-white/20 pb-4">등록된 포스트 목록</h3>
                 <div className="space-y-3">
                   {scopePosts.map(p => {
                     const cat = scopeCategories.find(c => c.id === p.category);
                     return (
                       <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                         <div className="truncate">
                           <p className="text-[8px] font-black text-white/50 uppercase mb-1">{cat?.title || 'Unknown'}</p>
                           <span className="text-[11px] font-bold italic text-white">{p.title}</span>
                         </div>
                         <button onClick={() => deletePost(p.id)} className="text-red-400 opacity-60 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                       </div>
                     );
                   })}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 우측 실시간 미리보기 */}
      <div className="lg:col-span-8 space-y-10">
        <div className="bg-black border-2 border-white/20 min-h-[750px] p-12 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="border-b border-white/20 pb-6 mb-12 flex justify-between items-center">
             <h3 className="editorial-title text-4xl italic uppercase text-white">
               PREVIEW: {activeTab === 'home' ? homeSubTab : activeTab === 'members_mgmt' ? 'TEAM_PAGE' : 'POSTS'}
             </h3>
             <div className="flex items-center gap-4">
                {saveSuccess && <span className="text-[9px] font-black text-green-400 animate-pulse">CHANGES_SAVED_LOCALLY</span>}
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Live Visualizer</span>
             </div>
          </div>

          <div className="animate-fade-in text-center p-16 border border-white/10 bg-white/5 min-h-[550px] rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden">
             {activeTab === 'home' ? renderPreview() : activeTab === 'members_mgmt' ? (
                <div className="w-full scale-[0.6] origin-top">
                  <TeamView data={homeData} onBack={() => {}} />
                </div>
             ) : (
               <div className="w-full text-left space-y-6 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
                 {scopePosts.length === 0 ? (
                   <div className="py-20 text-center text-white/40 italic space-y-4">
                     <BookOpen size={48} className="mx-auto opacity-50" />
                     <p className="text-[12px] font-black uppercase tracking-widest">등록된 포스트가 없습니다.</p>
                   </div>
                 ) : (
                   scopePosts.map((post) => {
                     const cat = scopeCategories.find(c => c.id === post.category);
                     return (
                       <article key={post.id} className="p-6 border border-white/10 bg-white/5 rounded-xl space-y-3 group">
                         <div className="flex items-center gap-3 text-[9px] font-black text-[#FF6B00] uppercase tracking-widest">
                           <Clock size={12} />
                           {cat?.title ?? post.category} · {new Date(post.createdAt).toLocaleDateString()}
                         </div>
                         <h3 className="text-lg font-black uppercase italic text-white">{post.title}</h3>
                         {post.imageUrl && (
                           <div className="w-full h-32 overflow-hidden rounded-lg border border-white/20">
                             <img src={post.imageUrl} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="" />
                           </div>
                         )}
                         <p className="text-sm text-white/70 leading-relaxed line-clamp-3">{post.content}</p>
                       </article>
                     );
                   })
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageManagementView;
