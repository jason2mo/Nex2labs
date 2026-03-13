
import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { ScopePost, ScopeCategory } from '../types';

interface ScopeDetailViewProps {
  categories: ScopeCategory[];
  categoryId: string;
  posts: ScopePost[];
  onBack: () => void;
}

const ScopeDetailView: React.FC<ScopeDetailViewProps> = ({ categories, categoryId, posts, onBack }) => {
  const category = categories.find(c => c.id === categoryId);
  const filteredPosts = posts.filter(p => p.category === categoryId);

  return (
    <div className="space-y-16 animate-fade-in text-white max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-[#FF6B00] transition-all">
        <ArrowLeft size={16} /> 돌아가기
      </button>

      <div className="border-b-2 md:border-b-4 border-[#FF6B00] pb-8 md:pb-12">
        <h2 className="big-title text-3xl md:text-5xl mb-4 md:mb-6">{category?.title}</h2>
        <p className="text-lg md:text-xl font-bold text-white/60 leading-relaxed">{category?.desc}</p>
      </div>

      <div className="space-y-12 md:space-y-24">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <article key={post.id} className="space-y-6 md:space-y-8 group">
              <div className="flex items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">
                <Clock size={14} />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform text-white">{post.title}</h3>
              
              <div className="p-6 md:p-12 border border-white/10 bg-white/5 text-white space-y-6 md:space-y-8">
                {post.imageUrl && (
                  <div className="w-full h-48 md:h-80 overflow-hidden border border-white/20">
                    <img src={post.imageUrl} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Post" />
                  </div>
                )}
                <div className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="py-40 text-center text-white/30 italic uppercase tracking-[1em] text-2xl">
            등록된 포스트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScopeDetailView;
