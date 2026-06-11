import { escapeAttribute } from "../site/html";

export interface XenixPageProps {
  apiOrigin?: string;
}

const xenixScreenshots = [
  {
    src: "/images/xenix/PixPin_2026-06-11_21-36-46.png",
    alt: "Xenix 软件截图 1",
  },
  {
    src: "/images/xenix/PixPin_2026-06-11_21-37-43.png",
    alt: "Xenix 软件截图 2",
  },
  {
    src: "/images/xenix/PixPin_2026-06-11_21-38-12.png",
    alt: "Xenix 软件截图 3",
  },
];

const xenixFeatures = [
  {
    icon: "i-mdi-message-text-outline",
    title: "自然语言提问",
    description: "直接用日常语言描述你的分析需求，不需要编写 SQL 或公式。",
  },
  {
    icon: "i-mdi-chart-box-outline",
    title: "自动生成分析结果",
    description: "从数据中提取关键信息，并辅助生成更容易理解的图表与结论。",
  },
  {
    icon: "i-mdi-account-group-outline",
    title: "面向非技术人员",
    description:
      "降低数据分析门槛，让业务、运营和管理场景也能快速使用 AI 分析数据。",
  },
];

function apiPath(apiOrigin: string | undefined, path: string): string {
  return apiOrigin ? `${apiOrigin.replace(/\/$/, "")}${path}` : path;
}

export function xenixPage({ apiOrigin }: XenixPageProps): string {
  const downloadEndpoint = apiPath(apiOrigin, "/api/xenix/download");
  const totalScreenshots = xenixScreenshots.length;
  const screenshotSlides = xenixScreenshots
    .map(
      (screenshot, index) => `<figure
      class="xenix-carousel-slide"
      :aria-hidden="active !== ${index}"
      aria-label="Xenix 软件截图 ${index + 1} / ${totalScreenshots}"
    >
      <img
        src="${escapeAttribute(screenshot.src)}"
        alt="${escapeAttribute(screenshot.alt)}"
        loading="${index === 0 ? "eager" : "lazy"}"
        decoding="async"
      />
    </figure>`,
    )
    .join("\n");
  const screenshotDots = xenixScreenshots
    .map(
      (_, index) => `<button
      type="button"
      class="xenix-carousel-dot"
      :aria-current="active === ${index}"
      aria-label="查看第 ${index + 1} 张 Xenix 截图"
      @click="active = ${index}"
    ></button>`,
    )
    .join("\n");
  const featureItems = xenixFeatures
    .map(
      (feature) => `<li class="xenix-feature-item">
      <span class="xenix-feature-icon ${feature.icon}" aria-hidden="true"></span>
      <div>
        <h3 class="xenix-feature-title">${feature.title}</h3>
        <p class="xenix-feature-description">${feature.description}</p>
      </div>
    </li>`,
    )
    .join("\n");

  return `<article class="xenix-page">
  <header>
    <h1>Xenix</h1>
    <p>Xenix 是面向非技术人员的一款 AI 数据分析软件。</p>
  </header>

  <section
    class="xenix-carousel"
    aria-label="Xenix 软件截图"
    x-data="{ active: 0, total: ${totalScreenshots} }"
  >
    <div class="xenix-carousel-frame">
      <div
        class="xenix-carousel-track"
        :style="'transform: translateX(-' + active * 100 + '%)'"
      >
        ${screenshotSlides}
      </div>

      <button
        type="button"
        class="xenix-carousel-control previous"
        aria-label="查看上一张截图"
        @click="active = (active + total - 1) % total"
      >
        <span class="i-mdi-chevron-left" />
      </button>
      <button
        type="button"
        class="xenix-carousel-control next"
        aria-label="查看下一张截图"
        @click="active = (active + 1) % total"
      >
        <span class="i-mdi-chevron-right" />
      </button>
    </div>

    <div class="xenix-carousel-dots" aria-label="截图导航">
      ${screenshotDots}
    </div>
  </section>

  <section class="xenix-features" aria-labelledby="xenix-features-title">
    <div class="xenix-features-header">
      <p class="xenix-features-eyebrow">Features</p>
      <h2 id="xenix-features-title" class="xenix-features-title">为快速理解数据而设计</h2>
    </div>
    <ul class="xenix-feature-list">
      ${featureItems}
    </ul>
  </section>

  <section class="xenix-card" aria-labelledby="xenix-download-title">
    <div>
      <h2 id="xenix-download-title">获取软件</h2>
      <p>目前仅支持 Windows，下载后解压双击 xenix.exe 即可运行，初次启动较慢，请耐心等待</p>
      <p>填写手机号或邮箱即可开始下载</p>
    </div>

    <form
      class="xenix-download-form"
      hx-post="${escapeAttribute(downloadEndpoint)}"
      hx-target="#xenix-download-result"
      hx-swap="innerHTML"
      hx-indicator="#xenix-download-status"
    >
      <label for="xenix-contact">邮箱或手机号</label>
      <input
        id="xenix-contact"
        name="contact"
        type="text"
        placeholder="you@example.com / 13800000000"
        required
      />
      <button type="submit">获取</button>
      <p id="xenix-download-status" class="htmx-indicator">正在准备下载...</p>
    </form>

    <div
      id="xenix-download-result"
      class="xenix-download-result"
      aria-live="polite"
      hx-on::after-swap="const link = this.querySelector('[data-xenix-download-link]'); if (link) window.location.assign(link.href);"
    ></div>
  </section>
</article>`;
}
