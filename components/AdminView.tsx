
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
}

const AdminView: React.FC<AdminViewProps> = ({ 
  products, setProducts, orders, setOrders, customers, setCustomers, admins, setAdmins, formatPrice 
}) => {
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'customers' | 'admins'>('orders');

  const [pf, setPf] = useState({ name: '', platform: '', priceInclTax: '', outboundDate: '', deadline: '', specialNotes: '' });
  const [cf, setCf] = useState({ name: '', code: '' });
  const [af, setAf] = useState({ name: '', code: '' });

  const deleteItem = (type: string, id: string) => {
    if (!window.confirm('영구적으로 삭제하시겠습니까?')) return;
    if (type === 'products') setProducts(prev => prev.filter(p => p.id !== id));
    if (type === 'orders') setOrders(prev => prev.filter(o => o.id !== id));
    if (type === 'customers') setCustomers(prev => prev.filter(c => c.id !== id));
    if (type === 'admins') setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(pf.priceInclTax.replace(/,/g, ''));
    if (isNaN(priceNum)) return;
    setProducts([{ ...pf, id: `p_${Date.now()}`, priceInclTax: priceNum, createdAt: new Date().toISOString() }, ...products]);
    setPf({ name: '', platform: '', priceInclTax: '', outboundDate: '', deadline: '', specialNotes: '' });
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customers.some(c => c.code === cf.code.toUpperCase())) return alert('이미 존재하는 고객 코드입니다.');
    setCustomers([{ ...cf, id: `c_${Date.now()}`, code: cf.code.toUpperCase(), createdAt: new Date().toISOString() }, ...customers]);
    setCf({ name: '', code: '' });
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (admins.some(a => a.code === af.code.toUpperCase())) return alert('이미 존재하는 관리자 코드입니다.');
    setAdmins([{ ...af, id: `a_${Date.now()}`, code: af.code.toUpperCase(), createdAt: new Date().toISOString() }, ...admins]);
    setAf({ name: '', code: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in text-white">
      <div className="lg:col-span-3 space-y-8">
        {adminTab === 'products' && (
          <div className="bg-black p-8 brutal-border">
            <h2 className="text-[12px] font-black mb-8 flex items-center gap-3 uppercase tracking-widest">
              <PlusCircle size={14}/> 상품 등록
            </h2>
            <form className="space-y-4" onSubmit={handleAddProduct}>
              <input type="text" required value={pf.name} onChange={e => setPf({...pf, name: e.target.value})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-bold outline-none focus:border-white" placeholder="상품명" />
              <input type="text" required value={pf.platform} onChange={e => setPf({...pf, platform: e.target.value})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-bold outline-none uppercase focus:border-white" placeholder="플랫폼" />
              <input type="text" required value={pf.priceInclTax} onChange={e => setPf({...pf, priceInclTax: e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",")})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-black outline-none focus:border-white" placeholder="단가 (¥)" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <input type="date" required value={pf.outboundDate} onChange={e => setPf({...pf, outboundDate: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-white/20 text-[10px]" />
                <input type="date" required value={pf.deadline} onChange={e => setPf({...pf, deadline: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-white/20 text-[10px]" />
              </div>
              <button type="submit" className="w-full bg-white text-black mt-6 py-4 font-black text-[11px] uppercase tracking-widest">상품 추가</button>
            </form>
          </div>
        )}

        {adminTab === 'customers' && (
          <div className="bg-black p-8 brutal-border">
            <h3 className="text-[12px] font-black uppercase tracking-widest mb-8 flex items-center gap-3"><UserPlus size={14}/> 고객 등록</h3>
            <form onSubmit={handleRegisterCustomer} className="space-y-4">
              <input type="text" required value={cf.name} onChange={e => setCf({...cf, name: e.target.value})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-bold outline-none focus:border-white" placeholder="고객 성함" />
              <input type="text" required value={cf.code} onChange={e => setCf({...cf, code: e.target.value.toUpperCase()})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-black outline-none uppercase focus:border-white" placeholder="인증 코드" />
              <button type="submit" className="w-full bg-white text-black mt-6 py-4 font-black text-[11px] uppercase tracking-widest">등록</button>
            </form>
          </div>
        )}

        {adminTab === 'admins' && (
          <div className="bg-black p-8 brutal-border">
            <h3 className="text-[12px] font-black uppercase tracking-widest mb-8 flex items-center gap-3"><ShieldCheck size={14}/> 관리자 관리</h3>
            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <input type="text" required value={af.name} onChange={e => setAf({...af, name: e.target.value})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-bold outline-none focus:border-white" placeholder="관리자명" />
              <input type="text" required value={af.code} onChange={e => setAf({...af, code: e.target.value.toUpperCase()})} className="w-full px-4 py-4 bg-transparent border-b-2 border-white/20 text-[12px] font-black outline-none uppercase focus:border-white" placeholder="관리자 코드" />
              <button type="submit" className="w-full bg-white text-black mt-6 py-4 font-black text-[11px] uppercase tracking-widest">권한 부여</button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-9 space-y-10">
        <div className="flex flex-wrap gap-8 border-b-2 border-white/10">
          {[
            { id: 'orders', label: '주문 레지스트리', icon: ClipboardList },
            { id: 'products', label: '인벤토리 현황', icon: Package },
            { id: 'customers', label: '고객 데이터', icon: Users },
            { id: 'admins', label: '관리자 권한', icon: ShieldCheck }
          ].map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`pb-5 text-[12px] font-black flex items-center gap-3 uppercase tracking-widest transition-all border-b-4 ${adminTab === tab.id ? 'border-white opacity-100' : 'border-transparent opacity-30 hover:opacity-100'}`}>
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-black border-2 border-white min-h-[500px] brutal-shadow">
          {adminTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-white text-black font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">날짜</th>
                    <th className="px-8 py-5">고객</th>
                    <th className="px-8 py-5">상품</th>
                    <th className="px-8 py-5 text-center">수량</th>
                    <th className="px-8 py-5 text-right">총액</th>
                    <th className="px-8 py-5 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-white/5 font-bold">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-8 text-[10px] font-mono opacity-40">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-8">{o.customerName}<span className="ml-2 opacity-20">#{o.customerCode}</span></td>
                      <td className="px-8 py-8 uppercase tracking-tighter text-sm">{o.productName}</td>
                      <td className="px-8 py-8 text-center text-xl font-black">{o.quantity}</td>
                      <td className="px-8 py-8 text-right font-black italic text-xl">¥{formatPrice(o.totalPriceInclTax)}</td>
                      <td className="px-8 py-8 text-center">
                        <button onClick={() => deleteItem('orders', o.id)} className="opacity-20 hover:opacity-100 text-white transition-opacity"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={6} className="py-40 text-center opacity-10 italic uppercase tracking-[1em]">NO_RECORDS</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === 'products' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map(p => (
                <div key={p.id} className="p-8 border-2 border-white/10 flex justify-between items-start hover:border-white transition-all group">
                  <div className="flex-1">
                    <span className="inline-block bg-white text-black text-[9px] font-black px-2 py-0.5 mb-4 italic uppercase">{p.platform}</span>
                    <h4 className="editorial-title text-2xl mb-2">{p.name}</h4>
                    <div className="text-3xl font-black mb-6 italic tracking-tighter">¥{formatPrice(p.priceInclTax)}</div>
                  </div>
                  <button onClick={() => deleteItem('products', p.id)} className="opacity-20 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                </div>
              ))}
              {products.length === 0 && <div className="col-span-2 py-40 text-center opacity-10 italic uppercase tracking-widest">INVENTORY_EMPTY</div>}
            </div>
          )}

          {adminTab === 'customers' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(c => (
                <div key={c.id} className="p-6 border-2 border-white/10 flex justify-between items-center group hover:border-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black italic text-lg">{c.name.slice(0,1)}</div>
                    <div>
                      <p className="font-black text-[13px] uppercase tracking-tight">{c.name}</p>
                      <p className="text-[10px] font-black opacity-30 mt-1 tracking-widest">코드: {c.code}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteItem('customers', c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}

          {adminTab === 'admins' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map(a => (
                <div key={a.id} className="p-6 border-2 border-white flex justify-between items-center group bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black brutal-border flex items-center justify-center font-black italic text-lg text-white">A</div>
                    <div>
                      <p className="font-black text-[13px] uppercase tracking-tight">{a.name}</p>
                      <p className="text-[10px] font-black opacity-60 mt-1 tracking-widest">인증키: {a.code}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteItem('admins', a.id)} className="opacity-20 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
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
