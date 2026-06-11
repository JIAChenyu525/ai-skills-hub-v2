import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Heart, Download, Github, Calendar, Terminal, Check, MessageCircle, Send, Star, Flag, AlertCircle } from "lucide-react";
import { fetchSkill, likeSkill, installSkill, Skill } from "../api";
import { useAuth, supabase } from "../auth";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

interface Comment { id: string; skill_slug: string; user_id: string; content: string; created_at: string; username?: string; avatar_url?: string; }

export default function SkillDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reporting, setReporting] = useState(false);

  useEffect(() => { if (!slug) return;
    fetchSkill(slug).then(d => { if (d.status !== "approved") setError(true); else setSkill(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); });
    loadComments(); loadRatings();
  }, [slug]);

  useEffect(() => { if (!slug) return;
    const likedSkills = JSON.parse(localStorage.getItem('liked_skills') || '[]');
    if (likedSkills.includes(slug)) setLiked(true);
  }, [slug]);

  const loadComments = async () => {
    if (!slug) return;
    const { data } = await supabase.from("comments").select("*").eq("skill_slug", slug).order("created_at", { ascending: true });
    if (!data) return;
    const withProfiles = await Promise.all(data.map(async (c: Comment) => {
      const { data: p } = await supabase.from("profiles").select("username,avatar_url").eq("user_id", c.user_id).single();
      return { ...c, username: p?.username || "匿名", avatar_url: p?.avatar_url || null };
    }));
    setComments(withProfiles);
  };

  const loadRatings = async () => {
    if (!slug) return;
    const { data } = await supabase.from("ratings").select("rating,user_id").eq("skill_slug", slug);
    if (!data || data.length === 0) return;
    setRatingCount(data.length);
    setAvgRating(Math.round(data.reduce((s: number, r: any) => s + r.rating, 0) / data.length * 10) / 10);
    if (user) { const mine = data.find((r: any) => r.user_id === user.id); if (mine) setUserRating(mine.rating); }
  };

  const handleRate = async (r: number) => {
    if (!user || !slug) return;
    setUserRating(r);
    const { error } = await supabase.from("ratings").upsert({ skill_slug: slug, user_id: user.id, rating: r }, { onConflict: "skill_slug,user_id" });
    if (error) { toast.error("评分失败"); return; }
    toast.success("评分成功！");
    await loadRatings();
  };

  const handleReport = async () => {
    if (!user || !slug) return;
    setReporting(true);
    const reason = prompt("请简要说明举报原因：");
    if (!reason) { setReporting(false); return; }
    const { error } = await supabase.from("reports").insert({ skill_slug: slug, user_id: user.id, reason });
    if (error) { toast.error("举报失败"); } else { toast.success("举报已提交，管理员会审核"); }
    setReporting(false);
  };

  const handleLike = async () => { if (liked || !skill) return; setLiked(true); setSkill(p => p ? { ...p, likes: (p.likes || 0) + 1 } : null);
    const likedSkills = JSON.parse(localStorage.getItem('liked_skills') || '[]');
    if (!likedSkills.includes(skill.slug)) { likedSkills.push(skill.slug); localStorage.setItem('liked_skills', JSON.stringify(likedSkills)); }
    try { await likeSkill(skill.slug); } catch { toast.error("点赞失败"); setLiked(false); setSkill(p => p ? { ...p, likes: (p.likes || 0) - 1 } : null); } };

  const handleCopy = async () => { if (!skill || copied) return;
    await navigator.clipboard.writeText(skill.installCommand); setCopied(true); toast.success("已复制到剪贴板");
    if (!hasInstalled) { setHasInstalled(true); setSkill(p => p ? { ...p, installs: (p.installs || 0) + 1 } : null); try { await installSkill(skill.slug); } catch {} }
    setTimeout(() => setCopied(false), 3000); };

  const handleComment = async () => { if (!user || !slug || !commentText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({ skill_slug: slug, user_id: user.id, content: commentText.trim() });
    if (error) { toast.error("评论失败"); setSubmitting(false); return; }
    setCommentText(""); setSubmitting(false); await loadComments(); toast.success("评论成功！"); };

  if (loading) return <div className="container mx-auto px-4 py-12 max-w-4xl"><div className="animate-pulse space-y-8"><div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-24" /><div className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" /><div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded w-full" /></div></div>;
  if (error || !skill) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-3xl font-bold mb-4">404 - 技能未找到</h2><p className="text-neutral-500 mb-8">该技能不存在或未通过审核</p><Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"><ArrowLeft size={18} />返回首页</Link></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8"><ArrowLeft size={16} />返回首页</Link>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md">{skill.category}</span>
              <span className="text-sm font-medium px-2.5 py-1 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 rounded-md">v1.0.0</span>
              {skill.createdAt && <span className="text-sm text-neutral-500 flex items-center gap-1"><Calendar size={14} />{formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true, locale: zhCN })}</span>}
              {/* Star Rating */}
              {ratingCount > 0 && (
                <span className="text-sm text-amber-500 flex items-center gap-0.5"><Star size={14} className="fill-amber-500" />{avgRating} <span className="text-neutral-400 ml-0.5">({ratingCount})</span></span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{skill.name}</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">{skill.description}</p>
            {/* Rating stars */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 mr-1">评分：</span>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => handleRate(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                  className={`text-xl transition-colors ${(hoverRating || userRating) >= n ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600 hover:text-amber-400"}`}
                  disabled={!user} title={user ? `评${n}星` : "请先登录"}>
                  <Star size={18} className={(hoverRating || userRating) >= n ? "fill-amber-500" : ""} />
                </button>
              ))}
              {userRating > 0 && <span className="text-xs text-neutral-400 ml-2">已评 {userRating} 星</span>}
              {ratingCount > 0 && <span className="text-xs text-neutral-400 ml-1">(均{avgRating}，{ratingCount}人)</span>}
            </div>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:items-end flex-shrink-0">
            <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${liked ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"}`}><Heart size={18} className={liked ? "fill-current" : ""} /><span className="font-medium">{skill.likes || 0}</span></button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300"><Download size={18} /><span className="font-medium">{skill.installs || 0}</span></div>
            {/* Report button */}
            {user && (
              <button onClick={handleReport} disabled={reporting} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Flag size={14} />举报
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <Link to={`/user/${skill.author}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{skill.author.charAt(0).toUpperCase()}</div>
            <span className="font-medium hover:text-indigo-600 transition-colors">{skill.author}</span>
          </Link>
          {skill.githubRepo && <><div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" /><a href={skill.githubRepo.startsWith('http') ? skill.githubRepo : `https://${skill.githubRepo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-neutral-600 hover:text-indigo-600 dark:text-neutral-400"><Github size={16} />查看 GitHub 仓库</a></>}
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Terminal size={20} className="text-indigo-600" />安装命令</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">{skill.installCommand}</div>
          <button onClick={handleCopy} className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-colors ${copied ? "bg-green-500 text-white hover:bg-green-600" : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"}`}>{copied ? <><Check size={18} />已复制</> : <><Download size={18} />复制命令</>}</button>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Skill 详情 (SKILL.md)</h3>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8"><pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">{skill.content}</pre></div>
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><MessageCircle size={20} className="text-indigo-600" />评论 ({comments.length})</h3>
        {user ? (
          <div className="flex gap-3 mb-8">
            {profile?.avatar_url ? <span className="text-2xl shrink-0">{profile.avatar_url.length < 4 ? profile.avatar_url : <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />}</span> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{profile?.username?.charAt(0) || user.email?.charAt(0) || "?"}</div>}
            <div className="flex-1 space-y-2">
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={2} placeholder="写下你的想法..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none text-sm" />
              <button onClick={handleComment} disabled={submitting || !commentText.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Send size={14} />{submitting ? "发送中..." : "发表评论"}</button>
            </div>
          </div>
        ) : <p className="text-sm text-neutral-500 mb-6">请先登录后再发表评论</p>}
        <div className="space-y-4">
          {comments.length === 0 ? <p className="text-sm text-neutral-400 text-center py-6">暂无评论，来说两句吧</p> : comments.map(c => (
            <div key={c.id} className="flex gap-3">
              {c.avatar_url ? (c.avatar_url.length <= 3 ? <span className="text-xl shrink-0">{c.avatar_url}</span> : <img src={c.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />) : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{c.username?.charAt(0) || "?"}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-semibold">{c.username}</span><span className="text-xs text-neutral-400">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: zhCN })}</span></div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
