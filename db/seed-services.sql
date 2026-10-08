-- Seed: services（artifact 文案，4 服务 x 7 语言）
-- icon 字段存 doodle 类型；brand-web-design 为宽卡（前端按 slug 识别）
INSERT INTO services (brand_id, slug, icon, sort_order, status, title, description, points)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  'full-stack-web-apps',
  'browser',
  1,
  'published',
  '{"en":"Full-Stack Web Apps","zh-cn":"全栈 Web 应用","zh-tw":"全端 Web 應用","fr":"Applications Web Full-Stack","de":"Full-Stack-Web-Apps","ru":"Full-stack веб-приложения","ja":"フルスタック Web アプリ"}',
  '{"en":"Production systems, end to end — from database schema to the last transition.","zh-cn":"端到端的生产系统——从数据库结构到最后一个过渡动画。","zh-tw":"端到端的生產系統——從資料庫結構到最後一個過場動畫。","fr":"Des systèmes de production de bout en bout — du schéma de base de données à la dernière transition.","de":"Produktionssysteme, Ende zu Ende — vom Datenbankschema bis zur letzten Transition.","ru":"Производственные системы под ключ — от схемы базы данных до последнего перехода.","ja":"エンドツーエンドの本番システム——DB設計から最後のトランジションまで。"}',
  '{}'
) ON CONFLICT (brand_id, slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, status='published', sort_order=EXCLUDED.sort_order;

INSERT INTO services (brand_id, slug, icon, sort_order, status, title, description, points)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  'ai-product-engineering',
  'sparkles',
  2,
  'published',
  '{"en":"AI Product Engineering","zh-cn":"AI 产品工程","zh-tw":"AI 產品工程","fr":"Ingénierie Produit IA","de":"KI-Produktentwicklung","ru":"Инженерия ИИ-продуктов","ja":"AI プロダクトエンジニアリング"}',
  '{"en":"LLM features that survive real users — and admit what they don''t know.","zh-cn":"经得起真实用户的 LLM 功能——不知道就承认不知道。","zh-tw":"經得起真實使用者的 LLM 功能——不知道就承認不知道。","fr":"Des fonctionnalités LLM qui survivent aux vrais utilisateurs — et admettent ce qu''elles ignorent.","de":"LLM-Features, die echte Nutzer überstehen — und zugeben, was sie nicht wissen.","ru":"LLM-функции, выживающие среди реальных пользователей — и признающие, чего не знают.","ja":"実際のユーザーに耐える LLM 機能——知らないことは知らないと言う。"}',
  '{}'
) ON CONFLICT (brand_id, slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, status='published', sort_order=EXCLUDED.sort_order;

INSERT INTO services (brand_id, slug, icon, sort_order, status, title, description, points)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  'e-commerce-systems',
  'eglobe',
  3,
  'published',
  '{"en":"E-Commerce Systems","zh-cn":"电商系统","zh-tw":"電商系統","fr":"Systèmes E-Commerce","de":"E-Commerce-Systeme","ru":"E-commerce системы","ja":"EC システム"}',
  '{"en":"Cross-border storefronts that convert — and stay up on launch day.","zh-cn":"高转化的跨境独立站——上线当天不宕机。","zh-tw":"高轉換的跨境獨立站——上線當天不當機。","fr":"Des boutiques transfrontalières qui convertissent — et tiennent le jour du lancement.","de":"Grenzüberschreitende Shops, die konvertieren — und am Launch-Tag online bleiben.","ru":"Трансграничные магазины, которые конвертируют — и не падают в день запуска.","ja":"転換する越境 EC——ローンチ日に落ちない。"}',
  '{}'
) ON CONFLICT (brand_id, slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, status='published', sort_order=EXCLUDED.sort_order;

INSERT INTO services (brand_id, slug, icon, sort_order, status, title, description, points)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  'brand-web-design',
  'shapes',
  4,
  'published',
  '{"en":"Brand & Web Design","zh-cn":"品牌与网页设计","zh-tw":"品牌與網頁設計","fr":"Design de Marque & Web","de":"Brand- & Webdesign","ru":"Бренд и веб-дизайн","ja":"ブランド & Web デザイン"}',
  '{"en":"Identity and interfaces with a point of view — typographic, restrained, fast.","zh-cn":"有观点的品牌与界面——字体排印、克制、快。","zh-tw":"有觀點的品牌與介面——字體排印、克制、快。","fr":"Identité et interfaces avec un point de vue — typographique, sobre, rapide.","de":"Identität und Interfaces mit Haltung — typografisch, zurückhaltend, schnell.","ru":"Айдентика и интерфейсы с позицией — типографика, сдержанность, скорость.","ja":"主張のあるアイデンティティとインターフェース——タイポグラフィ、抑制、高速。"}',
  '{}'
) ON CONFLICT (brand_id, slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, status='published', sort_order=EXCLUDED.sort_order;

