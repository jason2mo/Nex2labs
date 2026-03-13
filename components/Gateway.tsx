
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
              <img src={logo} className="max-h-[91px] mx-auto object-contain" alt={brandName} />
            ) : (
              <div className="bg-black px-10 py-5 brutal-border shadow-[10px_10px_0_0_black]">
                <h1 className="editorial-title text-5xl leading-none text-[#FAF9F6] tracking-tighter uppercase">{brandName}</h1>
              </div>
            )}
          </div>
          <p className="text-[10px] font-black tracking-[0.8em] uppercase text-[#FF6B00] mt-12">인증 포털 시스템</p>
        </div>

        <div className="bg-[#FAF9F6] border-0 p-8 md:p-12 relative">
          <div className="absolute -top-[16px] md:-top-[20px] -left-[4px] bg-[#FF6B00] text-white text-[10px] md:text-[11px] font-black px-3 md:px-4 py-1 uppercase tracking-[0.2em]">
            보안 키 입력
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-black/50 block text-center">ACCESS_KEY</label>
              <input 
                type="password" 
                placeholder="••••" 
                value={code}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 md:border-b-4 border-black rounded-none px-4 md:px-6 py-3 md:py-4 text-black font-black tracking-[1em] md:tracking-[1.5em] text-center text-3xl md:text-5xl uppercase outline-none focus:border-[#FF6B00] transition-all caret-transparent"
              />
            </div>
            {err && (
              <div className="text-white text-[11px] md:text-[12px] font-black p-3 md:p-4 bg-[#FF6B00] leading-relaxed">
                [경고] {err}
              </div>
            )}
            <button 
              type="submit" 
              className="btn-block w-full py-5 md:py-6"
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
