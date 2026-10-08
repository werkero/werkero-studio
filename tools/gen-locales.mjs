// Generates app/locales/<locale>/<ns>.json for all 7 locales from artifact copy.
// English copy transcribed from the Muse artifact; other languages translated by hand.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'locales')
const LOCALES = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja']

const D = {}

// ---------- hero ----------
D.hero = {
  en: { eyebrow: 'INDEPENDENT STUDIO · SHENZHEN, CHINA', line1: 'Ideas are cheap.', line2a: 'Shipped is', line2b: 'everything.', description: 'Werkero is the one-person studio of Tai — design, code and launch, end to end, from Shenzhen.', ctaPrimary: 'See the work', ctaSecondary: 'Start a project' },
  'zh-cn': { eyebrow: '独立工作室 · 中国深圳', line1: '想法不值钱。', line2a: '交付', line2b: '才是一切。', description: 'Werkero 是 Tai 的一人工作室——设计、代码、上线，全栈端到端，来自深圳。', ctaPrimary: '看作品', ctaSecondary: '发起项目' },
  'zh-tw': { eyebrow: '獨立工作室 · 中國深圳', line1: '想法不值錢。', line2a: '交付', line2b: '才是一切。', description: 'Werkero 是 Tai 的一人工作室——設計、程式碼、上線，全端到端，來自深圳。', ctaPrimary: '看作品', ctaSecondary: '發起專案' },
  fr: { eyebrow: 'STUDIO INDÉPENDANT · SHENZHEN, CHINE', line1: 'Les idées ne coûtent rien.', line2a: 'Livrer,', line2b: "c'est tout.", description: 'Werkero est le studio solo de Tai — design, code et lancement, de bout en bout, depuis Shenzhen.', ctaPrimary: 'Voir les projets', ctaSecondary: 'Démarrer un projet' },
  de: { eyebrow: 'UNABHÄNGIGES STUDIO · SHENZHEN, CHINA', line1: 'Ideen sind billig.', line2a: 'Ausliefern', line2b: 'ist alles.', description: 'Werkero ist das Ein-Personen-Studio von Tai — Design, Code und Launch, Ende zu Ende, aus Shenzhen.', ctaPrimary: 'Arbeiten ansehen', ctaSecondary: 'Projekt starten' },
  ru: { eyebrow: 'НЕЗАВИСИМАЯ СТУДИЯ · ШЭНЬЧЖЭНЬ, КИТАЙ', line1: 'Идеи ничего не стоят.', line2a: 'Поставка —', line2b: 'это всё.', description: 'Werkero — студия одного человека, Тая: дизайн, код и запуск, от начала до конца, из Шэньчжэня.', ctaPrimary: 'Смотреть работы', ctaSecondary: 'Начать проект' },
  ja: { eyebrow: 'インディペンデントスタジオ · 中国・深圳', line1: 'アイデアに価値はない。', line2a: '届けることこそ', line2b: 'すべて。', description: 'Werkero は Tai の一人スタジオ——デザイン、コード、ローンチまでエンドツーエンド。深圳から。', ctaPrimary: '作品を見る', ctaSecondary: 'プロジェクトを始める' },
}

// ---------- nav ----------
D.nav = {
  en: { services: 'Services', work: 'Work', process: 'Process', about: 'About', contact: 'Contact' },
  'zh-cn': { services: '服务', work: '作品', process: '流程', about: '关于', contact: '联系' },
  'zh-tw': { services: '服務', work: '作品', process: '流程', about: '關於', contact: '聯絡' },
  fr: { services: 'Services', work: 'Projets', process: 'Processus', about: 'À propos', contact: 'Contact' },
  de: { services: 'Leistungen', work: 'Arbeiten', process: 'Prozess', about: 'Über', contact: 'Kontakt' },
  ru: { services: 'Услуги', work: 'Работы', process: 'Процесс', about: 'О нас', contact: 'Связаться' },
  ja: { services: 'サービス', work: '作品', process: 'プロセス', about: '概要', contact: 'お問い合わせ' },
}

// ---------- ticker ----------
const TICKER_ITEMS = ['Arkhyx', 'AETHER', 'The Registry', 'VUE 3', 'Nuxt 3', 'REACT', 'Next.js', 'LARAVEL', 'Supabase', 'WOOCOMMERCE', 'Cloudflare Workers']
D.ticker = {
  en: { label: 'THE WERKERO PRODUCT FAMILY & CORE STACK', items: TICKER_ITEMS },
  'zh-cn': { label: 'WERKERO 产品家族与核心技术栈', items: TICKER_ITEMS },
  'zh-tw': { label: 'WERKERO 產品家族與核心技術棧', items: TICKER_ITEMS },
  fr: { label: 'LA FAMILLE DE PRODUITS WERKERO & STACK TECHNIQUE', items: TICKER_ITEMS },
  de: { label: 'DIE WERKERO-PRODUKTFAMILIE & DER CORE-STACK', items: TICKER_ITEMS },
  ru: { label: 'ПРОДУКТОВАЯ СЕМЬЯ WERKERO И ОСНОВНОЙ СТЭК', items: TICKER_ITEMS },
  ja: { label: 'WERKERO プロダクトファミリー & コアスタック', items: TICKER_ITEMS },
}

