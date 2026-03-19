export const GIST_FILENAME = 'nexto-labs-data.json';

export const GITHUB_SYNC_KEYS = {
  TOKEN: 'nexto_github_token',
  GIST_ID: 'nexto_gist_id',
  LAST_SYNC: 'nexto_last_sync',
};

export interface SyncData {
  homeData: unknown;
  scopePosts: unknown[];
  scopeCategories: unknown[];
  timestamp: string;
  version: number;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(GITHUB_SYNC_KEYS.TOKEN);
}

export function saveToken(token: string): void {
  localStorage.setItem(GITHUB_SYNC_KEYS.TOKEN, token);
}

export function clearToken(): void {
  localStorage.removeItem(GITHUB_SYNC_KEYS.TOKEN);
  localStorage.removeItem(GITHUB_SYNC_KEYS.GIST_ID);
  localStorage.removeItem(GITHUB_SYNC_KEYS.LAST_SYNC);
}

export function getStoredGistId(): string | null {
  return localStorage.getItem(GITHUB_SYNC_KEYS.GIST_ID);
}

function saveGistId(gistId: string): void {
  localStorage.setItem(GITHUB_SYNC_KEYS.GIST_ID, gistId);
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(GITHUB_SYNC_KEYS.LAST_SYNC);
}

function saveLastSync(): void {
  localStorage.setItem(GITHUB_SYNC_KEYS.LAST_SYNC, new Date().toISOString());
}

const GIST_API = 'https://api.github.com/gists';

export async function pushToGithub(data: SyncData): Promise<{ gistId: string; url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('GitHub Token이 설정되지 않았습니다. 먼저 Token을 입력해주세요.');

  const gistId = getStoredGistId();
  const payload = {
    description: `NexTo Labs Data Backup - ${new Date().toLocaleString()}`,
    public: false,
    files: {
      [GIST_FILENAME]: {
        content: JSON.stringify(data, null, 2),
      },
    },
  };

  let response: Response;
  if (gistId) {
    response = await fetch(`${GIST_API}/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });
  } else {
    response = await fetch(GIST_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('GitHub Token이 유효하지 않습니다. Token을 확인해주세요.');
    if (response.status === 404) {
      localStorage.removeItem(GITHUB_SYNC_KEYS.GIST_ID);
      return pushToGithub(data);
    }
    throw new Error(`GitHub 오류: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const returnedGistId = result.id as string;
  const htmlUrl = result.html_url as string;

  if (!gistId) saveGistId(returnedGistId);
  saveLastSync();

  return { gistId: returnedGistId, url: htmlUrl };
}

export async function pullFromGithub(): Promise<SyncData | null> {
  const token = getStoredToken();
  const gistId = getStoredGistId();

  if (!token) throw new Error('GitHub Token이 설정되지 않았습니다.');
  if (!gistId) throw new Error('GitHub에 동기화된 데이터가 없습니다. 먼저 "GitHub에 저장"을 실행해주세요.');

  const response = await fetch(`${GIST_API}/${gistId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('GitHub Token이 유효하지 않습니다.');
    if (response.status === 404) {
      localStorage.removeItem(GITHUB_SYNC_KEYS.GIST_ID);
      throw new Error('Gist를 찾을 수 없습니다. 다시 "GitHub에 저장"을 실행해주세요.');
    }
    throw new Error(`GitHub 오류: ${response.status}`);
  }

  const result = await response.json();
  const file = result.files?.[GIST_FILENAME];

  if (!file) throw new Error('Gist에 데이터 파일을 찾을 수 없습니다.');

  try {
    return JSON.parse(file.content) as SyncData;
  } catch {
    throw new Error('Gist 데이터 파싱 오류');
  }
}

export async function validateToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (!response.ok) return { valid: false };
    const data = await response.json();
    return { valid: true, username: data.login };
  } catch {
    return { valid: false };
  }
}

export function downloadAsJson(data: SyncData, filename = 'nexto-labs-data.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
