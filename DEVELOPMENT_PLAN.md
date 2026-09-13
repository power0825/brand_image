# Development Plan — Brand Visual Workflow Demo

> 依据 `agents.md`（Brand Visual Workflow Demo）编制。已确认技术决策：
> LLM **OpenAI 兼容可配置** ｜ Step2/3 出图 **真实文生图 API** ｜ 栈 **React + Vite 纯前端** ｜ UI **全英文**
>
> 目标上线模型：
> - **文生本** `qwen3.7-flash` → 阿里云 MaaS `{aliyunHost}/compatible-mode/v1`（OpenAI 兼容，已实测 ✓）
> - **生图** `doubao-seedream-4-5-251128` → 火山方舟 Ark `https://ark.cn-beijing.volces.com/api/v3`（OpenAI 兼容 images，**已实测 ✓ 2026-09-05**）
> - aliyunHost：`ws-45mqrzn3org3r0jc.ap-southeast-1.maas.aliyuncs.com`

---

## 0. 目标

做一个**课堂演示**用的品牌视觉工作流：从一段 Brand Core 出发，经 4 步引导，产出一套可用的品牌视觉体系 + 可导出的 Brand Visual Rules。

演示要传达一句话：

> AI 不只是生成几张品牌图片，而是把 **Brand Core** 转化成一套**统一的品牌视觉体系**。

---

## 1. 需求分析

### 1.1 核心体验（来自 agents.md）

4 步向导（wizard），每步公共行为：

0. 读上一步输出
1. 生成下一个交付物
2. 清晰展示结果
3. 允许小幅修正（Revise）
4. 批准后存档（Approve）
5. 进入下一步

```text
Brand Core → 01 Visual Brief → 02 3 Visual Directions(用户选1) → 03 Logo + Visual DNA → 04 Brand Visual Rules
```

课堂关键时刻是 **Step 2**：让听众（观众）投票选择视觉方向，体现：

```text
AI = Explore   |  Human = Decide
AI = Execute   |  Human = Approve
```

### 1.2 明确的非目标（不做，避免过度设计）

- ❌ 不做多 Agent / 编排框架 / 队列 / 矢量数据库 / 长记忆 / 权限系统
- ❌ 不做品牌商标查重
- ❌ 不做复杂版本管理 / 协作
- ❌ Step2 三个方向互相独立，不做"组合历史"
- ❌ 首版不接 PDF 与资产打包（HTML / Markdown 先够）
- ❌ Logo 不追求专业矢量文件，首版为 AI 概念图

### 1.3 已确认的技术决策

| 项 | 决策 | 说明 |
|---|---|---|
| LLM | OpenAI 兼容端点 | 默认 `{host}/compatible-mode/v1` + `qwen3.7-flash`（阿里云 MaaS）；baseURL/model 仍可改，DeepSeek/Kimi 等通吃 |
| 出图 | 真实文生图（火山方舟 Ark · OpenAI 兼容 images） | 默认 `https://ark.cn-beijing.volces.com/api/v3` + `doubao-seedream-4-5-251128`；与 LLM 分属两家供应商，key 分开 |
| 栈 | React + Vite 纯前端 SPA | 无后端，localStorage 持久化，浏览器直连 AI |
| 语言 | 界面全英文 | 品牌术语与文档一致（"Visual Brief / Visual DNA" 等） |
| 状态 | 单个 project 对象 + localStorage | 可选 JSON 导入导出 |
| 构建输出 | HTML / Markdown（JSON 可选） | |

---

## 2. 架构设计

### 2.1 系统架构

```text
┌─────────────────────────── Browser (React + Vite SPA) ───────────────────────────┐
│                                                                                   │
│  Stepper (01→04)  ◄── currentStep 门控：前一步批准才可进入下一步                     │
│        │                                                                          │
│  /steps   Step1..Step4  ◄── 读取 store，产出交付物，写回 store                        │
│        │                                                                          │
│  /store  projectStore (Zustand + persist → localStorage)                          │
│        │                                                                          │
│  /services                                                                        │
│    llm.js   ── POST {base}/chat/completions  （4 个 prompt 函数，JSON 结果容错解析）  │
│    image.js ── POST {base}/images/generations （url / b64 两种返回，失败降级占位）     │
│        │                                                                          │
│  ApiConfigModal：两组连接（LLM=阿里兼容 / Image=Ark），各自 base/model/key   │
│        │                                                                          │
│  /export  exportHTML.js + exportMarkdown.js  ◄── 由 project 全量渲染                 │
└───────────────────────────────────────────────────────────────────────────────────┘
         │                                                        ▲
         │  Vite dev（本地演示）                                    │ 课堂投影机
         ▼                                                        │
   Provider A（文字·阿里云）  Provider B（生图·火山方舟）             │
   /chat/completions      /images/generations                     │
   ── Vite dev proxy（同源 /v1、/ark → 两家 host + 注入各自 key）──┘
```

