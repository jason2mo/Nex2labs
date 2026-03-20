
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Key, ChevronDown, Layout, Settings, User, ShoppingBag, Mail, RefreshCw } from 'lucide-react';
import { Product, Order, Customer, Admin, Session, ScopePost, HomeData, ScopeCategory, Inquiry } from './types';
import { DEFAULT_HOME_DATA, DEFAULT_SCOPE_CATEGORIES, STORAGE_KEYS, MASTER_ADMIN_CODE } from './constants';
import Gateway from './components/Gateway';
import AdminView from './components/AdminView';
import CustomerView from './components/CustomerView';
import HomeView from './components/HomeView';
import ScopeDetailView from './components/ScopeDetailView';
import HomepageManagementView from './components/HomepageManagementView';
import InquiryManagementView from './components/InquiryManagementView';
import LoadingOverlay from './components/LoadingOverlay';
import TeamView from './components/TeamView';
import { fetchPublicData, loadFromLocalStorage, saveToLocalStorage, setupAutoClearOnClose, getStoredToken, saveAdminsToRepo, clearAllData } from './services/dataService';
import { STORAGE_KEYS } from './constants';

type ViewState = 'home' | 'scope_detail' | 'login' | 'dashboard' | 'collection' | 'homepage_mgmt' | 'inquiry_mgmt' | 'team';

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const restoredSessionRef = useRef(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [scopePosts, setScopePosts] = useState<ScopePost[]>([]);
  const [scopeCategories, setScopeCategories] = useState<ScopeCategory[]>(DEFAULT_SCOPE_CATEGORIES);
  const [homeData, setHomeData] = useState<HomeData>(DEFAULT_HOME_DATA);

  const unreadInquiriesCount = inquiries.filter(i => !i.isRead).length;

  // GitHub 자동 동기화
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [adminsSyncError, setAdminsSyncError] = useState<string | null>(null);

  // 下拉刷新状态
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'triggered' | 'refreshing'>('idle');
  const pullStartY = useRef<number>(0);
  const pullDeltaY = useRef<number>(0);
  const pullIndicatorRef = useRef<HTMLDivElement>(null);

  // 关闭网页时自动清除缓存
  useEffect(() => {
    setupAutoClearOnClose();
  }, []);

  // 下拉刷新：清空缓存并从 GitHub 获取最新数据
  useEffect(() => {
    const TRIGGER_THRESHOLD = 90;
    // 电脑端滚轮在顶部向上滚的计数器
    const wheelUpCountRef = { count: 0, timer: 0 as ReturnType<typeof setTimeout> | 0 };

    const doRefresh = async () => {
      setPullState('refreshing');
      clearAllData();
      setHomeData(DEFAULT_HOME_DATA);
      setScopePosts([]);
      setScopeCategories(DEFAULT_SCOPE_CATEGORIES);
      try {
        const data = await fetchPublicData();
        if (data?.homeData) setHomeData(data.homeData);
        if (data?.scopePosts) setScopePosts(data.scopePosts);
        if (data?.scopeCategories) setScopeCategories(data.scopeCategories);
      } catch {}
      setPullState('idle');
    };

    const showIndicator = (progress: number) => {
      if (pullIndicatorRef.current) {
        pullIndicatorRef.current.style.transform = `translateY(${Math.min(progress * TRIGGER_THRESHOLD * 0.5, TRIGGER_THRESHOLD * 0.5)}px)`;
        pullIndicatorRef.current.style.opacity = String(progress);
      }
    };

    const resetIndicator = () => {
      if (pullIndicatorRef.current) {
        pullIndicatorRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        pullIndicatorRef.current.style.transform = 'translateY(0)';
        pullIndicatorRef.current.style.opacity = '0';
      }
    };

    const onWheel = (e: WheelEvent) => {
      // 仅在顶部 + 向上滚动时触发
      if (window.scrollY !== 0 || e.deltaY >= 0) {
        wheelUpCountRef.count = 0;
        if (window.scrollY > 0 && pullState !== 'idle' && pullState !== 'refreshing') setPullState('idle');
        return;
      }
      if (pullState === 'refreshing') return;

      wheelUpCountRef.count++;
      clearTimeout(wheelUpCountRef.timer);
      wheelUpCountRef.timer = setTimeout(() => { wheelUpCountRef.count = 0; resetIndicator(); }, 2000);

      const progress = Math.min(wheelUpCountRef.count / 2, 1);
      setPullState(progress >= 1 ? 'triggered' : 'pulling');
      showIndicator(progress);

      if (wheelUpCountRef.count >= 2) {
        resetIndicator();
        wheelUpCountRef.count = 0;
        clearTimeout(wheelUpCountRef.timer);
        doRefresh();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pullStartY.current = e.touches[0].clientY;
        pullDeltaY.current = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pullStartY.current === 0) return;
      const delta = e.touches[0].clientY - pullStartY.current;
      if (delta > 0) {
        pullDeltaY.current = delta;
        const progress = Math.min(delta / TRIGGER_THRESHOLD, 1);
        setPullState(progress >= 1 ? 'triggered' : 'pulling');
        showIndicator(progress);
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (pullState === 'idle') return;
      const delta = pullDeltaY.current;
      resetIndicator();

      if (delta >= TRIGGER_THRESHOLD) {
        pullStartY.current = 0;
        pullDeltaY.current = 0;
        doRefresh();
        return;
      }

      pullStartY.current = 0;
      pullDeltaY.current = 0;
      setTimeout(() => {
        if (pullIndicatorRef.current) pullIndicatorRef.current.style.transition = '';
        setPullState('idle');
      }, 400);
    };

    const onScroll = () => {
      if (window.scrollY > 0) {
        wheelUpCountRef.count = 0;
        pullStartY.current = 0;
        if (pullState !== 'idle' && pullState !== 'refreshing') setPullState('idle');
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pullState]);

  useEffect(() => {
    if (!isAppReady) return;

    // 自动从 GitHub 公开获取数据（无需 Token）
    const doSync = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const data = await fetchPublicData();
        if (data?.homeData) {
          setHomeData(data.homeData);
          saveToLocalStorage({ homeData: data.homeData, scopePosts, scopeCategories });
        }
        if (data?.scopePosts) {
          setScopePosts(data.scopePosts);
          saveToLocalStorage({ homeData, scopePosts: data.scopePosts, scopeCategories });
        }
        if (data?.scopeCategories) {
          setScopeCategories(data.scopeCategories);
          saveToLocalStorage({ homeData, scopePosts, scopeCategories: data.scopeCategories });
        }
        if (data?.admins !== undefined) {
          setAdmins(prev => {
            const remote = data.admins as Admin[];
            if (remote.length > 0) return remote;
            if (prev.length > 0) return prev;
            return remote;
          });
        }
      } catch (err) {
        console.warn('同步失败，使用本地数据:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    doSync();
  }, [isAppReady]);

  useEffect(() => {
    document.title = homeData.pageTitle || `${homeData.brandName} | 시스템`;
  }, [homeData.brandName, homeData.pageTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const sess = localStorage.getItem('nexto_labs_v6_session');
    
    // 从 localStorage 加载数据
    const savedData = loadFromLocalStorage();
    setHomeData(savedData.homeData);
    setScopePosts(savedData.scopePosts);
    setScopeCategories(savedData.scopeCategories);

    const adminsRaw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (adminsRaw) {
      try {
        setAdmins(JSON.parse(adminsRaw) as Admin[]);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.ADMINS);
      }
    }

    // 清理旧数据（不清理 session、admins）
    const oldKeys = [
      'nexto_labs_v6_products',
      'nexto_labs_v6_orders',
      'nexto_labs_v6_customers',
      'nexto_labs_v6_inquiries',
    ];
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    if (sess) {
      try {
        const parsedSession = JSON.parse(sess) as Session;
        // 마스터 세션은 저장된 code가 예전 값일 수 있음 → 항상 현재 MASTER_ADMIN_CODE 로 표시
        if (parsedSession.type === 'admin' && parsedSession.data?.id === 'master') {
          parsedSession.data = { ...parsedSession.data, code: MASTER_ADMIN_CODE };
        }
        setSession(parsedSession);
        restoredSessionRef.current = true;
      } catch (e) {
        localStorage.removeItem('nexto_labs_v6_session');
      }
    }
    
    // 版本检测：每次构建后自动清除旧缓存
    const savedVersion = localStorage.getItem('nexto_labs_v6_version');
    const currentVersion = __APP_VERSION__;
    if (savedVersion && savedVersion !== currentVersion) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nexto_labs_v6_')) localStorage.removeItem(key);
      });
    }
    localStorage.setItem('nexto_labs_v6_version', currentVersion);
    
    setTimeout(() => setIsAppReady(true), 1200);
  }, []);

  // 从本地恢复 session 后强制进入主界面（仅执行一次）
  useEffect(() => {
    if (session && restoredSessionRef.current) {
      setCurrentView('home');
      restoredSessionRef.current = false;
    }
  }, [session]);

  useEffect(() => { if (isAppReady) saveToLocalStorage({ homeData, scopePosts, scopeCategories }); }, [homeData, scopePosts, scopeCategories, isAppReady]);

  useEffect(() => {
    if (isAppReady) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    }
  }, [admins, isAppReady]);

  // 管理员列表变更时同步到 GitHub
  const handleAdminsChange = useCallback((list: Admin[]) => {
    const token = getStoredToken();
    if (!token) {
      setAdminsSyncError('GitHub Token이 설정되지 않았습니다. 관리자 설정에서 Token을 입력해주세요.');
      return;
    }
    setAdminsSyncError(null);
    saveAdminsToRepo(list, token).then(result => {
      if (!result.success) setAdminsSyncError(`GitHub 동기화 실패: ${result.error || '알 수 없는 오류'}`);
    });
  }, []);

  useEffect(() => {  
    if (isAppReady) {
      if (session) {
        localStorage.setItem('nexto_labs_v6_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('nexto_labs_v6_session');
      }
    }
  }, [session, isAppReady]);

  // 중앙 삭제 처리 함수
  const handleDeleteItem = useCallback((type: 'products' | 'orders' | 'customers' | 'admins', id: string) => {
    if (type === 'admins' && session?.data.id !== 'master') {
      alert('일반 관리자는 다른 관리자를 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm('항목을 삭제하시겠습니까?')) return;
    
    switch (type) {
      case 'products': setProducts(prev => prev.filter(p => String(p.id) !== String(id))); break;
      case 'orders': setOrders(prev => prev.filter(o => String(o.id) !== String(id))); break;
      case 'customers': setCustomers(prev => prev.filter(c => String(c.id) !== String(id))); break;
      case 'admins': setAdmins(prev => {
        const next = prev.filter(a => String(a.id) !== String(id));
        handleAdminsChange(next);
        return next;
      }); break;
    }
  }, [session]);

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

  const handleLogin = (newSession: Session) => {
    setSession(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
    handleNavigate('home');
  };

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
      case 'login': return <Gateway brandName={homeData.brandName} logo={homeData.logoImage || '/logo.png'} logoBackgroundColor={homeData.logoBackgroundColor ?? 'transparent'} customers={customers} admins={admins} onLogin={handleLogin} />;
      case 'dashboard': 
        return session?.type === 'admin' ? (
          <AdminView 
            admins={admins} setAdmins={setAdmins} 
            onDeleteItem={handleDeleteItem}
            onAdminsPersist={handleAdminsChange}
            syncError={adminsSyncError}
            onClearSyncError={() => setAdminsSyncError(null)}
            isMaster={session?.data.id === 'master'}
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
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white text-white">
      {/* 下拉刷新指示器 */}
      <div
        ref={pullIndicatorRef}
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center pointer-events-none"
        style={{ transform: 'translateY(0)', opacity: 0, transition: 'transform 0.3s ease, opacity 0.3s ease' }}
      >
        <div className="flex flex-col items-center gap-1 pt-4">
          {pullState === 'triggered' || pullState === 'refreshing' ? (
            <RefreshCw size={20} className="text-[#FF6B00] animate-spin" />
          ) : (
            <div className="w-5 h-5 border-2 border-[#FF6B00]/60 border-t-[#FF6B00] rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
          )}
          <span className="text-[9px] font-black text-[#FF6B00]/80 uppercase tracking-widest">
            {pullState === 'triggered' ? 'RELEASE TO REFRESH' : pullState === 'refreshing' ? 'REFRESHING...' : 'SCROLL UP'}
          </span>
        </div>
      </div>

      {!isAppReady && <LoadingOverlay brandName={homeData.brandName} logoImage={homeData.logoImage} loadingLogo={homeData.loadingLogo} loadingSubtext={homeData.loadingSubtext} />}
      
      <nav className="bg-black border-b border-white/20 sticky top-0 z-50 px-4 md:px-10 h-20 md:h-24 flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-12 h-full">
          <button 
            type="button" 
            onClick={() => handleNavigate('home')} 
            className="px-2 py-2 flex items-center shrink-0 overflow-hidden"
          >
             {(homeData.logoBackgroundColor ?? 'transparent') !== 'transparent' ? (
              <div className="px-2 py-1 inline-block max-h-[34px] flex items-center" style={{ backgroundColor: homeData.logoBackgroundColor }}>
                <img 
                  src={homeData.logoImage || '/logo.png'} 
                  className="h-[26px] md:h-[34px] max-w-[125px] md:max-w-[159px] w-auto object-contain object-left shrink-0" 
                  style={{ maxHeight: 34, maxWidth: 159 }} 
                  alt={homeData.brandName}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const url = img.src;
                    if (url.includes('raw.githubusercontent.com') && !url.includes('?')) {
                      img.src = `${url}?t=${Date.now()}`;
                    }
                  }}
                />
              </div>
            ) : (
              <img 
                src={homeData.logoImage || '/logo.png'} 
                className="h-[26px] md:h-[34px] max-w-[125px] md:max-w-[159px] w-auto object-contain object-left shrink-0" 
                style={{ maxHeight: 34, maxWidth: 159 }} 
                alt={homeData.brandName}
                onError={(e) => {
                  const img = e.currentTarget;
                  const url = img.src;
                  if (url.includes('raw.githubusercontent.com') && !url.includes('?')) {
                    img.src = `${url}?t=${Date.now()}`;
                  }
                }}
              />
            )}
          </button>
          
          <div className="hidden lg:flex gap-8 h-full items-center">
            {session && session.type === 'customer' && (
              <button type="button" onClick={() => handleNavigate('collection')} className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all h-full flex items-center border-b-2 text-white ${currentView === 'collection' ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>컬렉션</button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 h-full">
          {!session ? (
            <button type="button" onClick={() => handleNavigate('login')} className="btn-block flex items-center gap-2 px-4 md:px-7 py-2.5 md:py-3.5" style={{ fontSize: `${homeData.loginButtonFontSize || 12}px` }}>
              <Key size={14}/> <span className="hidden xs:inline">{homeData.loginButtonText}</span><span className="xs:hidden">LOGIN</span>
            </button>
          ) : (
            <div className="relative h-full flex items-center" ref={profileMenuRef}>
              <button 
                type="button" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 md:gap-6 h-12 md:h-16 px-3 md:px-6 bg-white/10 border-0 outline-none hover:bg-white/20 transition-all rounded-full group active:scale-95 relative"
              >
                {session.type === 'admin' && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  </span>
                )}
                <div className="text-right hidden sm:block">
                  <p className="editorial-title text-xl md:text-2xl italic leading-none text-white tracking-tighter uppercase group-hover:opacity-90 transition-all">{session.data?.name}</p>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-white/60 mt-1">{session.type === 'admin' ? '시스템 관리자' : '인증된 고객'}</p>
                </div>
                <div className="sm:hidden w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <div className={`transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} md:size={20} className="text-white opacity-60 group-hover:opacity-100" />
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-[85%] right-0 w-64 md:w-72 bg-black border-2 border-white/20 shadow-[15px_15px_0_0_rgba(255,107,0,0.2)] mt-4 animate-fade-in z-[60] overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">인증 세션 정보</p>
                    <p className="text-xs font-bold truncate text-white/80 italic">CODE: {session.data?.code}</p>
                  </div>
                  
                  <div className="py-2 text-white">
                    {session.type === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleNavigate('homepage_mgmt')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/10 group ${currentView === 'homepage_mgmt' ? 'bg-[#FF6B00]/20' : ''}`}
                        >
                          <Settings size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest">홈페이지 관리</span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">콘텐츠 및 브랜드 제어</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleNavigate('dashboard')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/10 group ${currentView === 'dashboard' ? 'bg-[#FF6B00]/20' : ''}`}
                        >
                          <Layout size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest">관리자 대시보드</span>
                            <span className="text-[8px] font-bold opacity-40 uppercase">인벤토리 및 주문 관리</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleNavigate('inquiry_mgmt')}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/10 group relative ${currentView === 'inquiry_mgmt' ? 'bg-[#FF6B00]/20' : ''}`}
                        >
                          <Mail size={18} className="opacity-40 group-hover:opacity-100" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                              문의 내역
                              {unreadInquiriesCount > 0 && (
                                <span className="bg-[#FF6B00] text-white text-[8px] px-1.5 py-0.5 font-black rounded-full animate-bounce">NEW</span>
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
                        className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-white/10 group ${currentView === 'collection' ? 'bg-[#FF6B00]/20' : ''}`}
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

      <main className="max-w-[1500px] mx-auto p-4 md:p-12 w-full flex-1">
        {isSyncing && (
          <div className="fixed bottom-6 right-6 bg-black border border-[#FF6B00]/40 px-5 py-3 flex items-center gap-3 z-50 shadow-[5px_5px_0_0_rgba(255,107,0,0.3)] animate-fade-in">
            <RefreshCw size={14} className="text-[#FF6B00] animate-spin" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">GitHub에서 데이터 동기화 중...</span>
          </div>
        )}
        {syncError && (
          <div className="fixed bottom-6 right-6 bg-black border border-red-500/40 px-5 py-3 z-50 shadow-[5px_5px_0_0_rgba(255,0,0,0.2)] animate-fade-in max-w-xs">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">GitHub 동기화 실패</p>
            <p className="text-[9px] text-white/50 mt-1">{syncError}</p>
          </div>
        )}
        {renderContent()}
      </main>

      <footer className="bg-black text-white py-6 md:h-16 flex flex-col md:flex-row items-center px-6 md:px-12 justify-between text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase border-t border-white/10 gap-4">
        <div className="flex items-center gap-6 md:gap-12">
           <span className="flex items-center gap-3" style={{ fontSize: `${homeData.systemStatusFontSize || 10}px` }}>
             <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF6B00] rounded-full animate-pulse shadow-[0_0_8px_#FF6B00]"></span> 
             {homeData.systemStatusText}
           </span>
        </div>
        <div className="text-white/50 tracking-[0.2em] text-center md:text-right">
          {homeData.brandName.toUpperCase()}_LABS // © 2024 // LOCAL_DATABASE_SYNC
        </div>
      </footer>
    </div>
  );
};

export default App;
