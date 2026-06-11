import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Heart, Download, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchSkills, Skill } from "../api";
import { toast } from "sonner";

const CATS = ["全部", "论文写作", "求职就业", "编程开发", "考试备考", "其他"];

export default function Home() {
  const [sp, setSp] = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("全部");
  const [page, setPage] = useState(1);
  const PER_PAGE = 30;

  useEffect(() => {
    if (sp.get("submitted") === "1") { toast.success("提交成功，等待审核", { duration: 3000 }); setSp({}); }
    fetchSkills().then(d => { setSkills(d.filter(s => s.status === "approved")); setLoading(false); }).catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const filtered = skills.filter(s => {
    const mc = cat === "全部" || s.category === cat;
    const ms = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.description.toLowerCase().includes(q.toLowerCase());
    return mc && ms;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when filters change
  const changeCat = (c: string) => { setCat(c); setPage(1); };
  const changeQ = (v: string) => { setQ(v); setPage(1); };

  const totalInstalls = skills.reduce((a, s) => a + (s.installs || 0), 0);
  const totalLikes = skills.reduce((a, s) => a + (s.likes || 0), 0);

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-50 to-white dark:from-neutral-900 dark:to-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">校园<span className="text-indigo-600 dark:text-indigo-400">AI</span>站</h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">汇集学习、求职、科研的专属 AI 技能。支持 Claude Code · Trae · Cursor · Codex，一个 Skill 到处用。</p>
          {!loading && (
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex flex-col"><span className="text-3xl font-bold">{skills.length}</span><span className="text-sm text-neutral-500">个有效技能</span></div>
              <div className="h-10 w-px bg-neutral-300 dark:bg-neutral-700" />
              <div className="flex flex-col"><span className="text-3xl font-bold">{totalInstalls}</span><span className="text-sm text-neutral-500">次总安装量</span></div>
              <div className="h-10 w-px bg-neutral-300 dark:bg-neutral-700" />
              <div className="flex flex-col"><span className="text-3xl font-bold">{totalLikes}</span><span className="text-sm text-neutral-500">次总点赞量</span></div>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {CATS.map(c => (
              <button key={c} onClick={() => changeCat(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"}`}>{c}</button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input type="text" placeholder="搜索技能关键词..." value={q} onChange={e => changeQ(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-2xl h-64" />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map(s => (
                <Link to={`/skill/${s.slug}`} key={s.slug} className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{s.name}</h3>
                    <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md whitespace-nowrap ml-2">{s.category}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3 flex-grow">{s.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{s.author.charAt(0).toUpperCase()}</div>
                      <span className="truncate max-w-[100px]">{s.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Heart size={14} className={s.likes > 0 ? "text-red-500" : ""} />{s.likes || 0}</span>
                      <span className="flex items-center gap-1"><Download size={14} />{s.installs || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />上一页
                </button>
                <span className="text-sm text-neutral-500 px-2">
                  第 {page} / {totalPages} 页（共 {filtered.length} 个）
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  下一页<ChevronRight size={16} />
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-neutral-100 dark:bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Search size={32} className="text-neutral-400" /></div>
              <h3 className="text-lg font-medium mb-2">未找到相关技能</h3>
              <p className="text-neutral-500 mb-6">还没有符合条件的技能，去提交一个？</p>
              <Link to="/submit" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">成为第一个提交的人 <ArrowRight size={18} /></Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
