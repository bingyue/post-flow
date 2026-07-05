import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CalendarClock,
  Check,
  Clock3,
  FileText,
  ImageIcon,
  Layers,
  Mail,
  Megaphone,
  MessageCircle,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
  Workflow,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PLAN_CATALOG } from '@/lib/billing'

const navItems = [
  { href: '#features', label: '功能' },
  { href: '#workflow', label: '流程' },
  { href: '#pricing', label: '价格' },
  { href: '#about', label: '关于我们' },
  { href: '#contact', label: '联系我们' },
]

const proofStats = [
  { value: '500+', label: '目标服务创作者', desc: '面向独立博主、品牌运营和代运营团队' },
  { value: '30,000+', label: '内容草稿承载能力', desc: '覆盖选题、正文、标签、封面与发布任务' },
  { value: '70%+', label: '目标提效空间', desc: '把重复写稿、适配和排期交给 AI 工作流' },
  { value: '2+', label: '首批平台支持', desc: '小红书、微信公众号优先验证闭环' },
]

const features = [
  {
    icon: Bot,
    title: 'AI 选题与写稿',
    desc: '从一句选题生成标题、正文、标签和多版本草稿，支持改写、扩写、缩短和重拟标题。',
  },
  {
    icon: Layers,
    title: '多平台内容适配',
    desc: '围绕小红书、公众号等平台自动调整标题长度、标签密度、正文结构和语气。',
  },
  {
    icon: ImageIcon,
    title: 'AI 配图与封面',
    desc: '用 Seed 系列图片能力生成封面与配图，并按平台维护不同封面选择。',
  },
  {
    icon: CalendarClock,
    title: '定时发布与队列',
    desc: '把即时发布、定时发布、失败重试和发布日志沉淀成稳定内容运营流程。',
  },
  {
    icon: FileText,
    title: '内容资产管理',
    desc: '草稿、版本、图片、平台变体和发布任务统一存储，登录后跨页面实时同步。',
  },
  {
    icon: BarChart3,
    title: '商业化运营看板',
    desc: '管理端可查看用户、订单、支付和任务信息，为后续订阅收入验证打基础。',
  },
]

const workflowSteps = [
  { title: '输入选题', desc: '给出关键词、主题或参考链接', icon: PenLine },
  { title: 'AI 生成', desc: '自动产出图文初稿和标签', icon: Wand2 },
  { title: '平台适配', desc: '一稿多发，按平台自动改写', icon: Workflow },
  { title: '排期发布', desc: '选择账号并进入发布队列', icon: Send },
  { title: '复盘优化', desc: '用日志和任务状态沉淀经验', icon: BarChart3 },
]

const audiences = [
  {
    icon: Users,
    title: '独立创作者',
    desc: '把日常选题、写稿、配图和发布排期集中到一个工作台，降低持续更新成本。',
  },
  {
    icon: Megaphone,
    title: '品牌社媒运营',
    desc: '快速生产多平台图文素材，让热点响应、活动宣发和内容排期更稳定。',
  },
  {
    icon: Building2,
    title: 'MCN / 代运营团队',
    desc: '管理多账号、多客户和多任务，后续可扩展审批流、角色权限和团队额度。',
  },
]

const faqs = [
  {
    q: 'PostFlow 现在支持哪些平台？',
    a: 'MVP 优先验证小红书和微信公众号的图文创作、适配和发布任务流程，后续可扩展微博、知乎等平台。',
  },
  {
    q: '首页展示的数据是真实客户数据吗？',
    a: '当前为商业化展示口径和目标服务能力，便于对外讲清产品价值。真实运营数据上线后可以直接替换。',
  },
  {
    q: '是否支持真实自动发布？',
    a: '产品架构已经保留平台账号、发布队列和发布日志，MVP 阶段以模拟发布和接口闭环验证为主。',
  },
  {
    q: '会员订阅如何计费？',
    a: '当前按 Free、Creator、Pro、Team 四档设计，包含订阅制、AI 额度和团队席位，真实支付可在后续接入。',
  },
]

