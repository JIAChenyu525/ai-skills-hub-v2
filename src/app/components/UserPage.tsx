import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "../auth";
import { ArrowLeft, Heart, Download, Calendar, Package, Star, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface UserSkill {
  slug: string; name: string; description: string; category: string;
  likes: number; downloads: number; created_at: string;
}

export default function UserPage() {
  const { username } = useParams<{ username: string }>();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState({ totalLikes: 0, totalDownloads: 0, joinedAt: "" });

  useEffect(() => {
    if (!username) return;
    supabase.from("skills").select("*").eq("author_name", username).eq("status", "approved").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) { setNotFound(true); setLoading(false); return; }
        setSkills(data);
        setStats({
          totalLikes: data.reduce((s: number, sk: any) => s + (sk.likes || 0), 0),
          totalDownloads: data.reduce((s: number, sk: any) => s + (sk.downloads || 0), 0),
          joinedAt: data[data.length - 1]?.created_at || "",
        });
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center"><div className="w-10 h-10 mx-auto rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>;
  if (notFound) return <div className="container mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold mb-2">用户未找到</h1><p className="text-neutral-500 mb-6">该用户还没有公开的 Skills</p><Link to="/" className="text-indigo-600 hover:underline font-medium"><ArrowLeft size={16} className="inline mr-1" />返回首页</Link></div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-foreground mb-8"><ArrowLeft size={16} />返回</Link>

      {/* Profile header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{username}</h1>
            <p className="text-sm text-neutral-500 mt-1">Skills 创作者</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start text-sm">
              <span className="flex items-center gap-1 text-neutral-500"><Package size={14} />{skills.length} 个技能</span>
              <span className="flex items-center gap-1 text-neutral-500"><ThumbsUp size={14} />{stats.totalLikes} 次获赞</span>
              <span className="flex items-center gap-1 text-neutral-500"><Download size={14} />{stats.totalDownloads} 次安装</span>
              {stats.joinedAt && <span className="flex items-center gap-1 text-neutral-500"><Calendar size={14} />{formatDistanceToNow(new Date(stats.joinedAt), { addSuffix: true, locale: zhCN })}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* User's skills */}
      <h2 className="text-xl font-bold mb-4">发布的技能</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(s => (
          <Link to={`/skill/${s.slug}`} key={s.slug} className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold group-hover:text-indigo-600 transition-colors line-clamp-1">{s.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md shrink-0 ml-2">{s.category}</span>
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{s.description}</p>
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1"><Heart size={12} />{s.likes || 0}</span>
              <span className="flex items-center gap-1"><Download size={12} />{s.downloads || 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
