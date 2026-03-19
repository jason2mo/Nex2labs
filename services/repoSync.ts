// GitHub 仓库文件同步服务
// 公开数据：直接从 GitHub 仓库读取（无需 Token）
// 写入数据：需要 GitHub Token 通过 API 更新

export const GITHUB_CONFIG = {
  owner: 'jason2mo',
  repo: 'Nex2labs',
  branch: 'main',
  dataPath: 'data/home-config.json',
};

// 公开读取 - 无需 Token
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}`;

export interface RepoSyncData {
  homeData: unknown;
  scopePosts: unknown[];
  scopeCategories: unknown[];
  timestamp: string;
  version: number;
}

// 公开读取 - 任何人可以直接访问
export async function fetchPublicData(): Promise<RepoSyncData | null> {
  try {
    const response = await fetch(`${RAW_BASE}/${GITHUB_CONFIG.dataPath}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data as RepoSyncData;
  } catch (error) {
    console.warn('无法从 GitHub 仓库获取公开数据:', error);
    return null;
  }
}

// 认证写入 - 需要 Token
const API_BASE = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;
const PUBLIC_BASE = '/Nex2labs';

function isDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.startsWith('data:');
}

function getExtFromDataUrl(dataUrl: string): string {
  const m = dataUrl.match(/^data:image\/(\w+);/);
  return m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png';
}

async function uploadFileToRepo(
  path: string,
  base64Content: string,
  token: string
): Promise<boolean> {
  try {
    let sha: string | undefined;
    const getRes = await fetch(`${API_BASE}/contents/${path}`, {
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

/** 从 data 中提取 base64 图片，上传到 public/，并返回替换为 URL 后的新 data */
async function uploadImagesAndReplaceUrls(data: RepoSyncData, token: string): Promise<RepoSyncData> {
  const home = data.homeData as Record<string, unknown>;
  if (!home) return data;

  const out = JSON.parse(JSON.stringify(data)) as RepoSyncData;
  const outHome = out.homeData as Record<string, unknown>;

  // 主 logo -> public/logo.png
  if (isDataUrl(home.logoImage)) {
    const ext = getExtFromDataUrl(home.logoImage);
    const base64 = home.logoImage.split(',')[1];
    if (base64 && (await uploadFileToRepo(`public/logo.${ext}`, base64, token))) {
      outHome.logoImage = `${PUBLIC_BASE}/logo.${ext}`;
    }
  }

  // 加载 logo -> public/loading-logo.png
  if (isDataUrl(home.loadingLogo)) {
    const ext = getExtFromDataUrl(home.loadingLogo);
    const base64 = home.loadingLogo.split(',')[1];
    if (base64 && (await uploadFileToRepo(`public/loading-logo.${ext}`, base64, token))) {
      outHome.loadingLogo = `${PUBLIC_BASE}/loading-logo.${ext}`;
    }
  }

  // 其他单图
  for (const key of ['heroImage', 'aboutImage'] as const) {
    if (isDataUrl(home[key])) {
      const ext = getExtFromDataUrl(home[key] as string);
      const base64 = (home[key] as string).split(',')[1];
      if (base64 && (await uploadFileToRepo(`public/${key}.${ext}`, base64, token))) {
        outHome[key] = `${PUBLIC_BASE}/${key}.${ext}`;
      }
    }
  }

  // 合作伙伴 logo 数组 -> public/partner-0.png, partner-1.png, ...
  const partnerLogos = home.partnerLogos as string[] | undefined;
  if (Array.isArray(partnerLogos)) {
    const newPartners: string[] = [];
    for (let i = 0; i < partnerLogos.length; i++) {
      const url = partnerLogos[i];
      if (isDataUrl(url)) {
        const ext = getExtFromDataUrl(url);
        const base64 = url.split(',')[1];
        if (base64 && (await uploadFileToRepo(`public/partner-${i}.${ext}`, base64, token))) {
          newPartners.push(`${PUBLIC_BASE}/partner-${i}.${ext}`);
        } else {
          newPartners.push(url);
        }
      } else {
        newPartners.push(url);
      }
    }
    outHome.partnerLogos = newPartners;
  }

  // testimonials[].avatar
  const testimonials = home.testimonials as Array<{ avatar?: string | null }> | undefined;
  if (Array.isArray(testimonials)) {
    const outTest = (outHome.testimonials as Array<{ avatar?: string | null }>) || [];
    for (let i = 0; i < testimonials.length; i++) {
      const av = testimonials[i]?.avatar;
      if (isDataUrl(av)) {
        const ext = getExtFromDataUrl(av);
        const base64 = av.split(',')[1];
        if (base64 && (await uploadFileToRepo(`public/testimonial-avatar-${i}.${ext}`, base64, token))) {
          if (outTest[i]) outTest[i].avatar = `${PUBLIC_BASE}/testimonial-avatar-${i}.${ext}`;
        }
      }
    }
  }

  // members[].image
  const members = home.members as Array<{ image?: string | null }> | undefined;
  if (Array.isArray(members)) {
    const outMembers = (outHome.members as Array<{ image?: string | null }>) || [];
    for (let i = 0; i < members.length; i++) {
      const img = members[i]?.image;
      if (isDataUrl(img)) {
        const ext = getExtFromDataUrl(img);
        const base64 = img.split(',')[1];
        if (base64 && (await uploadFileToRepo(`public/member-${i}.${ext}`, base64, token))) {
          if (outMembers[i]) outMembers[i].image = `${PUBLIC_BASE}/member-${i}.${ext}`;
        }
      }
    }
  }

  // scopePosts[].imageUrl
  const posts = out.scopePosts as Array<{ imageUrl?: string | null }>;
  const inPosts = data.scopePosts as Array<{ imageUrl?: string | null }>;
  if (Array.isArray(inPosts) && Array.isArray(posts)) {
    for (let i = 0; i < inPosts.length; i++) {
      const img = inPosts[i]?.imageUrl;
      if (isDataUrl(img)) {
        const ext = getExtFromDataUrl(img);
        const base64 = img.split(',')[1];
        if (base64 && (await uploadFileToRepo(`public/scope-post-${i}.${ext}`, base64, token))) {
          if (posts[i]) posts[i].imageUrl = `${PUBLIC_BASE}/scope-post-${i}.${ext}`;
        }
      }
    }
  }

  return out;
}

export async function saveToRepo(data: RepoSyncData, token: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 先把 base64 图片上传到 public/，并得到替换成 URL 后的 data
    const dataToSave = await uploadImagesAndReplaceUrls(data, token);

    const content = JSON.stringify(dataToSave, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    let sha: string | undefined;
    try {
      const getResponse = await fetch(`${API_BASE}/contents/${GITHUB_CONFIG.dataPath}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
      });
      if (getResponse.ok) {
        const info = await getResponse.json();
        sha = info.sha;
      }
    } catch { /* 文件可能不存在 */ }

    const payload: Record<string, unknown> = {
      message: `Update home config - ${new Date().toLocaleString()}`,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch,
    };
    if (sha) payload.sha = sha;

    const response = await fetch(`${API_BASE}/contents/${GITHUB_CONFIG.dataPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || `HTTP ${response.status}` };
    }

    const result = await response.json();
    return { success: true, url: result.content?.html_url };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
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

// Token 存储
const TOKEN_KEY = 'nexto_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
