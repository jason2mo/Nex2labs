
import React, { useState } from 'react';

interface ContactViewProps {
  onSendInquiry: (name: string, contact: string, content: string) => void;
}

const ContactView: React.FC<ContactViewProps> = ({ onSendInquiry }) => {
  const [formData, setFormData] = useState({ name: '', contact: '', content: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.content) return;
    
    onSendInquiry(formData.name, formData.contact, formData.content);
    setFormData({ name: '', contact: '', content: '' });
    alert('메시지가 전송되었습니다. 관리자가 확인 후 곧 연락드리겠습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-24 animate-fade-in py-12 text-white">
      <div className="text-center space-y-8">
        <h2 className="editorial-title text-7xl italic">CONTACT_US.</h2>
        <p className="text-[11px] font-black uppercase tracking-[0.7em] opacity-40 text-white">비즈니스 협업 및 시스템 구축 문의</p>
      </div>

      <div className="bg-white p-16 text-black brutal-border brutal-shadow">
        <form className="space-y-12" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest opacity-40">성함 / 귀사명</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b-4 border-black py-4 font-black text-xl outline-none focus:border-black/50 transition-all placeholder:opacity-20" 
                placeholder="성함을 입력하세요" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest opacity-40">연락처 / 이메일</label>
              <input 
                type="text" 
                required 
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full bg-transparent border-b-4 border-black py-4 font-black text-xl outline-none focus:border-black/50 transition-all placeholder:opacity-20" 
                placeholder="example@mail.com" 
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest opacity-40">문의 내용</label>
            <textarea 
              required 
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-transparent border-b-4 border-black py-4 font-black text-xl h-40 resize-none outline-none focus:border-black/50 transition-all placeholder:opacity-20" 
              placeholder="구축하고자 하는 시스템에 대해 간략히 기술해 주세요" 
            />
          </div>
          <button type="submit" className="w-full bg-black text-white py-6 font-black text-sm uppercase tracking-[0.6em] hover:bg-neutral-800 transition-all active:scale-[0.98]">문의 등록하기</button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-[11px] font-black uppercase tracking-widest opacity-50">
        <span>본사: 서울특별시 강남구</span>
        <span>이메일: INFO@NEXTOLABS.COM</span>
        <span>대표번호: 010-0000-0000</span>
      </div>
    </div>
  );
};

export default ContactView;
