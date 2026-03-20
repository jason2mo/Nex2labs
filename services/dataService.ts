// 数据存储服务 - 统一管理所有数据
// 数据存储在 data/ 文件夹中

import { HomeData, ScopePost, ScopeCategory } from '../types';
import { DEFAULT_HOME_DATA, DEFAULT_SCOPE_CATEGORIES } from '../constants';

// GitHub 配置
export const GITHUB_CONFIG = {
  owner: 'jason2mo',
  repo: 'Nex2labs',
  branch: 'main',
  dataPath: 'data',
  homeFile: 'home.json',
  postsFile: 'posts.json',
  categoriesFile: 'categories.json',
  imagePath: 'images',
};

const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}`;
const DATA_BASE = `${RAW_BASE}/${GITHUB_CONFIG.dataPath}`;
const IMG_BASE = `${RAW_BASE}/${GITHUB_CONFIG.imagePath}`;
const API_BASE = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;

// 存储键
const STORAGE_KEYS = {
  HOME_DATA: 'nexto_labs_v6_home_data',
  SCOPE_POSTS: 'nexto_labs_v6_scope_posts',
  SCOPE_CATEGORIES: 'nexto_labs_v6_scope_categories',
  TOKEN: 'nexto_admin_token',
};

// Token 管理
export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function saveToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

// Token 验证
export async function validateToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) return { valid: false };
    const data = await response.json();
    return { valid: true, username: data.login };
  } catch {
    return { valid: false };
  }
}

// 从 GitHub 获取数据
export async function fetchPublicData(): Promise<{
  homeData?: HomeData;
  scopePosts?: ScopePost[];
  scopeCategories?: ScopeCategory[];
} | null> {
  try {
    const [homeRes, postsRes, categoriesRes] = await Promise.all([
      fetch(`${DATA_BASE}/${GITHUB_CONFIG.homeFile}`),
      fetch(`${DATA_BASE}/${GITHUB_CONFIG.postsFile}`),
      fetch(`${DATA_BASE}/${GITHUB_CONFIG.categoriesFile}`),
    ]);

    const result: {
      homeData?: HomeData;
      scopePosts?: ScopePost[];
      scopeCategories?: ScopeCategory[];
    } = {};

    if (homeRes.ok) {
      result.homeData = { ...DEFAULT_HOME_DATA, ...(await homeRes.json()) as Partial<HomeData> };
    }
    if (postsRes.ok) {
      result.scopePosts = await postsRes.json();
    }
    if (categoriesRes.ok) {
      result.scopeCategories = await categoriesRes.json();
    }

    return result;
  } catch (error) {
    console.warn('无法从 GitHub 获取数据:', error);
    return null;
  }
}

// 判断是否为 data URL
function isDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.startsWith('data:');
}

function getExtFromDataUrl(dataUrl: string): string {
  const m = dataUrl.match(/^data:image\/(\w+);/);
  return m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png';
}

function getFixedImgName(prefix: string, dataUrl: string, idx?: number): string {
  const ext = getExtFromDataUrl(dataUrl);
  return idx !== undefined ? `${prefix}-${idx}.${ext}` : `${prefix}.${ext}`;
}

// 上传文件到 GitHub
async function uploadFileToRepo(path: string, base64Content: string, token: string): Promise<boolean> {
  try {
    let sha: string | undefined;
    const getRes = await fetch(`${API_BASE}/contents/${path}?ref=${GITHUB_CONFIG.branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (getRes.ok) {
      const info = await getRes.json();
      sha = info.sha;
    }
    const payload: Record<string, unknown> = {
      message: `Upload asset: ${path}`,
      content: base64Content,
      branch: GITHUB_CONFIG.branch,
    };
    if (sha) payload.sha = sha;
    const res = await fetch(`${API_BASE}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 上传图片并替换 URL
async function uploadImagesAndReplaceUrls(
  data: { homeData?: HomeData; scopePosts?: ScopePost[] },
  token: string
): Promise<{ homeData?: HomeData; scopePosts?: ScopePost[] }> {
  const home = data.homeData;
  if (!home) return data;

  const result = JSON.parse(JSON.stringify(data)) as { homeData?: HomeData; scopePosts?: ScopePost[] };

  const upload = async (key: string, fileName: string): Promise<string | null> => {
    const raw = home[key as keyof HomeData] as string;
    if (!raw || !isDataUrl(raw)) return null;
    const base64 = raw.split(',')[1];
    if (!base64) return null;
    const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
    const ok = await uploadFileToRepo(path, base64, token);
    return ok ? `${IMG_BASE}/${fileName}` : null;
  };

  // 主 logo
  if (home.logoImage && isDataUrl(home.logoImage)) {
    const logoUrl = await upload('logoImage', getFixedImgName('logo', home.logoImage));
    if (logoUrl && result.homeData) result.homeData.logoImage = logoUrl;
  }

  // 加载 logo
  if (home.loadingLogo && isDataUrl(home.loadingLogo)) {
    const loadingUrl = await upload('loadingLogo', getFixedImgName('loading-logo', home.loadingLogo));
    if (loadingUrl && result.homeData) result.homeData.loadingLogo = loadingUrl;
  }

  // 单图（hero、about）
  for (const key of ['heroImage', 'aboutImage'] as const) {
    if (isDataUrl(home[key])) {
      const url = await upload(key, getFixedImgName(key, home[key] as string));
      if (url && result.homeData) result.homeData[key] = url;
    }
  }

  // 合作伙伴 logo
  if (Array.isArray(home.partnerLogos) && result.homeData) {
    const newPartners: string[] = [];
    for (let i = 0; i < home.partnerLogos.length; i++) {
      if (isDataUrl(home.partnerLogos[i])) {
        const base64 = home.partnerLogos[i].split(',')[1];
        const ext = getExtFromDataUrl(home.partnerLogos[i]);
        const fileName = `partner-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        newPartners.push(ok ? `${IMG_BASE}/${fileName}` : home.partnerLogos[i]);
      } else {
        newPartners.push(home.partnerLogos[i]);
      }
    }
    result.homeData.partnerLogos = newPartners;
  }

  // testimonials[].avatar
  if (Array.isArray(home.testimonials) && result.homeData) {
    for (let i = 0; i < home.testimonials.length; i++) {
      if (isDataUrl(home.testimonials[i]?.avatar)) {
        const base64 = home.testimonials[i].avatar!.split(',')[1];
        const ext = getExtFromDataUrl(home.testimonials[i].avatar!);
        const fileName = `testimonial-avatar-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) result.homeData.testimonials[i].avatar = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  // members[].image
  if (Array.isArray(home.members) && result.homeData) {
    for (let i = 0; i < home.members.length; i++) {
      if (isDataUrl(home.members[i]?.image)) {
        const base64 = home.members[i].image!.split(',')[1];
        const ext = getExtFromDataUrl(home.members[i].image!);
        const fileName = `member-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) result.homeData.members[i].image = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  // scopePosts[].imageUrl
  if (Array.isArray(data.scopePosts) && Array.isArray(result.scopePosts)) {
    for (let i = 0; i < data.scopePosts.length; i++) {
      if (isDataUrl(data.scopePosts[i]?.imageUrl)) {
        const base64 = data.scopePosts[i].imageUrl!.split(',')[1];
        const ext = getExtFromDataUrl(data.scopePosts[i].imageUrl!);
        const fileName = `scope-post-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) result.scopePosts[i].imageUrl = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  return result;
}

// 获取文件当前 SHA
async function getFileSha(path: string, token: string): Promise<string | undefined> {
  try {
    const getRes = await fetch(`${API_BASE}/contents/${path}?ref=${GITHUB_CONFIG.branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (getRes.ok) {
      const info = await getRes.json();
      return info.sha;
    }
  } catch (e) {
    console.warn('获取 SHA 失败:', e);
  }
  return undefined;
}

// 保存数据到 GitHub（409 时用最新 SHA 重试一次）
async function saveFileToRepo(path: string, content: string, token: string, retryOn409 = true): Promise<{ success: boolean; error?: string }> {
  const encodedContent = btoa(unescape(encodeURIComponent(content)));
  let sha = await getFileSha(path, token);

  const doPut = async (): Promise<{ success: boolean; error?: string }> => {
    const payload: Record<string, unknown> = {
      message: `Update ${path} - ${new Date().toLocaleString()}`,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch,
    };
    if (sha) payload.sha = sha;

    try {
      const res = await fetch(`${API_BASE}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      if (res.ok) return { success: true };

      // 409 Conflict：服务端文件已变更，用最新 SHA 重试一次
      if (res.status === 409 && retryOn409) {
        const newSha = await getFileSha(path, token);
        if (newSha) {
          sha = newSha;
          return saveFileToRepo(path, content, token, false);
        }
      }
      return { success: false, error: resText };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  return doPut();
}

export async function saveAllData(
  data: {
    homeData: HomeData;
    scopePosts: ScopePost[];
    scopeCategories: ScopeCategory[];
  },
  token: string
): Promise<{ success: boolean; error?: string }> {
  const errors: string[] = [];

  // 先上传图片
  let dataToSave = data;
  try {
    dataToSave = await uploadImagesAndReplaceUrls(data, token);
  } catch (e) {
    errors.push(`图片上传失败: ${(e as Error).message}`);
  }

  // 按顺序保存三个文件，避免并行写入导致 409 冲突
  const toSave: [string, string][] = [
    [`${GITHUB_CONFIG.dataPath}/${GITHUB_CONFIG.homeFile}`, JSON.stringify(dataToSave.homeData, null, 2)],
    [`${GITHUB_CONFIG.dataPath}/${GITHUB_CONFIG.postsFile}`, JSON.stringify(dataToSave.scopePosts, null, 2)],
    [`${GITHUB_CONFIG.dataPath}/${GITHUB_CONFIG.categoriesFile}`, JSON.stringify(dataToSave.scopeCategories, null, 2)],
  ];
  for (const [filePath, content] of toSave) {
    const result = await saveFileToRepo(filePath, content, token);
    if (!result.success) {
      return { success: false, error: result.error };
    }
  }

  return { success: true };
}

// 保存到 localStorage
export function saveToLocalStorage(data: {
  homeData: HomeData;
  scopePosts: ScopePost[];
  scopeCategories: ScopeCategory[];
}): void {
  localStorage.setItem(STORAGE_KEYS.HOME_DATA, JSON.stringify(data.homeData));
  localStorage.setItem(STORAGE_KEYS.SCOPE_POSTS, JSON.stringify(data.scopePosts));
  localStorage.setItem(STORAGE_KEYS.SCOPE_CATEGORIES, JSON.stringify(data.scopeCategories));
}

// 从 localStorage 读取
export function loadFromLocalStorage(): {
  homeData: HomeData;
  scopePosts: ScopePost[];
  scopeCategories: ScopeCategory[];
} {
  const homeDataRaw = localStorage.getItem(STORAGE_KEYS.HOME_DATA);
  const scopePostsRaw = localStorage.getItem(STORAGE_KEYS.SCOPE_POSTS);
  const scopeCategoriesRaw = localStorage.getItem(STORAGE_KEYS.SCOPE_CATEGORIES);

  return {
    homeData: homeDataRaw ? { ...DEFAULT_HOME_DATA, ...JSON.parse(homeDataRaw) } : DEFAULT_HOME_DATA,
    scopePosts: scopePostsRaw ? JSON.parse(scopePostsRaw) : [],
    scopeCategories: scopeCategoriesRaw ? JSON.parse(scopeCategoriesRaw) : DEFAULT_SCOPE_CATEGORIES,
  };
}

// 清除旧数据
export function clearOldData(): void {
  const keysToRemove = [
    'nexto_labs_v6_products',
    'nexto_labs_v6_orders',
    'nexto_labs_v6_customers',
    'nexto_labs_v6_admins',
    'nexto_labs_v6_inquiries',
    'nexto_labs_v6_session',
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// 清除所有网站缓存数据（强制从 GitHub 重新获取）
export function clearAllData(): void {
  const keysToRemove = [
    STORAGE_KEYS.HOME_DATA,
    STORAGE_KEYS.SCOPE_POSTS,
    STORAGE_KEYS.SCOPE_CATEGORIES,
    STORAGE_KEYS.TOKEN,
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  // 刷新页面以重新加载
  window.location.reload();
}

export { STORAGE_KEYS };