### 2.2 数据模型（单 project 对象）

```js
{
  id: 'uuid', name: 'Haven Demo',
  createdAt: 'ISO', updatedAt: 'ISO',

  // AI 配置（内置默认值，见 §2.5）
  apiConfig: {
    llmApiKey:   '',                                  // 阿里云 MaaS 密钥
    openAiBase:  'https://…/compatible-mode/v1',      // 文生本（OpenAI 兼容）
    textModel:   'qwen3.7-flash',
    imageApiKey: '',                                  // 火山方舟 Ark 密钥
    arkBase:     'https://ark.cn-beijing.volces.com/api/v3',   // 生图（OpenAI 兼容 images）
    imageModel:  'doubao-seedream-4-5-251128',
    imageMode:   'openai'                            // 'openai'（Ark）| 'placeholder'
  },

  brandCore: {
    brandName, purpose, promise, targetAudience,
    positioning, personality, keyDifferentiation,
    usageContext, tagline            // 字段可缺省
  },

  visualBrief: null,                  // §4.1 schema，批准后非空
  visualDirections: [],               // 3 个方向（含 heroImage）
  selectedDirection: null,            // 用户选中的一个

  logoOptions: [],                    // 3 个 logo 概念（含 image）
  selectedLogo: null,
  visualDNA: null,                    // 8 维, §4.3

  visualRules: null                   // 10 节 + Prompt Recipe + Instruction Block
}
```

- `approvedStep`：`{1..4}` 门控，记录每步是否批准。
- 持久化：`localStorage['brand-visual:project']`，任意变更去抖写回；顶部提供 **Export JSON / Import JSON**（成本低，方便课堂可复现）。

### 2.3 目录结构（遵循 agents.md §10，稍作落地）

```text
/
  index.html · vite.config.js · package.json
  README.md                    课堂演示说明 + 配置指引
  /src
    main.jsx
    /app
      App.jsx                  Stepper + 屏幕切换 + 门控
      stepperConfig.js         4 步定义（id/label/title）
    /components
      Stepper.jsx
      ResultCard.jsx          通用"读上一步→生成→展示→修正→批准"卡片（兼做 EditableCard）
      DirectionCard.jsx       Step2 三列对比卡
      LogoCard.jsx            Step3 Logo 概念卡
      ApiConfigModal.jsx      配置面板（LLM / Image 两组）
    /steps
      Step1VisualBrief.jsx
      Step2VisualDirections.jsx
      Step3BrandIdentity.jsx
      Step4VisualRules.jsx
    /prompts
      visualBrief.js          generateVisualBrief()
      visualDirections.js     generateVisualDirections()
      brandIdentity.js        generateBrandIdentity()
      visualRules.js          generateVisualRules()
      imagePrompts.js         buildDirectionImagePrompt() / buildLogoImagePrompt()
    /services
      llm.js                  callChat() + parseJson() + 4 个组合函数
      image.js                callImage() + url/b64 处理 + 占位降级
      sampleData.js           课堂示例品牌 "Haven"（一键填充） + 可选 mock 输出
    /store
      projectStore.js         Zustand + persist 中间件
    /export
      exportHTML.js · exportMarkdown.js
    /styles                   一份简单全局 CSS（演示不必上 UI 框架）
```

> 决策：**不上 UI 框架 / CSS-in-JS**，手写一份干净的全局样式（深色演示背景 + 卡片布局），保持依赖极少、课堂演示稳定。

### 2.4 状态机与门控

```text
each step: { generate → pending } → { result } → { revise(editable) | approve }
approvedStep: 1 → 2 → 3 → 4    每一步批准后 unlock 下一步
支持"返回上一步查看/重生成"，但只允许线性推进，不做历史版本。
```

界面布局（全英文）：

```text
[01 Visual Brief] [02 Visual Directions] [03 Logo + Visual DNA] [04 Visual Rules]   ← stepper 置顶

Left:  输入/说明          Center/Right:  AI 结果 → Approve / Revise / Continue
```

### 2.5 AI 调用层设计

