import { useState } from "react";
import { supabase } from "../auth";
import { Mail, Lock, ArrowRight, Loader2, X, UserPlus } from "lucide-react";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("请输入有效的邮箱地址"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    setLoading(true);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (err) { setError(err.message); setLoading(false); return; }
      // If a session was returned, email confirmation is off — logged in
      if (data.session) { onClose(); return; }
      // Otherwise, user needs to confirm email
      if (data.user?.identities?.length === 0) {
        setError("该邮箱已注册，请直接登录"); setMode("login"); setLoading(false);
      } else {
        setError("请检查邮箱确认链接后登录，或联系管理员关闭邮箱验证"); setMode("login"); setLoading(false);
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        if (err.message.includes("Email not confirmed")) setError("邮箱未验证，请检查邮箱中的确认链接");
        else if (err.message.includes("Invalid login")) setError("邮箱或密码错误");
        else setError(err.message);
        setLoading(false);
      } else { onClose(); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{mode === "login" ? "登录" : "注册"}</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {mode === "login" ? "还没有账号？" : "已有账号？"}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-indigo-600 hover:underline font-medium ml-1">
                {mode === "login" ? "去注册" : "去登录"}
              </button>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Mail size={18} className="text-neutral-400 shrink-0" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-transparent outline-none text-sm dark:text-white" autoFocus />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">密码</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Lock size={18} className="text-neutral-400 shrink-0" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="至少6位" className="w-full bg-transparent outline-none text-sm dark:text-white" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"}`}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : mode === "login" ? <><ArrowRight size={18} />登录</> : <><UserPlus size={18} />注册</>}
            {loading && <span>{mode === "signup" ? "注册中..." : "登录中..."}</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
