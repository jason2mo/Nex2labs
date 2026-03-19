// GitHub 仓库文件同步服务
// 公开数据：直接从 GitHub 仓库读取（无需 Token）
// 写入数据：需要 GitHub Token 通过 API 更新

export const GITHUB_CONFIG = {
  owner: 'jason2mo',
  repo: 'Nex2labs',
  branch: 'main',
  dataPath: 'data/home-config.json',
  /** 图片上传到 main 的此文件夹，网站通过 raw.githubusercontent.com 访问（不依赖 gh-pages） */
  imagePath: 'images',
};

// 公开读取 - 无需 Token
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}`;
// 图片访问地址（main 分支，非 gh-pages，deploy 不会被覆盖）
const IMG_BASE = `${RAW_BASE}/${GITHUB_CONFIG.imagePath}`;

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

function isDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.startsWith('data:');
}

function getExtFromDataUrl(dataUrl: string): string {
  const m = dataUrl.match(/^data:image\/(\w+);/);
  return m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png';
}

/** 生成唯一的图片文件名 */
function makeImgName(prefix: string, dataUrl: string, idx?: number): string {
  const ext = getExtFromDataUrl(dataUrl);
  const ts = Date.now();
  return idx !== undefined ? `${prefix}-${idx}-${ts}.${ext}` : `${prefix}-${ts}.${ext}`;
}

/**
 * 将 base64 图片上传到 main 分支的 images/ 目录，
 * 并将 JSON 中的 base64 替换为 raw.githubusercontent.com URL。
 * 图片文件在 main 分支，deploy 不会影响它们。
 */
async function uploadImagesAndReplaceUrls(data: RepoSyncData, token: string): Promise<RepoSyncData> {
  const home = data.homeData as Record<string, unknown>;
  if (!home) return data;

  const out = JSON.parse(JSON.stringify(data)) as RepoSyncData;
  const outHome = out.homeData as Record<string, unknown>;

  const upload = async (key: string, fileName: string): Promise<string | null> => {
    const raw = home[key] as string;
    if (!raw || !isDataUrl(raw)) return null;
    const base64 = raw.split(',')[1];
    if (!base64) return null;
    const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
    const ok = await uploadFileToRepo(path, base64, token);
    return ok ? `${IMG_BASE}/${fileName}` : null;
  };

  const uploadIdx = async (key: string, prefix: string, idx: number): Promise<string | null> => {
    const raw = (home[key] as Array<string> | undefined)?.[idx];
    if (!isDataUrl(raw)) return null;
    const base64 = raw.split(',')[1];
    if (!base64) return null;
    const fileName = `${prefix}-${idx}.${getExtFromDataUrl(raw)}`;
    const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
    const ok = await uploadFileToRepo(path, base64, token);
    return ok ? `${IMG_BASE}/${fileName}` : null;
  };

  // 主 logo
  if (home.logoImage && isDataUrl(home.logoImage as string)) {
    const logoUrl = await upload('logoImage', makeImgName('logo', home.logoImage as string));
    if (logoUrl) outHome.logoImage = logoUrl;
  }

  // 加载 logo
  if (home.loadingLogo && isDataUrl(home.loadingLogo as string)) {
    const loadingUrl = await upload('loadingLogo', makeImgName('loading-logo', home.loadingLogo as string));
    if (loadingUrl) outHome.loadingLogo = loadingUrl;
  }

  // 单图（hero、about）
  for (const key of ['heroImage', 'aboutImage'] as const) {
    if (isDataUrl(home[key])) {
      const url = await upload(key, makeImgName(key, home[key] as string));
      if (url) outHome[key] = url;
    }
  }

  // 合作伙伴 logo
  const partnerLogos = home.partnerLogos as string[] | undefined;
  if (Array.isArray(partnerLogos)) {
    const newPartners: string[] = [];
    for (let i = 0; i < partnerLogos.length; i++) {
      if (isDataUrl(partnerLogos[i])) {
        const base64 = partnerLogos[i].split(',')[1];
        const ext = getExtFromDataUrl(partnerLogos[i]);
        const fileName = `partner-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        newPartners.push(ok ? `${IMG_BASE}/${fileName}` : partnerLogos[i]);
      } else {
        newPartners.push(partnerLogos[i]);
      }
    }
    outHome.partnerLogos = newPartners;
  }

  // testimonials[].avatar
  const testimonials = home.testimonials as Array<{ avatar?: string | null }> | undefined;
  if (Array.isArray(testimonials)) {
    const outTest = (outHome.testimonials as Array<{ avatar?: string | null }>) || [];
    for (let i = 0; i < testimonials.length; i++) {
      if (outTest[i] && isDataUrl(testimonials[i]?.avatar)) {
        const base64 = testimonials[i].avatar!.split(',')[1];
        const ext = getExtFromDataUrl(testimonials[i].avatar!);
        const fileName = `testimonial-avatar-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) outTest[i].avatar = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  // members[].image
  const members = home.members as Array<{ image?: string | null }> | undefined;
  if (Array.isArray(members)) {
    const outMembers = (outHome.members as Array<{ image?: string | null }>) || [];
    for (let i = 0; i < members.length; i++) {
      if (outMembers[i] && isDataUrl(members[i]?.image)) {
        const base64 = members[i].image!.split(',')[1];
        const ext = getExtFromDataUrl(members[i].image!);
        const fileName = `member-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) outMembers[i].image = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  // scopePosts[].imageUrl
  const inPosts = data.scopePosts as Array<{ imageUrl?: string | null }>;
  const outPosts = out.scopePosts as Array<{ imageUrl?: string | null }>;
  if (Array.isArray(inPosts) && Array.isArray(outPosts)) {
    for (let i = 0; i < inPosts.length; i++) {
      if (outPosts[i] && isDataUrl(inPosts[i]?.imageUrl)) {
        const base64 = inPosts[i].imageUrl!.split(',')[1];
        const ext = getExtFromDataUrl(inPosts[i].imageUrl!);
        const fileName = `scope-post-${i}.${ext}`;
        const path = `${GITHUB_CONFIG.imagePath}/${fileName}`;
        const ok = await uploadFileToRepo(path, base64, token);
        if (ok) outPosts[i].imageUrl = `${IMG_BASE}/${fileName}`;
      }
    }
  }

  return out;
}

/** 上传文件到 main 分支（images/ 目录，deploy 时不会被覆盖） */
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

export async function saveToRepo(data: RepoSyncData, token: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const errors: string[] = [];

  try {
    // 上传 base64 图片到 main 的 images/，并替换 JSON 中的路径为 URL
    try {
      const dataToSave = await uploadImagesAndReplaceUrls(data, token);
      data = dataToSave;
    } catch (e) {
      const msg = `图片上传失败: ${(e as Error).message}，继续保存配置...`;
      console.warn(msg);
      errors.push(msg);
    }

    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 先获取当前文件 SHA
    let sha: string | undefined;
    try {
      console.log('[saveToRepo] 获取文件 SHA...');
      const getResponse = await fetch(`${API_BASE}/contents/${GITHUB_CONFIG.dataPath}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
      });
      console.log('[saveToRepo] GET /contents response:', getResponse.status, getResponse.statusText);
      if (getResponse.ok) {
        const info = await getResponse.json();
        sha = info.sha;
        console.log('[saveToRepo] 当前 SHA:', sha);
      } else if (getResponse.status === 404) {
        console.log('[saveToRepo] 文件不存在，将创建新文件');
      } else {
        const errText = await getResponse.text();
        errors.push(`获取文件信息失败: HTTP ${getResponse.status} ${errText}`);
      }
    } catch (e) {
      errors.push(`获取 SHA 时网络错误: ${(e as Error).message}`);
    }

    const payload: Record<string, unknown> = {
      message: `Update home config - ${new Date().toLocaleString()}`,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch,
    };
    if (sha) payload.sha = sha;

    console.log('[saveToRepo] 写入文件...');
    const response = await fetch(`${API_BASE}/contents/${GITHUB_CONFIG.dataPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[saveToRepo] PUT /contents response:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('[saveToRepo] PUT 响应体:', responseText.substring(0, 500));

    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const errJson = JSON.parse(responseText);
        errMsg = errJson.message || errJson.error || errMsg;
        if (errJson.errors) errMsg += ` | ${JSON.stringify(errJson.errors)}`;
      } catch { /* keep status text */ }
      return { success: false, error: `[GitHub API] ${errMsg}${errors.length ? ' | ' + errors.join('; ') : ''}` };
    }

    const result = JSON.parse(responseText);
    return { success: true, url: result.content?.html_url };
  } catch (error) {
    const msg = (error as Error).message;
    console.error('[saveToRepo] 捕获异常:', msg);
    return { success: false, error: `[Exception] ${msg}${errors.length ? ' | ' + errors.join('; ') : ''}` };
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
