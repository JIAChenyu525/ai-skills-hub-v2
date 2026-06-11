import { useState, useRef } from "react";
import { useAuth, supabase } from "../auth";
import { Camera, Save, ArrowLeft, Upload, Loader2, Smile } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const EMOJI_AVATARS = ["👤","🦊","🐱","🐶","🐼","🐨","🐸","🦁","🐯","🐰","🦄","🐙","🐳","🦋","🌸","🔥","⭐","🌈","🎮","🚀","💡","🎓","💻","🎨","🎵","📚"];
const STORAGE_URL = "https://ybbepmotbitjrpsvsics.supabase.co/storage/v1/object/public/avatars";

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <h1 className="text-2xl font-bold mb-2">请先登录</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"><ArrowLeft size={18} />返回首页</Link>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("图片不能超过 2MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("请上传图片文件"); return; }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'png';
    const safeName = `${Date.now()}.${ext}`;
    const filePath = `${user.id}/${safeName}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (error) { toast.error("上传失败：" + error.message); setUploading(false); return; }
    setAvatarUrl(`${STORAGE_URL}/${filePath}`);
    setUploading(false);
    toast.success("头像上传成功！点保存生效");
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      username: username || user.email?.split("@")[0] || "用户",
      bio: bio || null,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    toast.success("保存成功！");
  };

  const displayName = username || profile?.username || user.email?.split("@")[0] || "用户";
  const isImageUrl = avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/"));

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-foreground mb-8"><ArrowLeft size={16} />返回</Link>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-3">
            {isImageUrl ? (
              <img src={avatarUrl} alt="头像" className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700" />
            ) : avatarUrl ? (
              <div className="w-24 h-24 rounded-full text-5xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 select-none">{avatarUrl}</div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">{displayName.charAt(0).toUpperCase()}</div>
            )}
            <div className="absolute -bottom-1 -right-1 flex gap-0.5">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow" title="上传图片">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              </button>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow" title="选择Emoji">
                <Smile size={14} />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>

          {uploading && <p className="text-xs text-indigo-600 mb-1">上传中...</p>}
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-sm text-neutral-500">{user.email}</p>

          {showEmojiPicker && (
            <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-xs">
              <p className="text-xs text-neutral-500 mb-2">选择 Emoji 头像</p>
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJI_AVATARS.map(emoji => (
                  <button key={emoji} onClick={() => { setAvatarUrl(emoji); setShowEmojiPicker(false); }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${avatarUrl === emoji ? "bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500" : ""}`}>
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2">点上传按钮 ↑ 可以上传自己的图片</p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold">用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="你的名字/昵称" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">个人简介</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="介绍一下你自己..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">邮箱</label>
            <input type="email" value={user.email || ""} disabled
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 cursor-not-allowed" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
            <Save size={18} />{saving ? "保存中..." : "保存"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={() => { signOut(); window.location.hash = "#/"; }}
            className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors">
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
