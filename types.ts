
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
  target: string;
}

export interface MemberItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string | null;
}

export interface HomeData {
  brandName: string;
  pageTitle: string;
  logoImage: string | null;
  logoBackgroundColor: string;
  heroSmallTag: string;
  heroSmallTagFontSize: string;
  mainTitle: string;
  mainTitleFontSize: string;
  description: string;
  descriptionFontSize: string;
  heroImage: string | null;
  realityIndex: string;
  trustedCount: string;
  partnerLogos: string[]; 
  aboutSmallTag: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutTags: string;
  aboutImage: string | null;
  aboutCardText: string;
  servicesTitle: string;
  servicesDescription: string;
  services: ServiceItem[];
  testimonialsTitle: string;
  testimonialsDescription: string;
  testimonials: TestimonialItem[];
  ctaTitle: string;
  ctaTag: string;
  ctaVideo: string | null; 
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;
  footerInfo: string;
  footerQuickLinks: FooterLink[];
  footerExploreLinks: FooterLink[];
  mgmtPreviewLabel: string;
  loadingSubtext: string;
  loginButtonText: string;
  loginButtonFontSize: string;
  systemStatusText: string;
  systemStatusFontSize: string;
  sectionOrder: string[]; 
  members: MemberItem[];
  teamHeroTitle: string;
  teamHeroDescription: string;
}

export type UserType = 'admin' | 'customer';

export interface Session {
  type: UserType;
  data?: Customer | Admin;
}
