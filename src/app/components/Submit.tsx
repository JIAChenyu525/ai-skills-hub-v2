import { useState } from "react";
import { useNavigate } from "react-router";
import { createSkill } from "../api";
import { useAuth } from "../auth";
import { toast } from "sonner";
import { Send, AlertCircle, LogIn, Sparkles } from "lucide-react";
import { LoginModal } from "./LoginModal";

const CATS = ["论文写作", "求职就业", "编程开发", "考试备考", "其他"];

export default function Submit() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({ name: "", slug: "", category: CATS[0], author: "", description: "", content: "", installCommand: "", githubRepo: "", githubUsername: "" });

  const hc = (e: any) => {
    const { name, value } = e.target;
    if (name === "slug") setF(p => ({ ...p, [name]: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
    else setF(p => ({ ...p, [name]: value }));
  };

  const hs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowLogin(true); return; }
    setError("");
    if (!f.name || !f.slug || !f.author || !f.description || !f.content || !f.installCommand) { setError("请填写所有必填字段"); return; }
    setLoading(true);
    try { await createSkill({ ...f, author: user.email || f.author }); nav("/?submitted=1"); } catch (err: any) { setError(err.message.includes("already exists") ? "Slug已被使用" : err.message); } finally { setLoading(false); }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">
          <Sparkles size={40} className="mx-auto mb-4 text-indigo-500" />
          <h1 className="text-2xl font-bold mb-2">登录后提交 Skill</h1>
          <p className="text-neutral-500 mb-6">登录后可以提交和管理你的 AI 技能</p>
          <button onClick={() => setShowLogin(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"><LogIn size={18} />登录 / 注册</button>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8 text-center"><h1 className="text-3xl font-bold mb-2">提交你的 Skill</h1><p className="text-neutral-500">分享你的AI技能，帮助更多同学。提交后需管理员审核。</p></div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex items-start gap-3 text-red-600"><AlertCircle size={20} className="shrink-0 mt-0.5" /><p className="text-sm">{error}</p></div>}
        <form onSubmit={hs} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="block text-sm font-medium">技能名称 <span className="text-red-500">*</span></label><input name="name" required value={f.name} onChange={hc} placeholder="例如：沉浸式论文润色" className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
            <div className="space-y-2"><label className="block text-sm font-medium">Slug (URL标识) <span className="text-red-500">*</span></label><input name="slug" required value={f.slug} onChange={hc} placeholder="paper-polish-v1" className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" /><p className="text-xs text-neutral-500">只能包含小写字母、数字和连字符(-)</p></div>
            <div className="space-y-2"><label className="block text-sm font-medium">分类 <span className="text-red-500">*</span></label><select name="category" required value={f.category} onChange={hc} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="space-y-2"><label className="block text-sm font-medium">作者名 <span className="text-red-500">*</span></label><input name="author" required value={f.author} onChange={hc} placeholder="你的名字/昵称" className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
          </div>
          <div className="space-y-2"><label className="block text-sm font-medium">简短描述 <span className="text-red-500">*</span></label><textarea name="description" required rows={2} value={f.description} onChange={hc} placeholder="一两句话说明这个技能是做什么的..." className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" /></div>
          <div className="space-y-2"><label className="block text-sm font-medium">SKILL.md 完整内容 <span className="text-red-500">*</span></label><textarea name="content" required rows={10} value={f.content} onChange={hc} placeholder="# 技能介绍&#10;&#10;详细说明该技能的使用方法..." className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm" /></div>
          <div className="space-y-2"><label className="block text-sm font-medium">安装命令 <span className="text-red-500">*</span></label><input name="installCommand" required value={f.installCommand} onChange={hc} placeholder="git clone https://..." className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="block text-sm font-medium">GitHub 仓库 <span className="text-neutral-400">(选填)</span></label><input name="githubRepo" value={f.githubRepo} onChange={hc} placeholder="https://github.com/..." className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
            <div className="space-y-2"><label className="block text-sm font-medium">GitHub 用户名 <span className="text-neutral-400">(选填)</span></label><input name="githubUsername" value={f.githubUsername} onChange={hc} placeholder="username" className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" /></div>
          </div>
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800"><button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>{loading ? "提交中..." : <><Send size={18} />提交审核</>}</button></div>
        </form>
      </div>
    </div>
  );
}
