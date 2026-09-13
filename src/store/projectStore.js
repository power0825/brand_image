import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_API = {
  textModel: import.meta.env.VITE_TEXT_MODEL || 'qwen3.7-flash',
  imageModel: import.meta.env.VITE_IMAGE_MODEL || 'doubao-seedream-4-5-251128',
  openAiBase:
    import.meta.env.VITE_OPENAI_BASE_URL ||
    'https://ws-45mqrzn3org3r0jc.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
  arkBase: import.meta.env.VITE_ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  accessToken: import.meta.env.VITE_ACCESS_TOKEN || '', // 公网代理可选共享口令（与 Vercel DEMO_ACCESS_TOKEN 相同）
  direct: false, // false = Mode A（走本地代理，key 在 .env.local）；true = Mode B（直连 + 面板填 key）
  llmKey: '',
  imageKey: '',
}

const emptyProject = () => ({
  brandCore: {
    brandName: '',
    purpose: '',
    promise: '',
    targetAudience: '',
    positioning: '',
    personality: '',
    keyDifferentiation: '',
    usageContext: '',
    tagline: '',
  },
  visualBrief: null,
  visualDirections: [],
  selectedDirection: null,
  logoOptions: [],
  selectedLogo: null,
  visualRules: null,
  productImages: [], // 可选参考产品图 { id, name, dataUrl }，Step2 生图时作为 img2img 底图，压缩后存储
  approved: { brief: false, directions: false, identity: false, rules: false },
  step: 0,
})

export const useProject = create(
  persist(
    (set) => ({
      ...emptyProject(),
      apiConfig: DEFAULT_API,

      setApiConfig: (patch) => set((s) => ({ apiConfig: { ...s.apiConfig, ...patch } })),
      setBrandCore: (patch) => set((s) => ({ brandCore: { ...s.brandCore, ...patch } })),
      setProductImages: (list) => set({ productImages: list }),
      setVisualBrief: (brief) => set({ visualBrief: brief }),
      approveBrief: () => set((s) => ({ approved: { ...s.approved, brief: true }, step: 1 })),
      setDirections: (list) => set({ visualDirections: list }),
      selectDirection: (d) => set((s) => ({ selectedDirection: d, approved: { ...s.approved, directions: true } })),
      setLogoOptions: (list) => set({ logoOptions: list }),
      selectLogo: (logo) =>
        set((s) => ({ selectedLogo: logo, approved: { ...s.approved, identity: true }, step: 3 })),
      setVisualRules: (rules) => set({ visualRules: rules }),
      approveRules: () => set((s) => ({ approved: { ...s.approved, rules: true } })),
      setStep: (i) => set({ step: i }),

      importProject: (obj) =>
        set({
          ...emptyProject(),
          ...obj,
          apiConfig: { ...DEFAULT_API, ...(obj && obj.apiConfig ? obj.apiConfig : {}) },
          approved: obj && obj.approved ? { ...emptyProject().approved, ...obj.approved } : emptyProject().approved,
        }),
      reset: () => set((s) => ({ ...emptyProject(), apiConfig: s.apiConfig })),
    }),
    {
      name: 'brand-visual:project',
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        apiConfig: { ...current.apiConfig, ...(persisted && persisted.apiConfig ? persisted.apiConfig : {}) },
      }),
    },
  ),
)