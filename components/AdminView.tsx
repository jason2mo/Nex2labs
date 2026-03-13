
import React, { useState } from 'react';
import { PlusCircle, Trash2, ShieldCheck, UserPlus, Package, Users, ClipboardList } from 'lucide-react';
import { Product, Order, Customer, Admin } from '../types';

interface AdminViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  formatPrice: (val: number | string) => string;
  onDeleteItem: (type: 'products' | 'orders' | 'customers' | 'admins', id: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  products, setProducts, orders, setOrders, customers, setCustomers, admins, setAdmins, formatPrice, onDeleteItem
}) => {
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'customers' | 'admins'>('orders');

  const [pf, setPf] = useState({ name: '', platform: '', priceInclTax: '', outboundDate: '', deadline: '', specialNotes: '' });
  const [cf, setCf] = useState({ name: '', code: '' });
  const [af, setAf] = useState({ name: '', code: '' });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(pf.priceInclTax.replace(/,/g, ''));
    if (isNaN(priceNum)) return;
    
    const newId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProduct: Product = { 
      ...pf, 
      id: newId, 
      priceInclTax: priceNum, 
      createdAt: new Date().toISOString() 
    };
    
    setProducts([newProduct, ...products]);
    setPf({ name: '', platform: '', priceInclTax: '', outboundDate: '', deadline: '', specialNotes: '' });
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customers.some(c => c.code === cf.code.toUpperCase())) return alert('이미 존재하는 고객 코드입니다.');
    const newId = `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCustomers([{ ...cf, id: newId, code: cf.code.toUpperCase(), createdAt: new Date().toISOString() }, ...customers]);
    setCf({ name: '', code: '' });
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admins.some(a => a.code === af.code.toUpperCase())) return alert('이미 존재하는 관리자 코드입니다.');
    const newId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setAdmins([{ ...af, id: newId, code: af.code.toUpperCase(), createdAt: new Date().toISOString() }, ...admins]);
    setAf({ name: '', code: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in text-black">
      <div className="lg:col-span-3 space-y-6 md:space-y-8">
        {adminTab === 'products' && (
          <div className="bg-[#FAF9F6] p-6 md:p-8 brutal-border">
            <h2 className="text-[11px] md:text-[12px] font-black mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-widest">
              <PlusCircle size={14}/> 상품 등록
            </h2>
            <form className="space-y-4" onSubmit={handleAddProduct}>
              <input type="text" required value={pf.name} onChange={e => setPf({...pf, name: e.target.value})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-bold outline-none focus:border-black transition-all" placeholder="상품명" />
              <input type="text" required value={pf.platform} onChange={e => setPf({...pf, platform: e.target.value})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-bold outline-none uppercase focus:border-black transition-all" placeholder="플랫폼" />
              <input type="text" required value={pf.priceInclTax} onChange={e => setPf({...pf, priceInclTax: e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",")})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-black outline-none focus:border-black transition-all" placeholder="단가 (¥)" />
              <div className="grid grid-cols-2 gap-4 pt-2 md:pt-4">
                <div className="space-y-1">
                  <label className="text-[8px] opacity-30 uppercase font-black">출고일</label>
                  <input type="date" required value={pf.outboundDate} onChange={e => setPf({...pf, outboundDate: e.target.value})} className="w-full px-2 md:px-4 py-2 md:py-3 bg-[#FAF9F6] border border-black/20 text-[10px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] opacity-30 uppercase font-black">마감일</label>
                  <input type="date" required value={pf.deadline} onChange={e => setPf({...pf, deadline: e.target.value})} className="w-full px-2 md:px-4 py-2 md:py-3 bg-[#FAF9F6] border border-black/20 text-[10px]" />
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-[#FAF9F6] mt-4 md:mt-6 py-3 md:py-4 font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all">상품 추가</button>
            </form>
          </div>
        )}

        {adminTab === 'customers' && (
          <div className="bg-[#FAF9F6] p-6 md:p-8 brutal-border">
            <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3"><UserPlus size={14}/> 고객 등록</h3>
            <form onSubmit={handleRegisterCustomer} className="space-y-4">
              <input type="text" required value={cf.name} onChange={e => setCf({...cf, name: e.target.value})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-bold outline-none focus:border-black transition-all" placeholder="고객 성함" />
              <input type="text" required value={cf.code} onChange={e => setCf({...cf, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-black outline-none uppercase focus:border-black transition-all" placeholder="인증 코드" />
              <button type="submit" className="w-full bg-black text-[#FAF9F6] mt-4 md:mt-6 py-3 md:py-4 font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all">등록</button>
            </form>
          </div>
        )}

        {adminTab === 'admins' && (
          <div className="bg-[#FAF9F6] p-6 md:p-8 brutal-border">
            <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3"><ShieldCheck size={14}/> 관리자 관리</h3>
            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <input type="text" required value={af.name} onChange={e => setAf({...af, name: e.target.value})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-bold outline-none focus:border-black transition-all" placeholder="관리자명" />
              <input type="text" required value={af.code} onChange={e => setAf({...af, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3 md:py-4 bg-transparent border-b-2 border-black/20 text-[11px] md:text-[12px] font-black outline-none uppercase focus:border-black transition-all" placeholder="관리자 코드" />
              <button type="submit" className="w-full bg-black text-[#FAF9F6] mt-4 md:mt-6 py-3 md:py-4 font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all">권한 부여</button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-9 space-y-10">
        <div className="flex flex-nowrap overflow-x-auto gap-4 md:gap-8 border-b border-black/10 no-scrollbar">
          {[
            { id: 'orders', label: '주문', icon: ClipboardList },
            { id: 'products', label: '인벤토리', icon: Package },
            { id: 'customers', label: '고객', icon: Users },
            { id: 'admins', label: '관리자', icon: ShieldCheck }
          ].map(tab => (
            <button 
              key={tab.id} 
              type="button" 
              onClick={() => setAdminTab(tab.id as any)} 
              className={`pb-4 md:pb-5 text-[10px] md:text-[12px] font-black flex items-center gap-2 md:gap-3 uppercase tracking-widest transition-all border-b-2 md:border-b-4 shrink-0 ${adminTab === tab.id ? 'border-black opacity-100' : 'border-transparent opacity-30 hover:opacity-100'}`}
            >
              <tab.icon size={14} md:size={16}/> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#FAF9F6] border-2 border-black min-h-[500px] brutal-shadow overflow-hidden">
          {adminTab === 'orders' && (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <table className="w-full text-left text-[11px] hidden md:table">
                <thead className="bg-black text-[#FAF9F6] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">날짜</th>
                    <th className="px-8 py-5">고객</th>
                    <th className="px-8 py-5">상품</th>
                    <th className="px-8 py-5 text-center">수량</th>
                    <th className="px-8 py-5 text-right">총액</th>
                    <th className="px-8 py-5 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-bold">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-black/5 transition-colors group">
                      <td className="px-8 py-8 text-[10px] font-mono opacity-40">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-8">{o.customerName}<span className="ml-2 opacity-20">#{o.customerCode}</span></td>
                      <td className="px-8 py-8 uppercase tracking-tighter text-sm">{o.productName}</td>
                      <td className="px-8 py-8 text-center text-xl font-black italic">{o.quantity}</td>
                      <td className="px-8 py-8 text-right font-black italic text-xl">¥{formatPrice(o.totalPriceInclTax)}</td>
                      <td className="px-8 py-8 text-center">
                        <button 
                          type="button" 
                          onClick={() => onDeleteItem('orders', o.id)} 
                          className="p-3 bg-red-600/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-black/10">
                {orders.map(o => (
                  <div key={o.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono opacity-40">{new Date(o.createdAt).toLocaleString()}</p>
                        <p className="font-black text-sm uppercase">{o.productName}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => onDeleteItem('orders', o.id)} 
                        className="p-2 bg-red-600/10 text-red-500 rounded-lg"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] opacity-40 uppercase">고객</p>
                        <p className="text-xs font-bold">{o.customerName} <span className="opacity-20">#{o.customerCode}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-40 uppercase">수량: {o.quantity}</p>
                        <p className="text-lg font-black italic">¥{formatPrice(o.totalPriceInclTax)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(orders.length === 0) && (
                <div className="py-40 text-center text-black/60 font-black italic uppercase tracking-[0.5em] md:tracking-[1em]">NO_RECORDS</div>
              )}
            </div>
          )}

          {adminTab === 'products' && (
            <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              {products.map(p => (
                <div key={p.id} className="p-6 md:p-8 border border-black/10 flex justify-between items-start hover:border-black transition-all group bg-black/[0.02]">
                  <div className="flex-1 pr-4 md:pr-6 pointer-events-none">
                    <span className="inline-block bg-black text-[#FAF9F6] text-[8px] md:text-[9px] font-black px-2 py-0.5 mb-3 md:mb-4 italic uppercase tracking-widest">{p.platform}</span>
                    <h4 className="editorial-title text-xl md:text-2xl mb-2 leading-tight">{p.name}</h4>
                    <div className="text-2xl md:text-3xl font-black mb-4 md:mb-6 italic tracking-tighter text-black/90">¥{formatPrice(p.priceInclTax)}</div>
                    <div className="flex flex-wrap gap-3 md:gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-40 transition-opacity">
                       <span>ID: {p.id.split('_').pop()?.toUpperCase()}</span>
                       <span>MOD: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => onDeleteItem('products', p.id)} 
                    className="p-3 md:p-4 bg-red-600/10 text-red-500 rounded-xl md:rounded-2xl opacity-100 group-hover:bg-red-600 group-hover:text-white transition-all active:scale-90 relative z-20"
                  >
                    <Trash2 size={18} md:size={20}/>
                  </button>
                </div>
              ))}
              {products.length === 0 && <div className="col-span-full py-40 text-center text-black/60 font-black italic uppercase tracking-widest">INVENTORY_EMPTY</div>}
            </div>
          )}

          {adminTab === 'customers' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(c => (
                <div key={c.id} className="p-6 border-2 border-black/10 flex justify-between items-center group hover:border-black transition-all bg-black/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black text-[#FAF9F6] flex items-center justify-center font-black italic text-lg">{c.name.slice(0,1)}</div>
                    <div>
                      <p className="font-black text-[13px] uppercase tracking-tight">{c.name}</p>
                      <p className="text-[10px] font-black opacity-30 mt-1 tracking-widest">코드: {c.code}</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => onDeleteItem('customers', c.id)} 
                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'admins' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map(a => (
                <div key={a.id} className="p-6 border-2 border-black flex justify-between items-center group bg-black/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FAF9F6] brutal-border border-black/30 flex items-center justify-center font-black italic text-lg text-black">A</div>
                    <div>
                      <p className="font-black text-[13px] uppercase tracking-tight">{a.name}</p>
                      <p className="text-[10px] font-black opacity-60 mt-1 tracking-widest">인증키: {a.code}</p>
                    </div>
                  </div>
                  {a.id !== 'master' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
