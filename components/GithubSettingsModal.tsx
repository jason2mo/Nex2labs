import React, { useState } from 'react';
import { X, Github, Check, AlertCircle, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { getStoredToken, saveToken, clearToken, validateToken, GITHUB_CONFIG } from '../services/dataService';

interface GithubSettingsModalProps {
  onClose: () => void;
}

export const GithubSettingsModal: React.FC<GithubSettingsModalProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setToken(getStoredToken() || '');
  }, []);

  const handleValidate = async () => {
    if (!token.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    const result = await validateToken(token.trim());
    setIsValidating(false);
    if (result.valid) {
      setValidationResult({ ok: true, message: `유효한 Token입니다! (@${result.username}) 이제 데이터를 GitHub에 저장할 수 있습니다.` });
    } else {
      setValidationResult({ ok: false, message: 'Token이 유효하지 않습니다. repo 권한이 있는지 확인해주세요.' });
    }
  };

  const handleSave = () => {
    if (!token.trim()) {
      setValidationResult({ ok: false, message: 'Token을 입력해주세요.' });
      return;
    }
    saveToken(token.trim());
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleDisconnect = () => {
    if (window.confirm('GitHub 연결을 해제하시겠습니까?')) {
      clearToken();
      setToken('');
      setValidationResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0a0a0a] border-2 border-white/20 w-full max-w-lg p-8 space-y-6 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Github size={20} className="text-white" />
            <h2 className="text-[13px] font-black uppercase tracking-widest text-white">GITHUB 연결 설정</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 space-y-2">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">연동 방식: GitHub Repository</p>
          <p className="text-[10px] text-white/40 leading-relaxed">
            데이터를 <span className="text-[#FF6B00]">GitHub Repository</span>의 파일에 저장합니다.<br />
            <strong className="text-white/60">고객은 Token 없이도 자동으로 데이터를 가져옵니다.</strong><br />
            관리자가 데이터를 저장할 때만 Token이 필요합니다.
          </p>
          <p className="text-[9px] text-white/30 mt-2">
            저장 위치: <code className="text-[#FF6B00]">{GITHUB_CONFIG.dataPath}/{GITHUB_CONFIG.homeFile}, {GITHUB_CONFIG.postsFile}, {GITHUB_CONFIG.categoriesFile}</code>
          </p>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=NexTo%20Labs%20Data"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-black text-[#FF6B00] hover:underline mt-2"
          >
            <ExternalLink size={10} /> GitHub Token 생성하기 (repo 권한 필요)
          </a>
        </div>

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