**默认部署配置（本项目）= 阿里云 MaaS（文生本）+ 火山方舟 Ark（生图），两把 key**

```js
apiConfig = {
  llmApiKey:   '<DASHSCOPE_API_KEY>',                               // 阿里云 MaaS
  openAiBase:  'https://ws-45mqrzn3org3r0jc.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
  textModel:   'qwen3.7-flash',
  imageApiKey: '<ARK_IMAGE_API_KEY>',                               // 火山方舟 Ark
  arkBase:     'https://ark.cn-beijing.volces.com/api/v3',
  imageModel:  'doubao-seedream-4-5-251128',
  imageMode:   'openai'                // 'openai'（Ark images 协议）| 'placeholder'
}
```

以上作为**应用内置默认值**（config 面板仍可改，方便换部署/换模型）。

**传输模式（CORS 已实测：阿里云部署不支持浏览器跨域，§8 R1）**

- **Mode A「本地代理 · 推荐默认」**：浏览器只请求同源路径；`vite.config.js` 在 Node 侧用 `loadEnv` 读两把 key（`DASHSCOPE_API_KEY` / `ARK_IMAGE_API_KEY`，**均无 `VITE_` 前缀，不会打进前端 bundle**），转发时注入：
  - `/v1/*` → `openAiBase`（注入阿里云 key）
  - `/ark/*` → `arkBase`（注入 Ark key）
  → **key 全程不进入浏览器 / 页面 JS**。课堂本机 `npm run dev` 即用。
- **Mode B「浏览器直连」**：仅当某 provider 明确允许 CORS 时启用；key 由用户在配置面板填入并存 localStorage（进浏览器、不进 bundle）。`callChat/callImage` 的 baseURL 换成外网 host 即可，适配器已预留。

**LLM（`services/llm.js`）— OpenAI 兼容**

```js
callChat({ baseUrl = openAiBase, model = textModel, apiKey, system, user, json = true })
  → POST `${baseUrl}/chat/completions`
  → 用 response_format:{type:'json_object'}（Qwen 系支持；若部署端限制则去掉并靠 parseJson 兜底）
  → ⚠️ qwen3.7-flash 实测为 **reasoning 模型**（返回带 reasoning_content）：max_tokens 需给足（≥2048），读取 message.content
  → parseJson() 容错：JSON.parse → 抽 ```json 块 → 失败抛错提示重试
```

**Image（`services/image.js`）— 走火山方舟 Ark（OpenAI 兼容 images 协议）**

```js
callImage({ base = arkBase, model = imageModel, apiKey = imageApiKey, prompt,
            size = '1920x1920', n = 1 })
  → POST `${base}/images/generations`  { model, prompt, n, size, response_format:'url' }
  → ⚠️ size 像素必须 ≥ 3,686,400（最小正方形 1920x1920），低于则 Ark 直接 400
  → 返回 data[].url（TOS 签名 URL，**24h 过期**，仅在演示会话期有效）
  → 失败/超时（~60s）→ 渲染占位图 + 重试（imageMode 临时切到 'placeholder' 兜底）
```

> ✅ **已实测通过（2026-09-05）**：`doubao-seedream-4-5-251128` 直连 Ark `/images/generations` 返回 `HTTP 200` + `data[].url`。两大约束：① **像素下限 3,686,400**（`1920x1920` 为最小可行尺寸）；② URL 为 **TOS 签名临时地址，24h 过期**。

**Config 面板**：两组连接（**LLM** = 阿里云 MaaS 兼容 / **Image** = 火山方舟 Ark），各自 Base URL / Model（内置默认值）；Mode A 下 key 只在 `.env.local`，面板仅显示状态；Mode B 直连时面板可填 key；"Test Connection"做最小请求验证（LLM 发 1 次 chat，图片发 1 次任务）。

> 安全提示：纯前端直连意味着 key 在本机浏览器可见。仅限**本地课堂演示**；若日后公网部署，需加后端代理（§8 风险 R1）。

---

## 3. Prompt 设计

> 原则：内容评审走"结构化输出，取 JSON"；图片 prompt 由"已批准的方向/Logo 规格 + 品牌约束"拼装，保证**风格一致**（呼应 agents.md §6 课堂要点：一致性来自规则，不是让每张图长一样）。
> 运行模型固定：文生本 `qwen3.7-flash`（阿里云 MaaS / OpenAI 兼容）/ 生图 `doubao-seedream-4-5-251128`（火山方舟 Ark / OpenAI 兼容 images），配置见 §2.5。

### 3.1 `generateVisualBrief()`（Step 1）

- 输入：brandCore（JSON）
- 输出 schema：

```json
{
  "brandEssence": "", "desiredPerception": "",
  "visualPersonality": "", "visualKeywords": ["","",""],
  "emotionalKeywords": ["","",""], "usageScenarios": ["",""],
  "differentiationCues": [""], "avoidList": [""]
}
```

### 3.2 `generateVisualDirections()`（Step 2）

- 输入：brandCore + visualBrief
- 输出：3 个**明显不同**的方向（不是同一风格的三个变体），每个：

```json
{ "name":"", "coreIdea":"", "mood":"", "color":"(含建议 hex 组)", "typography":"",
  "composition":"", "lighting":"", "photographyIllustration":"", "material":"",
  "graphicStyle":"", "avoid":"" }
