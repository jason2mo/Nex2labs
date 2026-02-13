
export interface Product {
  id: string;
  name: string;
  platform: string;
  priceInclTax: number;
  outboundDate: string;
  deadline: string;
  specialNotes: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  platform: string;
  customerName: string;
  customerCode: string;
  quantity: number;
  pricePerUnitInclTax: number;
  totalPriceInclTax: number;
  createdAt: string;
  paymentProof: string | null;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  contact: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ScopePost {
  id: string;
  category: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface ScopeCategory {
  id: string;
  title: string;
  desc: string;
}

export interface ServiceItem {
  title: string;
  desc: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  avatar: string | null;
}

export interface FooterLink {
  label: string;
  target: string; // ViewState 혹은 외부 URL
}

export interface MemberItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string | null;
}

export interface HomeData {
  // Brand
  brandName: string;
  logoImage: string | null;

  // Hero
  heroSmallTag: string;
  mainTitle: string;
  description: string;
  heroImage: string | null;
  realityIndex: string;
  trustedCount: string;
  
  // Logos
  partnerLogos: string[]; 
  
  // About
  aboutSmallTag: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutTags: string; // Comma separated
  aboutImage: string | null;
  aboutCardText: string; // 흰색 카드 문구
  
  // Services
  servicesTitle: string;
  services: ServiceItem[];
  
  // Testimonials
  testimonialsTitle: string;
  testimonialsDescription: string;
  testimonials: TestimonialItem[];
  
  // CTA Section
  ctaTitle: string;
  ctaTag: string;
  ctaVideo: string | null; 
  
  // Contact Section
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;

  // Footer
  footerInfo: string;
  footerQuickLinks: FooterLink[];
  footerExploreLinks: FooterLink[];

  // Management UI Labels
  mgmtPreviewLabel: string;
  loginButtonText: string;
  systemStatusText: string;

  // Ordering
  sectionOrder: string[]; 
  
  // Team
  members: MemberItem[];
  teamHeroTitle: string;
  teamHeroDescription: string;
}

export type UserType = 'admin' | 'customer';

export interface Session {
  type: UserType;
  data?: Customer | Admin;
}
