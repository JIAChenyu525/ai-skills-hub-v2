import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router";
import { Brain, LogIn, Settings, LogOut, Shield, Bell } from "lucide-react";
import { useAuth, supabase } from "../auth";
import { LoginModal } from "./LoginModal";

export default function Layout() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("id", { count: "exact" }).eq("user_id", user.id).eq("read", false)
      .then(({ count }) => { if (count != null) setNotifCount(count); });
  }, [user]);

  const avatarEmoji = profile?.avatar_url || null;
  const displayName = profile?.username || user?.email?.split("@")[0] || "用户";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Brain size={24} /></div>
            <span className="font-bold text-xl hidden sm:inline">校园AI站</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link to="/" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">浏览</Link>
            <Link to="/guide" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">教程</Link>
            <Link to="/submit" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">提交</Link>
            {user ? (
              <div className="relative flex items-center gap-1">
                {/* Notification Bell */}
                <Link to="/profile" className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <Bell size={18} className="text-neutral-500" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{notifCount > 9 ? "9+" : notifCount}</span>
                  )}
                </Link>
                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  {avatarEmoji ? (
                    <span className="text-xl">{avatarEmoji}</span>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{displayName.charAt(0).toUpperCase()}</div>
                  )}
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-20 py-1 animate-slide-up">
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="font-semibold text-sm">{displayName}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <Settings size={16} /> 个人设置
                      </Link>
                      <Link to="/admin" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <Shield size={16} /> 管理后台
                      </Link>
                      <button onClick={() => { setShowMenu(false); signOut(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut size={16} /> 退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
                <LogIn size={16} /> 登录
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
          <p>校园AI站 · 为中国大学生打造的 AI 技能分享平台</p>
          <p className="mt-1">Made with care at 武汉商学院 · <a href="https://github.com/JIAChenyu525/Student-Skills" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">GitHub</a></p>
        </div>
      </footer>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
