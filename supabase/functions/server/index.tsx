import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9a0530b6/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all skills
app.get("/make-server-9a0530b6/skills", async (c) => {
  try {
    const skills = await kv.getByPrefix("skill:");
    return c.json(skills);
  } catch (err: any) {
    console.error("Error fetching skills:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Create a new skill
app.post("/make-server-9a0530b6/skills", async (c) => {
  try {
    const data = await c.req.json();
    const slug = data.slug;
    if (!slug) return c.json({ error: "Slug is required" }, 400);

    const existing = await kv.get(`skill:${slug}`);
    if (existing) {
      return c.json({ error: "Skill with this slug already exists" }, 409);
    }

    const newSkill = {
      ...data,
      status: "pending",
      likes: 0,
      installs: 0,
      createdAt: new Date().toISOString()
    };

    await kv.set(`skill:${slug}`, newSkill);
    return c.json(newSkill, 201);
  } catch (err: any) {
    console.error("Error creating skill:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Get a single skill
app.get("/make-server-9a0530b6/skills/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const skill = await kv.get(`skill:${slug}`);
    if (!skill) return c.json({ error: "Not found" }, 404);
    return c.json(skill);
  } catch (err: any) {
    console.error("Error fetching skill:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Increment likes
app.post("/make-server-9a0530b6/skills/:slug/like", async (c) => {
  try {
    const slug = c.req.param("slug");
    const skill = await kv.get(`skill:${slug}`);
    if (!skill) return c.json({ error: "Not found" }, 404);
    
    skill.likes = (skill.likes || 0) + 1;
    await kv.set(`skill:${slug}`, skill);
    return c.json(skill);
  } catch (err: any) {
    console.error("Error incrementing likes:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Increment installs
app.post("/make-server-9a0530b6/skills/:slug/install", async (c) => {
  try {
    const slug = c.req.param("slug");
    const skill = await kv.get(`skill:${slug}`);
    if (!skill) return c.json({ error: "Not found" }, 404);
    
    skill.installs = (skill.installs || 0) + 1;
    await kv.set(`skill:${slug}`, skill);
    return c.json(skill);
  } catch (err: any) {
    console.error("Error incrementing installs:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Update status (admin only, but no auth requested so we'll just allow it)
app.put("/make-server-9a0530b6/skills/:slug/status", async (c) => {
  try {
    const slug = c.req.param("slug");
    const body = await c.req.json();
    if (!['approved', 'rejected', 'pending'].includes(body.status)) {
       return c.json({ error: "Invalid status" }, 400);
    }
    const skill = await kv.get(`skill:${slug}`);
    if (!skill) return c.json({ error: "Not found" }, 404);
    
    skill.status = body.status;
    await kv.set(`skill:${slug}`, skill);
    return c.json(skill);
  } catch (err: any) {
    console.error("Error updating skill status:", err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);