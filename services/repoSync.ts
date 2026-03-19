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

export async function saveToRepo(data: RepoSyncData, token: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 先获取当前文件信息
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

    // 更新或创建文件
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
