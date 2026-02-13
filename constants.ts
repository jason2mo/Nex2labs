
export const MASTER_ADMIN_CODE = "0316";

export const STORAGE_KEYS = {
  PRODUCTS: 'nexto_labs_v6_products',
  ORDERS: 'nexto_labs_v6_orders',
  CUSTOMERS: 'nexto_labs_v6_customers',
  ADMINS: 'nexto_labs_v6_admins',
  INQUIRIES: 'nexto_labs_v6_inquiries',
  SCOPE_POSTS: 'nexto_labs_v6_scope_posts',
  SCOPE_CATEGORIES: 'nexto_labs_v6_scope_categories',
  HOME_DATA: 'nexto_labs_v6_home_data',
  SESSION: 'nexto_labs_v6_session'
};

export const HARSH_MESSAGES = [
  "인증 코드가 유효하지 않습니다.",
  "접근 권한이 거부되었습니다.",
  "올바른 인증 절차를 따르십시오.",
  "시스템 보안 위반 감지. 다시 입력하십시오.",
  "데이터베이스 접근을 위해서는 유효한 코드가 필요합니다."
];

export const DEFAULT_SCOPE_CATEGORIES = [
  { id: "infra", title: "데이터 인프라 구축", desc: "고성능 로컬 데이터베이스 아키텍처 설계 및 최적화된 엔진 배포" },
  { id: "security", title: "시스템 보안 강화", desc: "외부 접근의 물리적 차단 및 고강도 인증 프로토콜을 통한 보안 환경 조성" },
  { id: "monitoring", title: "실시간 모니터링", desc: "로컬 자원의 실시간 추적 및 데이터 정합성 보장을 위한 동기화 기술 지원" },
  { id: "global", title: "글로벌 확장성", desc: "로컬-퍼스트 전략을 유지하면서도 필요 시 안전한 외부 게이트웨이 연동 가이드" },
];

export const DEFAULT_HOME_DATA = {
  brandName: "NEXTO",
  logoImage: null,
  heroSmallTag: "Futuristic Infrastructure",
  mainTitle: "NEW DIGITAL\nUNIVERSE",
  description: "로컬 인프라의 새로운 기준. NexTo Labs는 데이터의 주권과 보안을 위해 독립적인 로컬 데이터베이스 프로토콜을 설계하고 구현합니다. 현실보다 더 리얼한 디지털 경험을 제공합니다.",
  heroImage: null,
  realityIndex: "47.2%",
  trustedCount: "20+",
  
  partnerLogos: [], 
  
  aboutSmallTag: "About Us",
  aboutTitle: "THE DIGITAL\nFRONTIER",
  aboutDescription: "우리는 현실과 디지털의 경계를 허무는 기술을 만듭니다. 강력한 로컬 데이터베이스와 보안 솔루션을 통해 안정적인 인프라를 경험하세요.",
  aboutTags: "Digital, Reality, Next",
  aboutImage: null,
  aboutCardText: "넥스토 랩스는 차세대 로컬 퍼스트 데이터를 지향합니다.",
  
  servicesTitle: "OUR SERVICE",
  services: [
    { title: "인프라 구축", desc: "차세대 로컬 데이터베이스 아키텍처를 설계하고 배포합니다." },
    { title: "데이터 보안", desc: "외부 위협으로부터 완벽하게 격리된 보안 솔루션을 제공합니다." },
    { title: "시스템 최적화", desc: "성능 한계를 넘어서는 고도화된 최적화 기술을 적용합니다." },
  ],
  
  testimonialsTitle: "VOICES OF THE\nFUTURE",
  testimonialsDescription: "넥스토 랩스와 함께 미래를 설계하는 파트너들의 생생한 목소리를 들어보세요.",
  testimonials: [
    { name: "James Rizaki", role: "CEO at Nexus", text: "NexTo Labs는 우리의 데이터 관리 방식을 완전히 혁신했습니다.", avatar: null },
    { name: "Samantha Leonardo", role: "Product Manager", text: "로컬 퍼스트 전략의 진정한 가치를 발견할 수 있는 유일한 솔루션입니다.", avatar: null },
    { name: "Mark Trevor", role: "Security Expert", text: "보안과 성능, 그 두 마리 토끼를 모두 잡은 완벽한 인프라입니다.", avatar: null },
  ],
  
  ctaTitle: "DIVE INTO THE\nFUTURE",
  ctaTag: "NexTo Labs. Infrastructure Protocol",
  ctaVideo: null, 

  contactTitle: "프로젝트를 함께\n시작해볼까요?",
  contactDescription: "당신의 아이디어가 넥스토 랩스를 만나면 현실이 됩니다.\n가벼운 문의라도 언제든 환영합니다.",
  contactEmail: "hello@nextolabs.com",
  contactPhone: "010-1234-5678",
  
  footerInfo: "미래를 선도하는 기술과 혁신적인 로컬 인프라 솔루션. 넥스토 랩스와 함께 새로운 디지털 시대를 경험하세요.",
  footerQuickLinks: [
    { label: "Home", target: "home" },
    { label: "About Us", target: "home" },
    { label: "Services", target: "scope" },
    { label: "Blog", target: "scope" }
  ],
  footerExploreLinks: [
    { label: "Product Demos", target: "scope" },
    { label: "Case Studies", target: "scope" },
    { label: "Testimonials", target: "home" }
  ],

  mgmtPreviewLabel: "PREVIEW",
  loginButtonText: "로그인",
  systemStatusText: "시스템 정상 작동 중",
  
  sectionOrder: ['hero', 'logos', 'about', 'scope', 'testimonials', 'cta', 'footer_info'],
  
  members: [
    { id: 'm1', name: '김넥스토', role: 'Chief Engineer', bio: '시스템 아키텍처 및 보안 전문가', image: null },
    { id: 'm2', name: '이랩스', role: 'Design Lead', bio: '사용자 경험 및 인터페이스 디자인 전문가', image: null }
  ],
  teamHeroTitle: "MEET OUR\nINNOVATORS",
  teamHeroDescription: "넥스토 랩스는 현실의 경계를 넘어서는 기술을 연구하는 전문가들로 구성되어 있습니다. 우리는 데이터 주권과 보안, 그리고 완벽한 인프라를 위해 헌신합니다."
};
