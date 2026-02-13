
import React, { useState } from 'react';
import { MASTER_ADMIN_CODE, HARSH_MESSAGES } from '../constants';
import { Customer, Admin, Session } from '../types';

interface GatewayProps {
  brandName: string;
  logo?: string | null;
  customers: Customer[];
  admins: Admin[];
  onLogin: (session: Session) => void;
}

const Gateway: React.FC<GatewayProps> = ({ brandName, logo, customers, admins, onLogin }) => {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (err) setErr(''); // 타이핑 시작 시 에러 메시지 즉시 제거
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = code.trim().toUpperCase();
    
    if (input === MASTER_ADMIN_CODE) { 
      onLogin({ type: 'admin', data: { id: 'master', name: '마스터 관리자', code: MASTER_ADMIN_CODE, createdAt: new Date().toISOString() } }); 
      return; 
    }
    
    const adminMatched = admins.find(a => a.code.toUpperCase() === input);
    if (adminMatched) { onLogin({ type: 'admin', data: adminMatched }); return; }

    const customerMatched = customers.find(c => c.code.toUpperCase() === input);
    if (customerMatched) { onLogin({ type: 'customer', data: customerMatched }); return; }
    
    setErr(HARSH_MESSAGES[Math.floor(Math.random() * HARSH_MESSAGES.length)]);
    setCode('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center flex flex-col items-center">
          <div className="px-10 py-5 transition-all">
            {logo ? (
              <img src={logo} className="max-h-24 mx-auto object-contain" alt={brandName} />
            ) : (
              <div className="bg-white px-10 py-5 brutal-border shadow-[10px_10px_0_0_white]">
                <h1 className="editorial-title text-5xl leading-none text-black tracking-tighter uppercase">{brandName}</h1>
              </div>
            )}
          </div>
          <p className="text-[10px] font-black tracking-[0.8em] uppercase text-white mt-12 opacity-60">인증 포털 시스템</p>
        </div>

        <div className="bg-black border-4 border-white p-12 relative brutal-shadow">
          <div className="absolute -top-[20px] -left-[4px] bg-white text-black text-[11px] font-black px-4 py-1 uppercase tracking-[0.2em]">
            보안 키 입력
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 block text-center text-white">ACCESS_KEY</label>
              <input 
                type="password" 
                placeholder="••••" 
                value={code}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-4 border-white rounded-none px-6 py-4 text-white font-black tracking-[1.5em] text-center text-5xl uppercase outline-none focus:border-white transition-all caret-transparent"
              />
            </div>
            {err && (
              <div className="text-black text-[12px] font-black p-4 bg-white leading-relaxed">
                [경고] {err}
              </div>
            )}
            <button 
              type="submit" 
              className="w-full bg-white text-black py-5 rounded-none font-black text-sm uppercase tracking-[0.5em] border-2 border-white hover:bg-black hover:text-white transition-all active:scale-[0.98]"
            >
              시스템 접속하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
