import { useState, useEffect } from "react";
import { fetchSkills, updateSkillStatus, Skill } from "../api";
import { useAuth } from "../auth";
import { Check, X, RefreshCw, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

// Admin emails — replace with your email
const ADMIN_EMAILS = ["2396143108@qq.com"];

export default function Admin() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const d = await fetchSkills(); d.sort((a, b) => { if (a.status === 'pending' && b.status !== 'pending') return -1; if (a.status !== 'pending' && b.status === 'pending') return 1; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); }); setSkills(d); } catch { toast.error("加载数据失败"); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const hs = async (slug: string, status: 'approved' | 'rejected') => {
    try { await updateSkillStatus(slug, status); toast.success(status === 'approved' ? "已通过" : "已拒绝"); setSkills(p => p.map(s => s.slug === slug ? { ...s, status } : s)); } catch { toast.error("操作失败"); }
  };

  const pending = skills.filter(s => s.status === 'pending');
  const others = skills.filter(s => s.status !== 'pending');

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <ShieldAlert size={48} className="mx-auto mb-4 text-amber-500" />
        <h1 className="text-2xl font-bold mb-2">需要管理员权限</h1>
        <p className="text-neutral-500">请使用管理员邮箱登录后访问</p>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto px-4 py-12 flex justify-center"><RefreshCw size={24} className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold">管理后台</h1><p className="text-neutral-500 mt-1">审核和管理所有提交的 Skills</p></div><button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />刷新数据</button></div>

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">待审核 <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 text-xs px-2 py-0.5 rounded-full">{pending.length}</span></h2>
        {pending.length === 0 ? <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center text-neutral-500"><Check size={32} className="mb-2 text-green-500 opacity-50 mx-auto" /><p>暂无待审核的条目</p></div> : (
          <div className="space-y-4">
            {pending.map(s => (
              <div key={s.slug} className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3"><h3 className="text-lg font-bold">{s.name}</h3><span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{s.category}</span><span className="text-xs text-neutral-500">{s.createdAt ? formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: zhCN }) : ''}</span></div>
                  <div className="text-sm text-neutral-500"><span className="font-medium mr-2">作者:</span>{s.author}{s.githubUsername && <span className="ml-2 text-neutral-400">(@{s.githubUsername})</span>}</div>
                  <p className="text-sm bg-neutral-50 dark:bg-neutral-950 p-3 rounded-md border">{s.description}</p>
                  <div><span className="text-xs font-medium text-neutral-500 block mb-1">SKILL.md预览:</span><pre className="text-xs font-mono bg-neutral-50 dark:bg-neutral-950 p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">{s.content.substring(0, 400)}{s.content.length > 400 ? '...' : ''}</pre></div>
                  <div><span className="text-xs font-medium text-neutral-500 block mb-1">安装命令:</span><code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded block">{s.installCommand}</code></div>
                </div>
                <div className="flex md:flex-col gap-3 justify-center md:border-l md:border-neutral-100 md:dark:border-neutral-800 md:pl-6">
                  <button onClick={() => hs(s.slug, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"><Check size={16} />通过</button>
                  <button onClick={() => hs(s.slug, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium"><X size={16} />拒绝</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">全部条目</h2>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800"><tr><th className="px-6 py-3 font-medium text-neutral-500">状态</th><th className="px-6 py-3 font-medium text-neutral-500">名称</th><th className="px-6 py-3 font-medium text-neutral-500">分类</th><th className="px-6 py-3 font-medium text-neutral-500">作者</th><th className="px-6 py-3 font-medium text-neutral-500">日期</th></tr></thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {others.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">暂无数据</td></tr> : others.map(s => (
                  <tr key={s.slug} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{s.status === 'approved' ? '已通过' : '已拒绝'}</span></td>
                    <td className="px-6 py-4 font-medium">{s.name}</td><td className="px-6 py-4 text-neutral-500">{s.category}</td><td className="px-6 py-4 text-neutral-500">{s.author}</td><td className="px-6 py-4 text-neutral-500">{new Date(s.createdAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
