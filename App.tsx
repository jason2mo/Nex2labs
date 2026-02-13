
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Key, ChevronDown, Shield, Layout, Settings, User, ShoppingBag, Mail } from 'lucide-react';
import { Product, Order, Customer, Admin, Session, ScopePost, HomeData, ScopeCategory, Inquiry } from './types';
import { STORAGE_KEYS, DEFAULT_HOME_DATA, DEFAULT_SCOPE_CATEGORIES } from './constants';
import Gateway from './components/Gateway';
import AdminView from './components/AdminView';
import CustomerView from './components/CustomerView';
import HomeView from './components/HomeView';
import ScopeDetailView from './components/ScopeDetailView';
import HomepageManagementView from './components/HomepageManagementView';
import InquiryManagementView from './components/InquiryManagementView';
import LoadingOverlay from './components/LoadingOverlay';
import TeamView from './components/TeamView';

// 'team' 뷰 추가
type ViewState = 'home' | 'scope_detail' | 'login' | 'dashboard' | 'collection' | 'homepage_mgmt' | 'inquiry_mgmt' | 'team';

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // 데이터 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [scopePosts, setScopePosts] = useState<ScopePost[]>([]);
  const [scopeCategories, setScopeCategories] = useState<ScopeCategory[]>(DEFAULT_SCOPE_CATEGORIES);
  const [homeData, setHomeData] = useState<HomeData>(DEFAULT_HOME_DATA);

  // 알림 계산
  const unreadInquiriesCount = inquiries.filter(i => !i.isRead).length;

  // 타이틀 업데이트
  useEffect(() => {
    document.title = `${homeData.brandName} | 시스템`;
  }, [homeData.brandName]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 초기 로드 및 세션 복구
  useEffect(() => {
    const p = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const o = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const c = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const a = localStorage.getItem(STORAGE_KEYS.ADMINS);
    const inq = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    const sp = localStorage.getItem(STORAGE_KEYS.SCOPE_POSTS);
    const sc = localStorage.getItem(STORAGE_KEYS.SCOPE_CATEGORIES);
    const hd = localStorage.getItem(STORAGE_KEYS.HOME_DATA);
    const sess = localStorage.getItem(STORAGE_KEYS.SESSION);
    
    if (p) setProducts(JSON.parse(p));
    if (o) setOrders(JSON.parse(o));
    if (c) setCustomers(JSON.parse(c));
    if (a) setAdmins(JSON.parse(a));
    if (inq) setInquiries(JSON.parse(inq));
    if (sp) setScopePosts(JSON.parse(sp));
    if (sc) setScopeCategories(JSON.parse(sc));
    if (hd) {
      const parsedData = JSON.parse(hd);
      setHomeData({ ...DEFAULT_HOME_DATA, ...parsedData }); // 신규 필드 누락 방지
    }
    
    if (sess) {
      try {
        const parsedSession = JSON.parse(sess);
        setSession(parsedSession);
        if (parsedSession.type === 'admin') {
          setCurrentView('dashboard');
        } else {
          setCurrentView('collection');
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
    
    setTimeout(() => setIsAppReady(true), 1200);
  }, []);

  // 상태 변경 시 로컬 스토리지 업데이트
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins)); }, [admins, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries)); }, [inquiries, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.SCOPE_POSTS, JSON.stringify(scopePosts)); }, [scopePosts, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.SCOPE_CATEGORIES, JSON.stringify(scopeCategories)); }, [scopeCategories, isAppReady]);
  useEffect(() => { if (isAppReady) localStorage.setItem(STORAGE_KEYS.HOME_DATA, JSON.stringify(homeData)); }, [homeData, isAppReady]);
  
  useEffect(() => { 
    if (isAppReady) {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
  }, [session, isAppReady]);

  // 페이지 이동 처리
  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setIsProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsProfileMenuOpen(false);
  };

  // 로그인 처리
  const handleLogin = (newSession: Session) => {
    setSession(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
    handleNavigate(newSession.type === 'admin' ? 'dashboard' : 'collection');
  };

  // 로그아웃 처리
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSession(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setIsProfileMenuOpen(false);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleSendInquiry = (name: string, contact: string, content: string) => {
    const newInquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      name,
      contact,
      content,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const formatPrice = useCallback((val: number | string) => Math.round(Number(val) || 0).toLocaleString(), []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    handleNavigate('scope_detail');
  };

  const renderContent = () => {
    const commonProps = {
      data: homeData,
      scopeCategories: scopeCategories,
      onNavigateToScope: () => scrollToSection('scope-section'),
      onNavigateToContact: () => scrollToSection('contact-section'),
      onNavigate: (view: string) => handleNavigate(view as ViewState),
      onSendInquiry: handleSendInquiry,
      onSelectCategory: handleCategorySelect
    };

    switch (currentView) {
      case 'home': return <HomeView {...commonProps} />;
      case 'scope_detail': return <ScopeDetailView categories={scopeCategories} categoryId={selectedCategory} posts={scopePosts} onBack={() => handleNavigate('home')} />;
      case 'team': return <TeamView data={homeData} onBack={() => handleNavigate('home')} />;
      case 'login': return <Gateway brandName={homeData.brandName} logo={homeData.logoImage} customers={customers} admins={admins} onLogin={handleLogin} />;
      case 'dashboard': 
        return session?.type === 'admin' ? (
          <AdminView 
            products={products} setProducts={setProducts} 
            orders={orders} setOrders={setOrders} 
            customers={customers} setCustomers={setCustomers} 
            admins={admins} setAdmins={setAdmins} 
            formatPrice={formatPrice} 
          />
        ) : <HomeView {...commonProps} />;
      case 'homepage_mgmt':
        return session?.type === 'admin' ? (
          <HomepageManagementView 
            homeData={homeData} setHomeData={setHomeData}
            scopePosts={scopePosts} setScopePosts={setScopePosts}
            scopeCategories={scopeCategories} setScopeCategories={setScopeCategories}
          />
        ) : <HomeView {...commonProps} />;
      case 'inquiry_mgmt':
        return session?.type === 'admin' ? (
          <InquiryManagementView inquiries={inquiries} setInquiries={setInquiries} />
        ) : <HomeView {...commonProps} />;
      case 'collection': 
        return session ? (
          <CustomerView session={session} products={products} orders={orders} setOrders={setOrders} formatPrice={formatPrice} />
        ) : <HomeView {...commonProps} />;
      default: return <HomeView {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-white selection:text-black text-white">
      {!isAppReady && <LoadingOverlay brandName={homeData.brandName} />}
      
      <nav className="bg-black border-b-2 border-white sticky top-0 z-50 px-10 h-24 flex justify-between items-center">
        <div className="flex items-center gap-12 h-full">
          <button 
            type="button" 
            onClick={() => handleNavigate('home')} 
            className="px-2 py-2 group hover:opacity-70 transition-all"
          >
             {homeData.logoImage ? (
               <img src={homeData.logoImage} className="h-10 object-contain" alt={homeData.brandName} />
             ) : (
               <div className="bg-white px-5 py-2 brutal-border shadow-sm group-hover:bg-neutral-200">
                  <h1 className="editorial-title text-xl leading-none text-black tracking-tighter transition-all uppercase">{homeData.brandName}</h1>
               </div>
             )}
          </button>
          
          <div className="hidden lg:flex gap-8 h-full items-center">
            {session && session.type === 'customer' && (
              <button type="button" onClick={() => handleNavigate('collection')} className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all h-full flex items-center border-b-2 ${currentView === 'collection' ? 'border-white opacity-100' : 'border-transparent opacity-30 hover:opacity-100'}`}>컬렉션</button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-8 h-full">
          {!session ? (
            <button type="button" onClick={() => handleNavigate('login')} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 font-black text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]">
              <Key size={14}/> {homeData.loginButtonText}
            </button>
          ) : (
            <div className="relative h-full flex items-center" ref={profileMenuRef}>
              <button 
                type="button" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-6 h-16 px-6 bg-white/5 border-0 outline-none hover:bg-white/10 transition-all rounded-full group active:scale-95 relative"
              >
                {session.type === 'admin' && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  </span>
                )}
                <div className="text-right">
                  <p className="editorial-title text-2xl italic leading-none text-white tracking-tighter uppercase group-hover:neo-gradient-text transition-all">{session.data?.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-30 mt-1">{session.type === 'admin' ? '시스템 관리자' : '인증된 고객'}</p>
                </div>
                <div className={`transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="opacity-40 group-hover:opacity-100" />
                </div>
              </button>

              {/* 통합 프로필/관리자 드롭다운 */}
              {isProfileMenuOpen && (
                <div className="absolute top-[85%] right-0 w-72 bg-black border-2 border-white shadow-[15px_15px_0_0_rgba(255,255,255,0.05)] mt-4 animate-fade-in z-[60] overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">인증 세션 정보</p>
                    <p className="text-xs font-bold truncate opacity-80 italic">CODE: {session.data?.code}</p>
                  </div>
                  
                  <div className="py-2">
                    {session.type === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleNavigate('dashboard')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white hover:text-black group ${currentView === 'dashboard' ? 'bg-white/10' : ''}`}
                        >
                          <Layout size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest">관리자 대시보드</span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">인벤토리 및 주문 관리</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleNavigate('homepage_mgmt')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white hover:text-black group ${currentView === 'homepage_mgmt' ? 'bg-white/10' : ''}`}
                        >
                          <Settings size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest">홈페이지 관리</span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">콘텐츠 및 브랜드 제어</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleNavigate('inquiry_mgmt')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white hover:text-black group relative ${currentView === 'inquiry_mgmt' ? 'bg-white/10' : ''}`}
                        >
                          <Mail size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                              문의 내역
                              {unreadInquiriesCount > 0 && (
                                <span className="bg-white text-black text-[8px] px-1.5 py-0.5 font-black rounded-full animate-bounce">NEW</span>
                              )}
                            </span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">고객 문의 및 비즈니스 요청</span>
                          </div>
                        </button>
                      </>
                    )}
                    
                    {session.type === 'customer' && (
                      <button 
                        onClick={() => handleNavigate('collection')}
                        className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white hover:text-black group ${currentView === 'collection' ? 'bg-white/10' : ''}`}
                      >
                        <ShoppingBag size={18} className="opacity-40 group-hover:opacity-100" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-widest">나의 컬렉션</span>
                          <span className="text-[8px] font-bold opacity-40 uppercase">주문 내역 및 입고 확인</span>
                        </div>
                      </button>
                    )}

                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-5 flex items-center gap-4 transition-all hover:bg-red-600 hover:text-white group"
                      >
                        <LogOut size={18} className="opacity-40 group-hover:opacity-100" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">시스템 로그아웃</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto p-12 w-full flex-1">
        {renderContent()}
      </main>

      <footer className="bg-black text-white h-16 flex items-center px-12 justify-between text-[10px] font-black tracking-[0.5em] uppercase border-t-2 border-white/10">
        <div className="flex items-center gap-12">
           <span className="flex items-center gap-3">
             <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></span> 
             {homeData.systemStatusText}
           </span>
        </div>
        <div className="hidden sm:block opacity-30 tracking-[0.2em]">
          {homeData.brandName.toUpperCase()}_LABS // © 2024 // LOCAL_DATABASE_SYNC
        </div>
      </footer>
    </div>
  );
};

export default App;
