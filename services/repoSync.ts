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

function isDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.startsWith('data:');
}

/**
 * 处理图片：logo / loadingLogo 直接保留 base64 在 JSON 中（不转成 URL），
 * 这样任何设备拉取配置后都能显示，不会出现 404 裂图。
 * 其他大图仍尝试上传到 main 的 public/（仅作备份，若部署方式导致访问不到可忽略）。
 */
async function uploadImagesAndReplaceUrls(data: RepoSyncData, token: string): Promise<RepoSyncData> {
  const home = data.homeData as Record<string, unknown>;
  if (!home) return data;

  const out = JSON.parse(JSON.stringify(data)) as RepoSyncData;
  const outHome = out.homeData as Record<string, unknown>;

  // logoImage、loadingLogo 不转为 URL，保留 base64，确保其他设备同步后能正常显示
  // （若转为 URL 指向 main 的 public/，网站实际从 gh-pages 提供，会 404）
  if (isDataUrl(home.logoImage)) {
    outHome.logoImage = home.logoImage;
  }
  if (isDataUrl(home.loadingLogo)) {
    outHome.loadingLogo = home.loadingLogo;
  }

  // 其他单图：保留 base64 以保证跨设备显示，不再上传为单独文件
  for (const key of ['heroImage', 'aboutImage'] as const) {
    if (isDataUrl(home[key])) {
      outHome[key] = home[key];
    }
  }

  // 合作伙伴 logo、testimonials、members、scopePosts 的图片一律保留 base64
  const partnerLogos = home.partnerLogos as string[] | undefined;
  if (Array.isArray(partnerLogos)) {
    outHome.partnerLogos = partnerLogos;
  }

  const testimonials = home.testimonials as Array<{ avatar?: string | null }> | undefined;
  if (Array.isArray(testimonials)) {
    const outTest = (outHome.testimonials as Array<{ avatar?: string | null }>) || [];
    for (let i = 0; i < testimonials.length; i++) {
      if (outTest[i] && isDataUrl(testimonials[i]?.avatar)) {
        outTest[i].avatar = testimonials[i].avatar;
      }
    }
  }

  const members = home.members as Array<{ image?: string | null }> | undefined;
  if (Array.isArray(members)) {
    const outMembers = (outHome.members as Array<{ image?: string | null }>) || [];
    for (let i = 0; i < members.length; i++) {
      if (outMembers[i] && isDataUrl(members[i]?.image)) {
        outMembers[i].image = members[i].image;
      }
    }
  }

  const inPosts = data.scopePosts as Array<{ imageUrl?: string | null }>;
  const posts = out.scopePosts as Array<{ imageUrl?: string | null }>;
  if (Array.isArray(inPosts) && Array.isArray(posts)) {
    for (let i = 0; i < inPosts.length; i++) {
      if (posts[i] && isDataUrl(inPosts[i]?.imageUrl)) {
        posts[i].imageUrl = inPosts[i].imageUrl;
      }
    }
  }

  return out;
}

export async function saveToRepo(data: RepoSyncData, token: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const errors: string[] = [];

  try {
    // 先把 base64 图片上传到 public/，并得到替换成 URL 后的 data
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
