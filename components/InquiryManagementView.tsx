
import React, { useState } from 'react';
import { Mail, Trash2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Inquiry } from '../types';

interface InquiryManagementViewProps {
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
}

const InquiryManagementView: React.FC<InquiryManagementViewProps> = ({ inquiries, setInquiries }) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const toggleReadStatus = (id: string) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, isRead: !inq.isRead } : inq
    ));
  };

  const deleteInquiry = (id: string) => {
    if (window.confirm('이 문의 내역을 영구적으로 삭제하시겠습니까?')) {
      setInquiries(prev => prev.filter(inq => inq.id !== id));
      if (selectedInquiryId === id) setSelectedInquiryId(null);
    }
  };

  const selectedInquiry = inquiries.find(inq => inq.id === selectedInquiryId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in text-black min-h-[70vh]">
      {/* 문의 리스트 */}
      <div className="lg:col-span-5 space-y-6">
        <div className="border-b-2 border-black pb-6 flex justify-between items-end">
          <h2 className="editorial-title text-4xl italic">INBOX_SYSTEM</h2>
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{inquiries.length} 총 문의</span>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {inquiries.map(inq => (
            <button 
              key={inq.id}
              onClick={() => {
                setSelectedInquiryId(inq.id);
                if (!inq.isRead) toggleReadStatus(inq.id);
              }}
              className={`w-full p-6 text-left border-2 transition-all group relative overflow-hidden ${
                selectedInquiryId === inq.id 
                  ? 'bg-black text-[#FAF9F6] border-black' 
                  : 'bg-[#FAF9F6] border-black/10 hover:border-black'
              }`}
            >
              {!inq.isRead && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-black flex items-center justify-center">
                  <span className="w-2 h-2 bg-[#FAF9F6] rounded-full animate-pulse"></span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedInquiryId === inq.id ? 'opacity-40' : 'opacity-20'}`}>
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tighter truncate mb-2">{inq.name}</h3>
              <p className={`text-[11px] font-bold opacity-40 truncate ${selectedInquiryId === inq.id ? 'text-[#FAF9F6]' : 'text-black'}`}>
                {inq.contact}
              </p>

              <div className={`absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-all ${selectedInquiryId === inq.id ? 'text-[#FAF9F6]' : 'text-black'}`}>
                <ArrowRight size={18} />
              </div>
            </button>
          ))}

          {inquiries.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-black/10 opacity-20">
              <p className="text-[11px] font-black uppercase tracking-[0.5em]">수신된 문의가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 상세 보기 */}
      <div className="lg:col-span-7">
        {selectedInquiry ? (
          <div className="bg-black text-[#FAF9F6] p-12 brutal-border brutal-shadow min-h-[400px] flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-start border-b-2 border-[#FAF9F6]/10 pb-8 mb-8">
              <div>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-2">발신자 정보</p>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{selectedInquiry.name}</h3>
                <p className="text-lg font-bold opacity-60">{selectedInquiry.contact}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => deleteInquiry(selectedInquiry.id)}
                  className="p-3 border-2 border-[#FAF9F6] hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                  title="영구 삭제"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">문의 내용</p>
              <div className="text-xl font-medium leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.content}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-[#FAF9F6]/10 flex justify-between items-center">
              <div className="flex items-center gap-3 opacity-30 text-[11px] font-black uppercase tracking-widest">
                <Clock size={16} />
                수신 일시: {new Date(selectedInquiry.createdAt).toLocaleString()}
              </div>
              <button 
                onClick={() => toggleReadStatus(selectedInquiry.id)}
                className={`flex items-center gap-2 px-6 py-2 border-2 border-[#FAF9F6] font-black text-[11px] uppercase tracking-widest transition-all ${
                  selectedInquiry.isRead ? 'bg-[#FAF9F6] text-black' : 'bg-transparent text-[#FAF9F6]'
                }`}
              >
                <CheckCircle size={14} />
                {selectedInquiry.isRead ? '처리 완료' : '미처리'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-black/5 opacity-10">
            <Mail size={80} strokeWidth={0.5} />
            <p className="text-xl font-black uppercase tracking-[0.5em] mt-8 text-center leading-loose">
              SELECT_AN_INQUIRY<br/>TO_READ_DETAILS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryManagementView;