// ---------- position ----------
D.position = {
  en: {
    eyebrow: 'OUR POSITION',
    headline: 'Design and engineering are {hl}one act of making{/hl} — judged by one standard: does it work in production, for real people?',
    principles: [
      { n: '01', title: 'Finished beats impressive', text: 'A modest product that ships beats a brilliant demo in a slide deck.' },
      { n: '02', title: 'No half-built anything', text: 'Every feature ships complete — designed, engineered, tested — or not at all.' },
      { n: '03', title: 'Precision is the aesthetic', text: 'A stray pixel or slow query gets fixed, not explained away.' },
    ],
  },
  'zh-cn': {
    eyebrow: '我们的立场',
    headline: '设计与工程是{hl}同一件事{/hl}——只用一个标准衡量：它在生产环境里，对真实的人，管用吗？',
    principles: [
      { n: '01', title: '完成胜过惊艳', text: '一个能按时上线的朴素产品，胜过幻灯片里华丽的演示。' },
      { n: '02', title: '不做半成品', text: '每个功能要么完整交付——设计、工程、测试缺一不可——要么不上。' },
      { n: '03', title: '精确即美学', text: '一个错位的像素、一条慢查询，只修不解释。' },
    ],
  },
  'zh-tw': {
    eyebrow: '我們的立場',
    headline: '設計與工程是{hl}同一件事{/hl}——只用一個標準衡量：它在生產環境裡，對真實的人，管用嗎？',
    principles: [
      { n: '01', title: '完成勝過驚豔', text: '一個能準時上線的樸素產品，勝過投影片裡華麗的演示。' },
      { n: '02', title: '不做半成品', text: '每個功能要麼完整交付——設計、工程、測試缺一不可——要麼不上。' },
      { n: '03', title: '精確即美學', text: '一個錯位的像素、一條慢查詢，只修不解釋。' },
    ],
  },
  fr: {
    eyebrow: 'NOTRE POSITION',
    headline: "Le design et l'ingénierie sont {hl}un seul et même acte{/hl} — jugés à une seule aune : est-ce que ça marche en production, pour de vraies personnes ?",
    principles: [
      { n: '01', title: 'Fini bat impressionnant', text: 'Un produit modeste qui sort bat une démo brillante dans un diaporama.' },
      { n: '02', title: 'Rien à moitié construit', text: 'Chaque fonctionnalité sort complète — designée, développée, testée — ou pas du tout.' },
      { n: '03', title: "La précision est l'esthétique", text: 'Un pixel de travers ou une requête lente se corrige, il ne se justifie pas.' },
    ],
  },
  de: {
    eyebrow: 'UNSERE HALTUNG',
    headline: 'Design und Engineering sind {hl}ein einziger Akt des Machens{/hl} — gemessen an einem einzigen Maßstab: Funktioniert es in Produktion, für echte Menschen?',
    principles: [
      { n: '01', title: 'Fertig schlägt beeindruckend', text: 'Ein bescheidenes Produkt, das erscheint, schlägt eine brillante Demo in einer Präsentation.' },
      { n: '02', title: 'Nichts Halbgebautes', text: 'Jedes Feature erscheint vollständig — designt, entwickelt, getestet — oder gar nicht.' },
      { n: '03', title: 'Präzision ist die Ästhetik', text: 'Ein verrutschter Pixel oder eine langsame Abfrage wird behoben, nicht erklärt.' },
    ],
  },
  ru: {
    eyebrow: 'НАША ПОЗИЦИЯ',
    headline: 'Дизайн и инженерия — {hl}единый акт создания{/hl}, и мера у него одна: работает ли это в продакшене, для живых людей?',
    principles: [
      { n: '01', title: 'Готовое бьёт впечатляющее', text: 'Скромный продукт, который вышел, бьёт блестящее демо в слайдах.' },
      { n: '02', title: 'Ничего недоделанного', text: 'Каждая функция выходит полностью — спроектированная, разработанная, протестированная — или не выходит вовсе.' },
      { n: '03', title: 'Точность — это эстетика', text: 'Съехавший пиксель или медленный запрос исправляют, а не объясняют.' },
    ],
  },
  ja: {
    eyebrow: '私たちの立場',
    headline: 'デザインとエンジニアリングは{hl}ひとつの創造行為{/hl}——評価基準はひとつだけ。本番環境で、実際の人々のために動くか。',
    principles: [
      { n: '01', title: '完成は感動に勝る', text: '出荷される質素なプロダクトは、スライドの中の華麗なデモに勝る。' },
      { n: '02', title: '中途半端は作らない', text: 'すべての機能は完全な形で出す——設計、実装、テスト済み。でなければ出さない。' },
      { n: '03', title: '精度こそ美学', text: 'ずれたピクセルも遅いクエリも、言い訳せず直す。' },
    ],
  },
}


export { D }
