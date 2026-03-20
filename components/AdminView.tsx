import React, { useState } from 'react';
import { Trash2, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { Admin } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AdminViewProps {
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  onDeleteItem: (type: 'admins', id: string) => void;
  /** 有 GitHub Token 时同步到仓库，手机端才能看到列表 */
  onAdminsPersist?: (list: Admin[]) => void | Promise<void>;
  syncError?: string | null;
  onClearSyncError?: () => void;
  /** 当前登录者是否为 마스터 관리자 */
  isMaster: boolean;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  admins, setAdmins, onDeleteItem, onAdminsPersist, syncError, onClearSyncError, isMaster
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [af, setAf] = useState({ name: '', code: '' });

  const handleRegisterAdmin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (admins.some(a => a.code === af.code.toUpperCase())) return alert('이미 존재하는 관리자 코드입니다.');
    const newId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAdmin = { ...af, id: newId, code: af.code.toUpperCase(), createdAt: new Date().toISOString() };
    const next = [newAdmin, ...admins];
    setAdmins(next);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(next));
    setAf({ name: '', code: '' });
    setIsSyncing(true);
    try {
      if (onAdminsPersist) await onAdminsPersist(next);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="animate-fade-in text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Add Admin Form — 마스터만 표시 */}
        {isMaster ? (
        <div className="bg-[#FAF9F6] p-6 md:p-8 border border-white/20 text-black">
          <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3 text-black">
            <ShieldCheck size={14}/> 관리자 추가
          </h3>
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <input 
              type="text" 
              required 
              value={af.name} 
              onChange={e => setAf({...af, name: e.target.value})} 
              className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-bold outline-none focus:border-black transition-all" 
              placeholder="관리자명" 
            />
            <input 
              type="text" 
              required 
              value={af.code} 
              onChange={e => setAf({...af, code: e.target.value.toUpperCase()})} 
              className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-black outline-none uppercase focus:border-black transition-all" 
              placeholder="관리자 코드" 
            />
            <button 
              type="submit" 
              disabled={isSyncing}
              className="w-full bg-black text-[#FAF9F6] mt-4 md:mt-6 py-3 md:py-4 font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSyncing ? '동기화 중...' : '권한 부여'}
            </button>
            <p className="text-[9px] text-black/45 leading-relaxed mt-4">
              다른 기기(모바일)에서도 목록을 보려면 <strong className="text-black/70">홈페이지 관리</strong>에서 GitHub Token을 설정한 뒤, 관리자를 추가·삭제하면 자동으로 동기화됩니다.
            </p>
          </form>

          {syncError && (
            <div className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold mt-4">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
          {!syncError && isSyncing && (
            <div className="flex items-center gap-2 p-3 text-[10px] font-bold mt-4 text-black/50">
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              GitHub에 동기화 중...
            </div>
          )}
        </div>
        ) : (
        <div className="bg-[#FAF9F6] p-6 md:p-8 border border-white/20 text-black flex flex-col items-center justify-center min-h-[200px] text-center">
          <ShieldCheck size={28} className="text-black/20 mb-3"/>
          <p className="text-[11px] font-black text-black/40 uppercase tracking-widest">일반 관리자</p>
          <p className="text-[10px] text-black/30 mt-2 leading-relaxed">관리자 추가·삭제는<br/>마스터 관리자만 가능합니다.</p>
        </div>
        )}

        {/* Right: Admin List */}
        <div className="bg-[#FAF9F6] border-2 border-white/20 min-h-[300px] overflow-hidden text-black">
          <div className="p-6 md:p-8 grid grid-cols-1 gap-4">
            {admins.map(a => (
              <div key={a.id} className="p-4 border-2 border-black/10 flex justify-between items-center group hover:border-black/30 transition-all bg-black/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#FAF9F6] border border-black/20 flex items-center justify-center font-black italic text-lg text-black">A</div>
                  <div>
                    <p className="font-black text-[13px] uppercase tracking-tight text-black">{a.name}</p>
                    <p className="text-[10px] font-black text-black/60 mt-1 tracking-widest">인증키: {a.code}</p>
                  </div>
                </div>
                {isMaster && a.id !== 'master' && (
                  <button 
                    type="button" 
                    onClick={() => onDeleteItem('admins', a.id)} 
                    className="p-2 text-red-500 opacity-20 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
