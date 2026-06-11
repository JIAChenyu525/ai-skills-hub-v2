import { Terminal, Download, BookOpen, Zap, Cpu, ArrowRight, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000); }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors ${c ? "bg-green-100 text-green-700" : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}>
      {c ? <><Check size={12} />已复制</> : <><Copy size={12} />复制</>}
    </button>
  );
}

export default function Guide() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
          <BookOpen size={16} /> 新手教程
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Claude Code 完全上手指南</h1>
        <p className="text-neutral-500 text-lg">从安装到精通，一步步教你用 AI 写代码</p>
      </div>

      {/* 目录 */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-3">📑 目录</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <button onClick={() => scrollTo("install")} className="text-indigo-600 hover:underline text-left">1. 安装 Claude Code</button>
          <button onClick={() => scrollTo("first-use")} className="text-indigo-600 hover:underline text-left">2. 第一次使用</button>
          <button onClick={() => scrollTo("commands")} className="text-indigo-600 hover:underline text-left">3. 常用指令</button>
          <button onClick={() => scrollTo("skills")} className="text-indigo-600 hover:underline text-left">4. 安装和使用 Skills</button>
          <button onClick={() => scrollTo("tools")} className="text-indigo-600 hover:underline text-left">5. 在 Trae / Cursor 中使用 Skills</button>
          <button onClick={() => scrollTo("cc-switch")} className="text-indigo-600 hover:underline text-left">6. 切换 AI 模型 (cc switch)</button>
          <button onClick={() => scrollTo("tips")} className="text-indigo-600 hover:underline text-left">7. 进阶技巧</button>
        </div>
      </div>

      {/* 1. 安装 */}
      <Section id="install" icon={<Download size={24} />} title="1. 安装 Claude Code" color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <Step num="1.1" title="安装 Node.js（必须）">
          <p>Claude Code 需要 Node.js 环境。打开 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">nodejs.org</a>，下载 LTS 版本（推荐 18.x 或 20.x），一路下一步安装即可。</p>
          <p className="text-sm text-neutral-500 mt-1">安装完成后，打开终端（Windows 按 Win+R 输入 cmd），验证安装：</p>
          <CodeBlock text="node --version" />
        </Step>

        <Step num="1.2" title="安装 Claude Code（全局）">
          <p>在终端中运行以下命令，全局安装 Claude Code：</p>
          <CodeBlock text="npm install -g @anthropic-ai/claude-code" />
          <p className="text-sm text-neutral-500 mt-1">macOS / Linux 用户可能需要加 <code>sudo</code></p>
        </Step>

        <Step num="1.3" title="验证安装">
          <p>安装完成后，在终端输入：</p>
          <CodeBlock text="claude" />
          <p>首次运行会要求你登录 Anthropic 账号，按提示完成即可。如果没有账号，先去 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">console.anthropic.com</a> 注册并获取 API Key。</p>
        </Step>

        <Step num="1.4" title="Windows 用户特别说明">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>确保安装了 <b>Windows Terminal</b>（Microsoft Store 可下载）</li>
            <li>如果遇到权限问题，用管理员身份运行终端</li>
            <li>Node.js 安装时勾选 "Add to PATH"</li>
            <li>如果 <code>claude</code> 命令无法识别，重启终端再试</li>
          </ul>
        </Step>
      </Section>

      {/* 2. 第一次使用 */}
      <Section id="first-use" icon={<Terminal size={24} />} title="2. 第一次使用 Claude Code" color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        <Step num="2.1" title="进入项目目录">
          <p>打开终端，进入你的项目文件夹：</p>
          <CodeBlock text={`cd 你的项目路径\n# 例如：\ncd D:\\my-project`} />
        </Step>
        <Step num="2.2" title="启动 Claude Code">
          <p>在项目目录下直接运行：</p>
          <CodeBlock text="claude" />
          <p>Claude Code 会自动读取你项目中的代码，然后你就可以用自然语言和它对话了。例如：</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>"帮我看看这个项目做了什么"</li>
            <li>"给这个函数写单元测试"</li>
            <li>"优化这段代码的性能"</li>
            <li>"解释这个文件的作用"</li>
          </ul>
        </Step>
        <Step num="2.3" title="初始化项目配置">
          <p>在项目根目录创建一个 <code>.claude</code> 文件夹，里面可以放：</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><code>CLAUDE.md</code> — 项目说明，Claude 每次启动会读取</li>
            <li><code>skills/</code> — 存放 SKILL.md 技能文件</li>
          </ul>
        </Step>
      </Section>

      {/* 3. 常用指令 */}
      <Section id="commands" icon={<Zap size={24} />} title="3. Claude Code 常用指令" color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-2 px-3 font-semibold">指令</th>
                <th className="text-left py-2 px-3 font-semibold">作用</th>
                <th className="text-left py-2 px-3 font-semibold">示例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {[
                ["/help", "查看帮助和所有指令", "/help"],
                ["/clear", "清空当前对话", "/clear"],
                ["/compact", "压缩上下文（节省Token）", "/compact"],
                ["/config", "打开配置面板", "/config"],
                ["/theme", "切换主题（暗色/亮色）", "/theme dark"],
                ["/init", "为当前项目生成 CLAUDE.md", "/init"],
                ["/doctor", "诊断环境问题", "/doctor"],
                ["pr-comment", "查看PR并写评论", "claude pr-comment 42"],
                ["/status", "查看当前session状态", "/status"],
                ["claude --resume", "恢复上次对话", "claude --resume"],
                ["claude -p \"prompt\"", "单次提问模式", "claude -p \"解释这个函数\""],
                ["claude --dangerously-skip-permissions", "跳过所有权限确认", "claude --dangerously-skip-permissions"],
                ["Ctrl+C", "中断当前操作", "—"],
                ["Ctrl+L", "清屏", "—"],
                ["Esc", "返回上级菜单", "—"],
              ].map(([cmd, desc, example]) => (
                <tr key={cmd} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-2 px-3"><code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono">{cmd}</code></td>
                  <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">{desc}</td>
                  <td className="py-2 px-3 text-neutral-500 text-xs font-mono">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 4. Skills */}
      <Section id="skills" icon={<BookOpen size={24} />} title="4. 安装和使用 Skills" color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
        <Step num="4.1" title="什么是 Skills？">
          <p>Skills 是 Claude Code 的插件系统。每个 Skill 是一个 SKILL.md 文件，里面包含特定领域的知识和工作流程。安装后 Claude 就能在这些领域表现得更专业。</p>
        </Step>
        <Step num="4.2" title="从 校园AI站 安装（推荐）">
          <p>在本站找到你需要的 Skill，点开详情页，复制安装命令到终端运行即可。例如：</p>
          <CodeBlock text="git clone https://github.com/user/skill-repo.git\ncp -r skill-repo/skill-folder ~/.claude/skills/" />
        </Step>
        <Step num="4.3" title="Windows 用户安装路径">
          <CodeBlock text={String.raw`git clone https://github.com/user/skill-repo.git
xcopy /E /I skill-repo\skill-folder %USERPROFILE%\.claude\skills\skill-name`} />
        </Step>
        <Step num="4.4" title="验证 Skill 是否安装成功">
          <p>在 Claude Code 对话中提及 Skill 的关键词，Claude 会自动识别并加载。或者输入 <code>/status</code> 查看已加载的 Skills。</p>
        </Step>
        <Step num="4.5" title="自己创建 Skill">
          <p>把你常用的提示词和工作流程做成 Skill，分享给朋友或在 校园AI站 上提交。格式参考：</p>
          <CodeBlock text={`---
name: my-skill
description: 用中文描述什么时候触发
version: "1.0.0"
---

# Skill 标题
## 工作流程
### Step 1: 步骤名
...`} />
        </Step>
      </Section>

      {/* 5. 多工具 */}
      <Section id="tools" icon={<Zap size={24} />} title="5. 在 Trae / Cursor / Codex 中使用 Skills" color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
        <Step num="5.01" title="SKILL.md 是通用标准">
          <p>校园AI站 上的所有 Skill 都是标准的 <code>SKILL.md</code> 格式，不局限于 Claude Code。以下工具都支持：</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
            {["Claude Code","Trae (字节跳动)","Cursor","Codex (OpenAI)","Windsurf","GitHub Copilot","Gemini CLI","Kiro","OpenHands","Antigravity"].map(t => (
              <span key={t} className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center font-medium text-xs">{t}</span>
            ))}
          </div>
        </Step>

        <Step num="5.1" title="Trae（字节跳动）— 国内首选">
          <p><a href="https://www.trae.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Trae</a> 是字节跳动推出的 AI IDE，国内访问快，中文支持好，完全免费。</p>
          <p className="text-sm font-semibold mt-3">安装 Skills 的路径：</p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-sm">
            <p className="font-semibold mb-2">🇨🇳 Trae Skills 目录</p>
            <p><b>Windows：</b></p>
            <CodeBlock text="%USERPROFILE%\.trae\skills\" />
            <p className="mt-2"><b>macOS / Linux：</b></p>
            <CodeBlock text="~/.trae/skills/" />
            <p className="mt-3 text-xs text-neutral-500">把下载的 Skill 文件夹复制到这个目录，重启 Trae 即可生效。Trae 会自动读取 SKILL.md 并在对话中触发。</p>
          </div>
        </Step>

        <Step num="5.2" title="Cursor">
          <p><a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Cursor</a> 是目前最流行的 AI 编辑器之一，内置支持 SKILL.md。</p>
          <CodeBlock text={`# macOS / Linux\n~/.cursor/skills/\n\n# Windows\n%USERPROFILE%\\.cursor\\skills\\`} />
        </Step>

        <Step num="5.3" title="Codex (OpenAI)">
          <p><a href="https://github.com/openai/codex" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codex</a> 是 OpenAI 的 AI 编程终端，支持 Claude Code 兼容的 SKILL.md 格式。</p>
          <CodeBlock text={`# 全局安装目录（所有项目可用）\n~/.codex/skills/\n\n# 项目级（仅当前项目）\n.codex/skills/`} />
        </Step>

        <Step num="5.4" title="Windsurf / Gemini CLI / 其它工具">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="text-left py-2 px-3 font-semibold">工具</th><th className="text-left py-2 px-3 font-semibold">Skills 目录</th><th className="text-left py-2 px-3 font-semibold">说明</th></tr></thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <tr><td className="py-2 px-3 font-medium">Windsurf</td><td className="py-2 px-3"><code>~/.windsurf/skills/</code></td><td className="py-2 px-3 text-neutral-500">Codeium 出品，免费方案</td></tr>
                <tr><td className="py-2 px-3 font-medium">Gemini CLI</td><td className="py-2 px-3"><code>~/.gemini/skills/</code></td><td className="py-2 px-3 text-neutral-500">Google 出品，免费额度大</td></tr>
                <tr><td className="py-2 px-3 font-medium">GitHub Copilot</td><td className="py-2 px-3"><code>.github/copilot/skills/</code></td><td className="py-2 px-3 text-neutral-500">VS Code 插件，学生免费</td></tr>
                <tr><td className="py-2 px-3 font-medium">Kiro</td><td className="py-2 px-3"><code>~/.kiro/skills/</code></td><td className="py-2 px-3 text-neutral-500">亚马逊出品</td></tr>
                <tr><td className="py-2 px-3 font-medium">OpenHands</td><td className="py-2 px-3"><code>~/.openhands/skills/</code></td><td className="py-2 px-3 text-neutral-500">开源 AI 编程助手</td></tr>
              </tbody>
            </table>
          </div>
        </Step>
      </Section>

      {/* 6. cc switch — was section 5 */}
      <Section id="cc-switch" icon={<Cpu size={24} />} title="6. 切换 AI 模型 (cc switch 及其它方式)" color="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
        <Step num="5.1" title="什么是 cc switch？">
          <p>Claude Code 默认使用 Anthropic 的 Claude 模型。但通过第三方工具 <b>cc switch</b> 或修改配置，可以接入其他大语言模型（GPT-4、Gemini、DeepSeek、本地模型等）。这对于想省钱或体验不同模型的用户很有用。</p>
        </Step>

        <Step num="5.2" title="方法一：使用 OpenClaw 接入多模型">
          <p><a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenClaw</a> 是社区开发的 Claude Code 兼容层，支持接入几十种模型。</p>
          <CodeBlock text={`# 安装 OpenClaw
npm install -g openclaw

# 配置模型（以 DeepSeek 为例）
openclaw config set model deepseek-chat
openclaw config set api_key sk-your-deepseek-key

# 启动
openclaw`} />
        </Step>

        <Step num="5.3" title="方法二：通过 OpenRouter 接入">
          <p><a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenRouter</a> 是一个模型聚合平台，一个 API Key 就能用 200+ 种模型。</p>
          <CodeBlock text={`# Claude Code 配置使用 OpenRouter
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
export ANTHROPIC_API_KEY="sk-or-v1-your-openrouter-key"

# 然后在 Claude Code 中使用不同的模型名称
# 例如 "anthropic/claude-sonnet-4" 或 "google/gemini-pro"`} />
        </Step>

        <Step num="5.4" title="方法三：利用 Anthropic 官方切换">
          <p>Claude Code 在对话中可以直接用 <code>/config</code> 打开配置面板，切换 Anthropic 自家支持的模型：</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><b>claude-sonnet-4-6</b> — 速度快，适合日常编码</li>
            <li><b>claude-opus-4-8</b> — 推理最强，适合复杂问题</li>
            <li><b>claude-haiku-4-5</b> — 最便宜最快，适合简单任务</li>
            <li><b>claude-fable-5</b> — 多模态，适合图文任务</li>
          </ul>
        </Step>

        <Step num="5.5" title="国内可用模型推荐">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-sm">
            <p className="font-semibold mb-2">🇨🇳 国内网络友好选项：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>DeepSeek</b> — 通过 OpenClaw 接入，国内访问快，中文能力强，便宜</li>
              <li><b>通义千问 (Qwen)</b> — 阿里云提供，通过 OpenRouter 接入</li>
              <li><b>Moonshot (Kimi)</b> — 月之暗面，通过第三方 API 兼容层接入</li>
              <li><b>智谱 GLM</b> — 清华系，有 OpenAI 兼容接口</li>
              <li><b>本地模型</b> — 用 Ollama + OpenClaw，完全离线运行</li>
            </ul>
          </div>
        </Step>
      </Section>

      {/* 7. 进阶技巧 — was section 6 */}
      <Section id="tips" icon={<Zap size={24} />} title="7. 进阶技巧" color="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
        <Step num="7.1" title="用 CLAUDE.md / AGENTS.md 让 AI 更懂你">
          <p>在项目根目录创建 <code>CLAUDE.md</code>，Claude 每次启动都会读取。可以写：</p>
          <CodeBlock text={`# 项目说明
技术栈：React + TypeScript + Tailwind
代码风格：使用函数组件 + Hooks，不用 Class
命名规范：组件用 PascalCase，工具函数用 camelCase
测试框架：Vitest + React Testing Library`} />
        </Step>
        <Step num="7.2" title="Hooks 自动化">
          <p>在 <code>.claude/settings.json</code> 中配置 Hooks，可以在特定时机自动执行操作（如提交前自动格式化）。</p>
        </Step>
        <Step num="7.3" title="权限管理">
          <p>在 <code>.claude/settings.json</code> 中可以预授权某些操作，减少弹窗打断：</p>
          <CodeBlock text={`{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(git diff *)",
      "Bash(git status)"
    ]
  }
}`} />
        </Step>
        <Step num="7.4" title="使用 /loop 循环执行">
          <p>让 Claude Code 定时执行任务：</p>
          <CodeBlock text={"/loop 5m \"检查最新的 git commit 并运行测试\""} />
        </Step>
        <Step num="7.5" title="批量处理文件">
          <p>用 Claude Code 一次处理多个文件：</p>
          <CodeBlock text={"claude -p \"把 src/components/ 下所有组件都加上 TypeScript 类型导出\""} />
        </Step>
      </Section>

      <div className="text-center py-10">
        <p className="text-neutral-500 mb-4">学完了？去发现一些好用的 Skills 吧</p>
        <a href="#/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          浏览 Skills <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}

/* Sub-components */
function Section({ id, icon, title, color, children }: { id: string; icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
        {children}
      </div>
    </section>
  );
}

function Step({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{num}. {title}</h3>
      <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">{children}</div>
    </div>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <div className="relative bg-neutral-900 dark:bg-black text-green-400 rounded-lg p-3 font-mono text-xs overflow-x-auto group">
      <pre className="whitespace-pre-wrap">{text}</pre>
      <button onClick={async () => { await navigator.clipboard.writeText(text); }}
        className="absolute top-2 right-2 p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        title="复制">
        <Copy size={14} />
      </button>
    </div>
  );
}