function priceText(monthlyPrice: number) {
  return monthlyPrice === 0 ? '免费' : `¥${monthlyPrice}/月`
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-blue-600 shadow-[0_14px_30px_rgba(225,29,72,0.28)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-slate-950">PostFlow 创流</div>
              <div className="text-xs font-medium text-rose-500">AI Social Content Studio</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-rose-700">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="secondary">登录</Button>
            </Link>
            <Link href="/register">
              <Button>免费试用</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative">
            <Badge color="xhs">专注文字与图文，不做短视频</Badge>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
              AI 社媒图文创作与自动分发工作台
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              从选题、写稿、配图、多平台适配到定时发布，PostFlow 帮内容创作者和运营团队把图文内容生产变成可复制的流程。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">
                  开始免费试用 <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  查看功能展示
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {['DeepSeek 文案生成', 'Seed 系列图片能力', 'SQLite MVP 快速落地'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-rose-200/50 to-blue-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_32px_80px_rgba(15,23,42,0.16)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs text-slate-400">PostFlow Studio</div>
                    <div className="font-display text-lg font-semibold">本周图文内容排期</div>
                  </div>
                  <Badge className="border-white/15 bg-white/10 text-white">Live Preview</Badge>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <PenLine className="h-4 w-4 text-rose-200" />
                        AI 生成草稿
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 rounded-full bg-white/30" />
                        <div className="h-2 w-5/6 rounded-full bg-white/20" />
                        <div className="h-2 w-2/3 rounded-full bg-white/20" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/30 to-blue-500/20 p-4">
                      <ImageIcon className="h-5 w-5 text-rose-100" />
                      <div className="mt-12 text-sm font-semibold">封面图生成完成</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { platform: '小红书', status: '已适配', time: '今天 20:30', color: 'text-rose-200' },
                      { platform: '公众号', status: '待审核', time: '明天 09:00', color: 'text-emerald-200' },
                      { platform: '发布队列', status: '2 个任务', time: '自动重试开启', color: 'text-blue-200' },
                    ].map((item) => (
                      <div key={item.platform} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{item.platform}</div>
                          <div className={item.color}>{item.status}</div>
                        </div>
                        <div className="mt-2 text-xs text-slate-300">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-4 md:grid-cols-4">
            {proofStats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_14px_30px_rgba(225,29,72,0.08)] backdrop-blur">
                <div className="font-display text-4xl font-bold text-slate-950">{item.value}</div>
                <div className="mt-2 font-semibold text-slate-800">{item.label}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <Badge color="info">核心功能</Badge>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">
              不是单点 AI 工具，而是一条完整的图文内容流水线
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              PostFlow 把创作、资产、适配、发布和管理端商业化数据放在同一个系统里，让内容生产更像产品化流程。
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-[0_14px_30px_rgba(225,29,72,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-blue-50 text-rose-600 ring-1 ring-rose-100">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
          <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-slate-950 text-white shadow-[0_32px_80px_rgba(15,23,42,0.16)]">
            <div className="relative p-8 md:p-10">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/25 blur-3xl" />
              <div className="relative">
                <Badge className="border-white/15 bg-white/10 text-white">工作流</Badge>
                <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
                  从灵感到发布，5 步完成图文生产闭环
                </h2>
                <div className="mt-8 grid gap-4 md:grid-cols-5">
                  {workflowSteps.map(({ title, desc, icon: Icon }, index) => (
                    <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-rose-200" />
                        <span className="text-xs text-slate-400">0{index + 1}</span>
                      </div>
                      <div className="mt-5 font-display text-lg font-semibold">{title}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Badge color="xhs">适用对象</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">
                服务持续产出图文内容的人和团队
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                不管你是一个人经营 IP，还是为品牌或多个客户维护账号，PostFlow 都围绕稳定产能和发布效率设计。
              </p>
            </div>
            <div className="grid gap-4">
              {audiences.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-[0_14px_30px_rgba(225,29,72,0.08)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <Badge color="warning">会员订阅</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">
                从免费试用到团队代运营，按内容产能扩展
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                首页展示与会员中心一致的 Free、Creator、Pro、Team 四档，为商业化转化提供清晰入口。
              </p>
            </div>
            <Link href="/register">
              <Button size="lg">立即创建账号</Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {PLAN_CATALOG.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-3xl border bg-white/85 p-6 shadow-[0_14px_30px_rgba(225,29,72,0.08)] ${
                  plan.featured ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-rose-100'
                }`}
              >
                {plan.featured && (
                  <Badge color="xhs" className="absolute right-5 top-5">
                    推荐
                  </Badge>
                )}
                <div className="font-display text-2xl font-bold text-slate-950">{plan.name}</div>
                <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{plan.tagline}</p>
                <div className="mt-6">
                  <span className="font-display text-4xl font-bold text-slate-950">{priceText(plan.monthlyPrice)}</span>
                  {plan.monthlyPrice > 0 && <span className="ml-2 text-sm text-slate-500">起</span>}
                </div>
                <div className="mt-3 text-sm font-medium text-rose-600">{plan.audience}</div>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.label} className="flex gap-2 text-sm text-slate-600">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${feature.highlighted ? 'text-rose-600' : 'text-emerald-600'}`} />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="mt-6 block">
                  <Button className="w-full" variant={plan.featured ? 'primary' : 'secondary'}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] border border-rose-100 bg-white/85 p-8 shadow-[0_14px_30px_rgba(225,29,72,0.08)]">
              <Badge color="info">关于我们</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">
                为图文内容创作者打造的 AI 内容助手
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                PostFlow 的产品边界很清晰：聚焦文字和图文内容，不做短视频。我们希望帮助创作者和运营团队把高频重复的内容生产动作自动化，同时保留人工判断、品牌风格和发布节奏。
              </p>
            </div>
            <div id="contact" className="rounded-[2rem] border border-rose-100 bg-slate-950 p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.16)]">
              <Badge className="border-white/15 bg-white/10 text-white">联系我们</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">想用于团队或商业项目？</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                如果你正在运营品牌账号、MCN 内容矩阵或代运营业务，可以联系 PostFlow 讨论团队版、私有化、平台连接器和商业合作。
              </p>
              <div className="mt-6 grid gap-3">
                <a href="mailto:here.bingyue@gmail.com" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15">
                  <Mail className="h-4 w-4 text-rose-200" />
                  here.bingyue@gmail.com
                </a>
                <Link href="/register" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15">
                  <MessageCircle className="h-4 w-4 text-blue-200" />
                  先创建账号体验完整 MVP
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Badge color="default">FAQ</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">常见问题</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                这里先回答对外展示时最常见的产品、平台和付费问题。
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-[0_14px_30px_rgba(225,29,72,0.08)]">
                  <h3 className="font-display text-lg font-semibold text-slate-950">{item.q}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 to-blue-50 p-8 text-center shadow-[0_24px_60px_rgba(225,29,72,0.12)]">
            <ShieldCheck className="mx-auto h-10 w-10 text-rose-600" />
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950">
              准备把内容生产流程产品化了吗？
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              现在注册即可体验 PostFlow 的 AI 创作、草稿管理、多平台适配和发布任务闭环。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/register">
                <Button size="lg">免费试用</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  已有账号登录
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rose-100 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-display text-lg font-bold text-slate-950">PostFlow 创流</div>
            <div className="mt-1 text-sm text-slate-500">AI 社媒图文创作与分发工作台</div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-rose-700">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock3 className="h-4 w-4" />
            2026 PostFlow MVP
          </div>
        </div>
      </footer>
    </div>
  )
}