```

- 出图：每个方向用 `buildDirectionImagePrompt(direction, brandCore)` 生成 1 张 hero 图。拼装要素：主题场景 + composition + lighting + color(hex) + material + mood + style 词 + 品牌约束（不使用具体 logo/文字水印）。

### 3.3 `generateBrandIdentity()`（Step 3）

- 输入：brandCore + visualBrief + selectedDirection
- 一份调用产出两件事，一次返回：

```json
{
  "logoConcepts": [
    { "conceptName":"", "explanation":"", "whyFits":"", "_visualSpec":"(给图片的描述)" }
  ],
  "visualDNA": { "color":{}, "typography":{}, "composition":{}, "lighting":{},
                 "photography":{}, "people":{}, "material":{}, "graphicLanguage":{} }
}
```

- 每个维度结构 `{ principle, do:[], dont:[] }`（agents.md §6 示例格式）。
- 出图：3 个 logo 概念各调 `buildLogoImagePrompt(concept, direction)` 生成方形 logo 概念图（干净背景、不含多余文字，仅品牌标记示意）。

### 3.4 `generateVisualRules()`（Step 4）

- 输入：全部已批准结果（brandCore + brief + direction + logo + DNA）
- 输出 schema（10 节 §7 of agents.md）：

```json
{
  "sections": {
    "summary": {}, "logo": {}, "color": {}, "typography": {}, "composition": {},
    "photographyLighting": {}, "peopleMaterial": {}, "graphicLanguage": {},
    "doDont": { "do":[], "dont":[] }
  },
  "promptRecipe": { "subject":"","scenario":"","environment":"","composition":"",
    "lighting":"","color":"","material":"","cameraRendering":"","mood":"",
    "brandConstraints":"","negativeRules":"" },
  "instructionBlock": "When creating content for this brand, always follow these visual rules: ..."
}
```

**亮点**：`promptRecipe` 生成后回填给 `imagePrompts.js`，让本品牌后续出图（课堂演示中重生成/微调）能复用一张"总配方"，强化一致性叙事。

---

## 4. UI / UX 要点（全英文）

- Stepper 置顶：`01 Visual Brief · 02 Visual Directions · 03 Logo + Visual DNA · 04 Visual Rules`，已完成打勾，可由用户返回查看。
- Step 1：左表单（Brand Core 字段，可留空）＋ "Load sample brand (Haven)" 一键填充 → Center editable Visual Brief 卡片 → Approve。
- Step 2：三列 `DirectionCard`（hero 图 + 关键规格），底部 Actions：
  - **Approve this**（选择该方向）／ Regenerate this / Modify（小改动后重出图，一次一个方向，不做版本管理）。
- Step 3：顶部 3 个 Logo 卡（选定）＋ 下方 8 维 Visual DNA（每维 Principle + DO/DON'T），一次批准。
- Step 4：可读的 10 节 Guide + Prompt Recipe + Instruction Block；右侧 **Export HTML / Export Markdown**。
- 全局：生成中骨架屏/加载态、失败提示 + Retry、配置未填时引导打开配置面板。
- 顶部全局控件：⚙ Config ｜ ⬇ Export JSON ｜ ⬆ Import ｜ 🧹 New Project。

---

## 5. 分阶段开发计划

> 估算基于单人执行；每阶段含任务清单 + 验收标准（Vérif：能独立演示通过）。

### M1 — 脚手架与骨架（约 0.5–1 天）

任务：
- [ ] `npm create vite@latest`（react）＋ 精简到 §2.3 目录结构
- [ ] 全局样式基准（深色演示风、卡片、spinner、error banner）
- [ ] `projectStore`（Zustand + persist），含空 project 初始化
- [ ] `Stepper` 组件 + 4 步门控（approvedStep）＋ 屏幕切换
- [ ] `vite.config.js`：dev proxy `/v1 → openAiBase`（注入 `DASHSCOPE_API_KEY`）、`/ark → arkBase`（注入 `ARK_IMAGE_API_KEY`）；Node 侧 `loadEnv` 读取两把 key（均非 VITE_，Mode A）
- [ ] `ApiConfigModal`（LLM=阿里 / Image=Ark 两组，Mode A 状态提示 + Mode B 直连字段 + Test Connection）＋ 配置持久化
- [ ] `sampleData.js`：Haven 示例品牌（含 §5.4 方向示例的同款风格）

**验收**：冷启动 → 新建项目 → 配置面板可填可存 → 4 步 Stepper 能点亮/前进 → 界面全英文、顶部控件齐全。

### M2 — Step 1 Visual Brief（约 0.5–1 天）

任务：
- [ ] `services/llm.js`：`callChat`（OpenAI 兼容）+ `parseJson` 容错
- [ ] `prompts/visualBrief.js`（schema 见 §3.1）
- [ ] `step1` 表单 + 一键填充示例 + 生成 → 可编辑 ResultCard → Approve
- [ ] 加载态 / 失败重试 / 未填 key 引导

**验收**：填入 brandCore（或示例）→ 一键生成 → 得到可编辑的 8 项 Visual Brief → Approve 后可进入 Step 2。非法 JSON 返回时可重试而非崩溃。

### M3 — Step 2 视觉方向 + 出图（约 1 天）

任务：
- [ ] `prompts/visualDirections.js`（3 方向 schema）
- [ ] `services/image.js`：`callImage` — OpenAI 兼容（Ark `images/generations`），默认 `size='1920x1920'`（像素下限 3,686,400）、`response_format:'url'`、60s 超时、占位降级；签名 URL 24h 过期 → 会话期有效，过期渲染占位 + 重生成
- [ ] `imagePrompts.buildDirectionImagePrompt()`
- [ ] `DirectionCard` 三列布局 + hero 图加载骨架
- [ ] 交互：Approve（选中）／ Regenerate one ／ Modify（改后重出该方向图）

**验收**：一次生成出 3 张明显不同的 hero 图并存 store；任一生成中断时不卡死、可单独重试；选择后 `selectedDirection` 落地，进入 Step 3。课堂最亮点（投票）可用。

### M4 — Step 3 Logo + Visual DNA（约 1 天）

任务：
- [ ] `prompts/brandIdentity.js`（3 logo 概念 + 8 维 DNA）；DNA 首版也可用一个独立调用，避免一次 payload 过大（按需拆分）
- [ ] `buildLogoImagePrompt()` ＋ 3 张 logo 概念图
- [ ] `LogoCard` 选择 + `DNA` 8 维展示（Principle + DO/DON'T）
- [ ] Approve → 解锁 Step 4

**验收**：一次输入产出 3 个可区分的 logo 概念与完整 DNA；选 1 个 logo + 批准后进入 Step 4；8 维结构完整、符合 §6 示例体例。

### M5 — Step 4 Visual Rules + 导出（约 0.5–1 天）

任务：
- [ ] `prompts/visualRules.js`（10 节 + Recipe + Instruction Block schema）
- [ ] Step4 版面（可读 Guide + 复制按钮）
- [ ] `export/exportHTML.js`（self-contained 单文件 HTML Guide；图片抓取后内嵌 data URI，防 Ark 签名 URL 24h 过期）
- [ ] `export/exportMarkdown.js`
- [ ] （可选）`exportJSON`

**验收**：批准后可导出可直接打开的 HTML 与 Markdown，内容覆盖 10 节 + Recipe + Instruction Block；复制按钮有效。

### M6 — 打磨 + 演示就绪（约 0.5 天）

任务：
- [ ] 全链路走查：异常（超时/限流/图片审核拦截）可优雅降级
- [ ] `README.md`：配置指引（本项目阿里云 MaaS 默认值 + DeepSeek/Kimi/OpenAI 备选）、课堂演示脚本、常见报错
- [ ] 一键"New Project"清理 localStorage
- [ ] 视觉细节：三方向对比观感、logo 区白底检查

**验收**：对照 §6 MVP DoD 全绿；10–15 分钟演示脚本无卡点。

---

## 6. MVP 验收清单（DoD，来自 agents.md §12）

- [x] Visual Brief（Step1 批准）
- [x] 3 个 Visual Directions + hero 图（Step2 选中 1）
- [x] 3 个 Logo 概念 + 图（Step3 选中 1）
- [x] Visual DNA（8 维）
- [x] Brand Visual Rules（10 节 + Recipe + Instruction Block）
- [x] HTML / Markdown 导出
- [ ] 以上流程在**真实 LLM + 真实文生图**下稳定跑通一遍（M6 联调）

---

## 7. 课堂演示脚本（10–15 分钟）

1. 打开页面 → New Project → 点 "Load sample brand (Haven)"（约 1 分钟）
2. 配置面板填入已准备好的 key（或已存）→ 生成 Visual Brief（2 分钟）
3. 生成 3 个视觉方向（现场等图，约 1–3 分钟）
4. **请听众投票选一个方向** ← 课堂高潮（1 分钟）
5. 生成 3 个 Logo + Visual DNA（2–3 分钟，可先讲 DNA 结构）
6. 选一个 Logo（30 秒）
7. 生成 Brand Visual Rules → 演示 Export HTML 打开给的"品牌手册"（1–2 分钟）
8. 收尾点题：「AI 探索，人做决定，规则保一致」

> 备用策略：若现场网络/图片超时，M6 内置占位降级 + 预置 mock 输出开关，确保演示不中断。

---

## 8. 风险与缓解

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R1 | **CORS**（已实测：OPTIONS 预检返回 401、无 `access-control-allow-origin`，网关拒绝浏览器跨域直连） | 既定风险，已用 Mode A 消除 | 默认 **Mode A**：开发走 Vite proxy（§2.5）；**公网部署已实现** `api/proxy.mjs` + `vercel.json`（Vercel Serverless 同域代理，key 在项目环境变量，`maxDuration:60` 覆盖生图耗时；可选 `DEMO_ACCESS_TOKEN` 防滥用） |
| R2 | 文生图延迟（10–30s）／限流／图片被审核拦截 | 演示等待、体验断裂 | 图片骨架屏 + 超时提示 + **逐张重试**（可单独为某方向重出图）；失败渲染占位图标注 "Image failed — retry" |
| R3 | LLM 返回非法 JSON（模型不稳定） | 流程中断 | `response_format: json_object` 优先；`parseJson` 三级容错（raw → ``` 块 → throw+retry）；prompt 内强调"只输出 JSON" |
| R4 | key 暴露与泄露 | 若公网部署=泄露 | **Mode A key 不进浏览器**：本地在 `.env.local` / dev server 进程；**Vercel 部署在项目环境变量，仅 serverless 进程内读取**；`vercel.json` 提供同域代理；README 明确安全边界 |
| R5 | 出图与方向描述风格漂移（每张图风格不一） | 破坏"一致性"核心叙事 | `imagePrompts` 强制注入同样的 color swatch / lighting / material / style 短语；Step4 生成的 `promptRecipe` 回填后续重生成 |
| R6 | 三方向容易生成相似变体 | 演示效果弱 | prompt 明确"3 个方向必须在 Typography / Lighting / Color / 叙事上明显分野"，并给出反例（两个都像则重出） |
| R7 | **生图链路已打通**（`doubao-seedream-4-5-251128` @ Ark ✓，已实测）。遗留注意：① 返回 TOS 签名 URL **24h 过期** → 会话期展示 + 过期渲染占位/重生成，导出 HTML 内嵌 data URI；② **像素下限 3,686,400** → 默认 `1920x1920`，低于此直接 400 | M3 出图 | image.js 默认 `1920x1920`、`response_format:'url'`；导出前抓图转 data URI；失败自动落占位图 |

---

## 9. 明确留给 V2+（本期不做）

- PDF 导出、真实 SVG/EPS Logo 资产打包
- 多用户 / 协作文档、评论
- Visual DNA 的在线可探索工具（色板实时预览等）
- 方向间高级混搭（A 的色 × C 的光）
- 后端托管 / 用户账号 / 用量计费

---

## 10. 执行建议

- 按 **M1 → M6** 顺序推进；每完成一个里程碑过一遍该节验收标准再继续。
- 联调顺序：先用**阿里云 MaaS 默认配置**跑通 Step 1（`qwen3.7-flash`），再带 Ark 真 key 验证并接入 Step 2 生图（`doubao-seedream-4-5-251128` via `/ark`）。
- 目录里 `agents.md` 是唯一需求来源，实现时以它为准；发现与文档冲突先在代码注释中标注。