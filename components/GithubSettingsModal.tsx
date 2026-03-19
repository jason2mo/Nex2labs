import React, { useState, useEffect } from 'react';
import { X, Github, Check, AlertCircle, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import {
  getStoredToken, saveToken, clearToken, validateToken,
  getStoredGistId, getLastSyncTime
} from '../services/githubSync';

interface GithubSettingsModalProps {
  onClose: () => void;
}

const GithubSettingsModal: React.FC<GithubSettingsModalProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [gistUrl, setGistUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setToken(getStoredToken() || '');
    setGistId(getStoredGistId() || '');
    setLastSync(getLastSyncTime());
  }, []);

  const handleValidate = async () => {
    if (!token.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    const result = await validateToken(token.trim());
    setIsValidating(false);
    if (result.valid) {
      setValidationResult({ ok: true, message: `유효한 Token입니다. GitHub 사용자: @${result.username}` });
    } else {
      setValidationResult({ ok: false, message: 'Token이 유효하지 않습니다. gist 권한(Scope)이 있는지 확인해주세요.' });
    }
  };

  const handleSave = () => {
    if (!token.trim()) {
      setValidationResult({ ok: false, message: 'Token을 입력해주세요.' });
      return;
    }
    saveToken(token.trim());
    if (gistId.trim()) {
      localStorage.setItem('nexto_gist_id', gistId.trim());
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleDisconnect = () => {
    if (window.confirm('GitHub 연결을 해제하시겠습니까? 동기화된 데이터는 GitHub Gist에 그대로 유지됩니다.')) {
      clearToken();
      setToken('');
      setGistId('');
      setValidationResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0a0a0a] border-2 border-white/20 w-full max-w-lg p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Github size={20} className="text-white" />
            <h2 className="text-[13px] font-black uppercase tracking-widest text-white">GITHUB 연결 설정</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all"><X size={18} /></button>
        </div>

        {/* Info box */}
        <div className="bg-white/5 border border-white/10 p-4 space-y-1">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">연동 방식: GitHub Gist</p>
          <p className="text-[10px] text-white/40 leading-relaxed">
            데이터를 GitHub Gist(비밀/Unlisted)에 저장합니다.<br />
            각 기기에서 동일한 Token을 입력하면 데이터를 동기화할 수 있습니다.<br />
            Token에 <span className="text-[#FF6B00]">gist</span> 권한이 필요합니다.
          </p>
          <a
            href="https://github.com/settings/tokens/new?scopes=gist&description=NexTo%20Labs%20Sync"
            target="_blank"
            reln="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-black text-[#FF6B00] hover:underline mt-2"
          >
            <ExternalLink size={10} /> GitHub Token 생성하기
          </a>
        </div>

        {/* Token input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
            Personal Access Token
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={token}
              onChange={e => { setToken(e.target.value); setValidationResult(null); }}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 bg-white/5 border border-white/20 px-4 py-3 text-[11px] font-mono text-white outline-none focus:border-[#FF6B00] transition-all placeholder:text-white/20"
            />
            <button
              onClick={handleValidate}
              disabled={isValidating || !token.trim()}
              className="bg-white/10 border border-white/20 px-4 py-3 text-[10px] font-black text-white disabled:opacity-30 hover:bg-white/20 transition-all flex items-center gap-1"
            >
              {isValidating ? <Loader2 size={12} className="animate-spin" /> : '확인'}
            </button>
          </div>

          {validationResult && (
            <div className={`flex items-start gap-2 p-3 border text-[10px] font-bold ${validationResult.ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
              {validationResult.ok ? <Check size={12} className="mt-0.5 shrink-0" /> : <AlertCircle size={12} className="mt-0.5 shrink-0" />}
              {validationResult.message}
            </div>
          )}
        </div>

        {/* Gist ID (auto-detected, shown for info) */}
        {gistId && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              연결된 Gist ID
            </label>
            <div className="bg-white/5 border border-white/10 px-4 py-3 flex justify-between items-center">
              <code className="text-[10px] font-mono text-white/60">{gistId}</code>
              <a
                href={`https://gist.github.com/${gistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black text-[#FF6B00] hover:underline flex items-center gap-1"
              >
                <ExternalLink size={10} /> 열기
              </a>
            </div>
          </div>
        )}

        {/* Last sync */}
        {lastSync && (
          <div className="text-[10px] text-white/40">
            마지막 동기화: <span className="font-black text-white/60">{new Date(lastSync).toLocaleString()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-[#FAF9F6] text-black py-4 font-black text-[11px] uppercase tracking-widest hover:bg-[#e8e6e1] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isSaving ? '저장 중...' : '설정 저장'}
          </button>
          {token && (
            <button
              onClick={handleDisconnect}
              className="bg-transparent border border-red-500/30 text-red-400 px-4 py-4 text-[10px] font-black hover:bg-red-500/10 transition-all flex items-center gap-1"
            >
              <Trash2 size={12} /> 해제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GithubSettingsModal;
