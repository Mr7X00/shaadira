import React, { useState, useEffect } from 'react';
import { Layout, Globe, Search, MessageSquare, Save, RefreshCcw, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface CMSContent {
  heroTitle: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  faqList: { question: string; answer: string }[];
}

export const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<CMSContent>({
    heroTitle: 'Find Your Perfect Henna Artist',
    heroSubtitle: 'Connecting you with the finest Mehndi masters for your special day',
    seoTitle: 'Shaadira | Premium Henna Artist Marketplace',
    seoDescription: 'Book verified henna artists for weddings and events in India.',
    seoKeywords: 'henna, mehndi, artist, wedding, shaadira',
    faqList: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'seo' | 'faq'>('hero');

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/cms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) setContent(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error fetching CMS:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCMS();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        alert("Content published successfully!");
      }
    } catch (error) {
      console.error("Error saving CMS:", error);
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = () => {
    setContent(prev => ({
      ...prev,
      faqList: [...prev.faqList, { question: '', answer: '' }]
    }));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newList = [...content.faqList];
    newList[index][field] = value;
    setContent(prev => ({ ...prev, faqList: newList }));
  };

  if (loading) return <div className="p-12 text-center text-slate-500 italic">Accessing content distribution network...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">SEO & Content Management</h3>
          <p className="text-slate-400 text-xs mt-1">Manage public landing page content, meta tags, and marketing copy</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
        >
          {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        {[
          { id: 'hero', label: 'Hero Section', icon: Layout },
          { id: 'seo', label: 'SEO Metadata', icon: Globe },
          { id: 'faq', label: 'FAQ Registry', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {activeSection === 'hero' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-left-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Main Hero Headline</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                    value={content.heroTitle}
                    onChange={(e) => setContent({...content, heroTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Subtitle / Subtext</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all h-24 resize-none"
                    value={content.heroSubtitle}
                    onChange={(e) => setContent({...content, heroSubtitle: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-slate-600">
                  <Sparkles className="w-3 h-3" />
                  PREVIEW
                </div>
                <div className="space-y-2 relative z-10">
                  <h1 className="text-xl font-bold font-display text-white">{content.heroTitle}</h1>
                  <p className="text-xs text-slate-400 max-w-xs">{content.heroSubtitle}</p>
                  <div className="pt-4 flex gap-2 justify-center">
                    <div className="px-4 py-1.5 bg-purple-600 rounded-lg text-[10px] font-bold text-white">Find Artists</div>
                    <div className="px-4 py-1.5 bg-slate-800 rounded-lg text-[10px] font-bold text-white">Join as Master</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'seo' && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center gap-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl mb-6">
              <Search className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs font-bold text-blue-300">Search Engine Optimization</p>
                <p className="text-[10px] text-blue-400/80">Updates here affect how Shaadira appears on Google, Bing, and Social Media.</p>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meta Title Tag</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  value={content.seoTitle}
                  onChange={(e) => setContent({...content, seoTitle: e.target.value})}
                />
                <p className="text-[10px] text-slate-600 italic">Recommended: 50-60 characters</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meta Description</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white h-20 resize-none"
                  value={content.seoDescription}
                  onChange={(e) => setContent({...content, seoDescription: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SEO Keywords (Comma Separated)</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  value={content.seoKeywords}
                  onChange={(e) => setContent({...content, seoKeywords: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">FAQ Registry</h4>
              <button 
                onClick={addFAQ}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                + Add FAQ Item
              </button>
            </div>
            
            <div className="space-y-4">
              {content.faqList.map((faq, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 relative group">
                  <input 
                    className="w-full bg-transparent border-b border-slate-800 py-1 text-xs font-bold text-white outline-none focus:border-purple-500"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
                  />
                  <textarea 
                    className="w-full bg-transparent text-xs text-slate-400 outline-none h-12 resize-none"
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      const newList = content.faqList.filter((_, i) => i !== idx);
                      setContent({...content, faqList: newList});
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-rose-950/30 text-rose-500 rounded transition-opacity"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {content.faqList.length === 0 && (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500">No FAQ items defined. Add one to help users understand the platform.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
