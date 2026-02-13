
import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, X, Upload } from 'lucide-react';
import { Product, Order, Session } from '../types';

interface CustomerViewProps {
  session: Session;
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  formatPrice: (val: number | string) => string;
}

const CustomerView: React.FC<CustomerViewProps> = ({ session, products, orders, setOrders, formatPrice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const placeOrder = (p: Product) => {
    const q = parseInt(qtys[p.id]);
    if (!q || q <= 0) return alert('수량을 입력해주세요.');
    setOrders([{ id: `o_${Date.now()}`, productId: p.id, productName: p.name, platform: p.platform, customerName: session.data!.name, customerCode: session.data!.code, quantity: q, pricePerUnitInclTax: p.priceInclTax, totalPriceInclTax: p.priceInclTax * q, createdAt: new Date().toISOString(), paymentProof: null }, ...orders]);
    setQtys({ ...qtys, [p.id]: '' });
    alert('성공적으로 주문되었습니다.');
  };

  const handleUploadImg = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return alert('이미지 파일은 최대 2MB까지만 가능합니다.');
    const reader = new FileReader();
    reader.onload = (event) => setOrders(orders.map(o => o.id === orderId ? { ...o, paymentProof: event.target?.result as string } : o));
    reader.readAsDataURL(file);
  };

  const myOrders = useMemo(() => session.data ? orders.filter(o => o.customerCode === session.data!.code) : [], [orders, session]);
  const isExpired = (deadlineStr: string) => new Date() > new Date(deadlineStr);
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.platform.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-24 animate-fade-in pb-40 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 border-b-4 border-white pb-12">
        <div className="flex items-center gap-8">
          <div className="w-5 h-5 bg-white rounded-full animate-pulse shadow-[0_0_15px_white]"></div>
          <h2 className="editorial-title text-5xl">INVENTORY_LIVE.</h2>
        </div>
        <div className="relative w-full md:w-[450px]">
          <input 
            type="text" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="인벤토리 검색..." 
            className="w-full pl-0 pr-12 py-5 bg-transparent border-b-2 border-white/20 text-xl font-black uppercase tracking-tighter outline-none placeholder:text-white/10 focus:border-white transition-all" 
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30" size={28} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {filtered.map(product => {
          const expired = isExpired(product.deadline);
          return (
            <div key={product.id} className={`group flex flex-col ${expired ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
              <div className="bg-black brutal-border aspect-square relative p-12 flex flex-col justify-between transition-all group-hover:bg-white/5 group-hover:shadow-[12px_12px_0_0_white]">
                <div className="flex justify-between items-start">
                   <span className="bg-white text-black text-[11px] font-black px-3 py-1 uppercase tracking-widest italic">{product.platform}</span>
                   {!expired && <div className="text-[10px] font-black border-2 border-white px-3 py-1 uppercase tracking-widest bg-black">입고 완료</div>}
                </div>
                
                <div>
                  <h3 className="text-3xl font-black leading-none mb-4 uppercase tracking-tighter truncate" title={product.name}>{product.name}</h3>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black italic tracking-tighter">¥{formatPrice(product.priceInclTax)}</span>
                    <span className="text-[11px] font-black opacity-30 uppercase tracking-widest">단가</span>
                  </div>
                </div>
                
                <div className="pt-8 border-t-2 border-white/10 flex justify-between items-center text-[11px] font-black uppercase tracking-widest opacity-50">
                  <div className="flex items-center gap-3"><Calendar size={18}/> {product.outboundDate}</div>
                  <div className="flex items-center gap-3"><Clock size={18}/> {product.deadline} 마감</div>
                </div>
              </div>

              {!expired && (
                <div className="mt-8 flex items-center gap-4">
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="수량" 
                    value={qtys[product.id] || ''} 
                    onChange={e => setQtys({...qtys, [product.id]: e.target.value})} 
                    className="w-24 px-4 py-5 bg-black brutal-border text-2xl font-black text-center outline-none focus:bg-white/10 transition-colors" 
                  />
                  <button 
                    onClick={() => placeOrder(product)} 
                    className="flex-1 bg-white text-black py-5 font-black text-sm uppercase tracking-[0.4em] border-2 border-white hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    주문 추가하기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {session.type === 'customer' && (
        <section className="pt-32 border-t-4 border-white space-y-20">
          <div className="flex justify-between items-end">
             <h2 className="editorial-title text-6xl">ACTIVITY_LOG.</h2>
             <span className="text-[11px] font-black opacity-40 tracking-[0.5em] uppercase">개인 주문 내역</span>
          </div>

          <div className="bg-black border-4 border-white overflow-hidden brutal-shadow">
            <table className="w-full text-left">
              <thead className="bg-white text-black text-[12px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-8">주문일시</th>
                  <th className="px-10 py-8">상품 정보</th>
                  <th className="px-10 py-8 text-center">수량</th>
                  <th className="px-10 py-8 text-right">금액</th>
                  <th className="px-10 py-8 text-center">결제 증빙</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/10 font-bold text-sm">
                {myOrders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-10 py-10 text-[11px] font-mono opacity-40">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-10 py-10 uppercase tracking-tighter text-lg">{o.productName}</td>
                    <td className="px-10 py-10 text-center text-3xl font-black italic">{o.quantity}</td>
                    <td className="px-10 py-10 text-right text-3xl font-black italic">¥{formatPrice(o.totalPriceInclTax)}</td>
                    <td className="px-10 py-10 text-center">
                      <div className="flex justify-center">
                        {o.paymentProof ? (
                          <button onClick={() => setSelectedImg(o.paymentProof!)} className="w-16 h-20 bg-white brutal-border overflow-hidden hover:scale-105 transition-all">
                            <img src={o.paymentProof} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="Proof" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <label className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white border-2 border-white transition-all flex items-center gap-2">
                              <Upload size={12} /> 증빙 업로드
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImg(o.id, e)} />
                            </label>
                            <span className="text-[8px] font-bold opacity-30 tracking-tight">* 영수증 스크린샷 권장</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {myOrders.length === 0 && <tr><td colSpan={5} className="py-40 text-center opacity-10 font-black italic uppercase tracking-[1em] text-2xl">데이터가 없습니다</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-12 backdrop-blur-md" onClick={() => setSelectedImg(null)}>
          <div className="relative animate-fade-in bg-black p-4 border-4 border-white">
            <button className="absolute -top-16 right-0 text-white p-2"><X size={40}/></button>
            <img src={selectedImg} className="max-w-full max-h-[80vh] border border-white/20" alt="Evidence Asset" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
