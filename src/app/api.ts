import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ybbepmotbitjrpsvsics.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYmVwbW90Yml0anJwc3ZzaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTU2MzksImV4cCI6MjA5NjU5MTYzOX0.iuJu5TUHQ3TdQb5hCSqb_Ie3XGOa5f2V_IWRPoTn77g"
);

export interface Skill {
  slug: string;
  name: string;
  category: string;
  author: string;
  description: string;
  content: string;
  installCommand: string;
  githubRepo?: string;
  githubUsername?: string;
  status: "pending" | "approved" | "rejected";
  likes: number;
  installs: number;
  createdAt: string;
}

function map(row: any): Skill {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    author: row.author_name || "",
    description: row.description,
    content: row.full_content || "",
    installCommand: row.install_command || "",
    githubRepo: row.repo_url || undefined,
    githubUsername: row.author_github || undefined,
    status: row.status || "pending",
    likes: row.likes || 0,
    installs: row.downloads || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export const fetchSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase.from("skills").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(map);
};

export const fetchSkill = async (slug: string): Promise<Skill> => {
  const { data, error } = await supabase.from("skills").select("*").eq("slug", slug).single();
  if (error || !data) throw new Error("Skill not found");
  return map(data);
};

export const createSkill = async (d: Partial<Skill>): Promise<Skill> => {
  const { data, error } = await supabase.from("skills").insert({
    slug: d.slug, name: d.name, category: d.category || "其他", author_name: d.author || "",
    description: d.description || "", full_content: d.content || "", install_command: d.installCommand || "",
    repo_url: d.githubRepo || null, author_github: d.githubUsername || null,
    status: "pending", likes: 0, downloads: 0, version: "1.0.0",
  }).select().single();
  if (error) { if (error.code === "23505") throw new Error("Slug already exists"); throw new Error(error.message); }
  return map(data);
};

export const likeSkill = async (slug: string): Promise<Skill> => {
  const { data: cur } = await supabase.from("skills").select("likes").eq("slug", slug).single();
  const { data, error } = await supabase.from("skills").update({ likes: (cur?.likes || 0) + 1 }).eq("slug", slug).select().single();
  if (error) throw new Error(error.message);
  return map(data);
};

export const installSkill = async (slug: string): Promise<Skill> => {
  const { data: cur } = await supabase.from("skills").select("downloads").eq("slug", slug).single();
  const { data, error } = await supabase.from("skills").update({ downloads: (cur?.downloads || 0) + 1 }).eq("slug", slug).select().single();
  if (error) throw new Error(error.message);
  return map(data);
};

export const updateSkillStatus = async (slug: string, status: "approved" | "rejected"): Promise<Skill> => {
  const { data, error } = await supabase.from("skills").update({ status }).eq("slug", slug).select().single();
  if (error) throw new Error(error.message);
  return map(data);
};
