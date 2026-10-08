-- 启用 pgcrypto（UUID）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- updated_at 自动维护
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline jsonb NOT NULL DEFAULT '{}',
  domain text UNIQUE,
  default_locale text NOT NULL DEFAULT 'en',
  theme jsonb NOT NULL DEFAULT '{}',
  contact_email text,
  social_links jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE locales (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text,
  flag text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  published_at timestamptz,
  cover_asset_id uuid,
  -- 多语言字段：{"en":"…","zh-cn":"…",…}
  title jsonb NOT NULL DEFAULT '{}',
  tagline jsonb NOT NULL DEFAULT '{}',
  role jsonb NOT NULL DEFAULT '{}',
  services jsonb NOT NULL DEFAULT '{}',
  overview jsonb NOT NULL DEFAULT '{}',
  highlights jsonb NOT NULL DEFAULT '{}',
  body jsonb NOT NULL DEFAULT '{}',
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (brand_id, slug)
);
CREATE INDEX works_list_idx ON works (brand_id, status, sort_order);

CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  file_key text UNIQUE NOT NULL,
  url text NOT NULL,
  mime_type text,
  alt_text jsonb NOT NULL DEFAULT '{}',
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- cover 外键（media_assets 建表后补）
ALTER TABLE works
  ADD CONSTRAINT works_cover_fk
  FOREIGN KEY (cover_asset_id) REFERENCES media_assets(id) ON DELETE SET NULL;

-- 角色
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 权限点
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  module text NOT NULL,
  description text
);

-- 角色-权限关联
CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 后台用户
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  is_active boolean NOT NULL DEFAULT true,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX admin_users_brand_idx ON admin_users (brand_id, is_active);

-- 登录日志
CREATE TABLE login_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  username_attempted text,
  ip_address inet,
  user_agent text,
  status text NOT NULL CHECK (status IN ('success','failed')),
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX login_logs_user_idx ON login_logs (admin_user_id, created_at DESC);
CREATE INDEX login_logs_time_idx ON login_logs (created_at DESC);

-- 操作日志（审计）
CREATE TABLE operation_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  changes jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX operation_logs_brand_idx ON operation_logs (brand_id, created_at DESC);
CREATE INDEX operation_logs_resource_idx ON operation_logs (resource_type, resource_id);

-- 网站基础设置
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, key)
);

-- 询盘登记
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  budget text,
  message text NOT NULL,
  source text,
  ip_address inet,
  user_agent text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','closed','spam')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiries_brand_idx ON inquiries (brand_id, status, created_at DESC);
CREATE INDEX inquiries_ip_idx ON inquiries (ip_address, created_at DESC);

-- 产品
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  published_at timestamptz,
  cover_asset_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  name jsonb NOT NULL DEFAULT '{}',
  tagline jsonb NOT NULL DEFAULT '{}',
  description jsonb NOT NULL DEFAULT '{}',
  specs jsonb NOT NULL DEFAULT '{}',
  gallery jsonb NOT NULL DEFAULT '{}',
  body jsonb NOT NULL DEFAULT '{}',
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (brand_id, slug)
);
CREATE INDEX products_list_idx ON products (brand_id, status, sort_order);

-- 服务
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  slug text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  title jsonb NOT NULL DEFAULT '{}',
  description jsonb NOT NULL DEFAULT '{}',
  points jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (brand_id, slug)
);

-- 常见问题
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  question jsonb NOT NULL DEFAULT '{}',
  answer jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX faqs_list_idx ON faqs (brand_id, status, sort_order);

-- 客户评价
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_title jsonb NOT NULL DEFAULT '{}',
  avatar_asset_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  content jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX testimonials_list_idx ON testimonials (brand_id, status, sort_order);

-- 工序步骤
CREATE TABLE process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  icon text,
  title jsonb NOT NULL DEFAULT '{}',
  description jsonb NOT NULL DEFAULT '{}',
  output_tag jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX process_steps_list_idx ON process_steps (brand_id, status, sort_order);

-- 定位原则
CREATE TABLE position_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  title jsonb NOT NULL DEFAULT '{}',
  description jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX position_principles_list_idx ON position_principles (brand_id, status, sort_order);

-- 站点页面 SEO
CREATE TABLE seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  page_key text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}',
  noindex boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (brand_id, page_key)
);

-- 翻译任务队列
CREATE TABLE translation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  field text NOT NULL,
  source_locale text NOT NULL,
  target_locale text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','done','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX translation_jobs_poll_idx ON translation_jobs (status, created_at);
CREATE INDEX translation_jobs_resource_idx ON translation_jobs (resource_type, resource_id);

-- 第三方服务凭证
CREATE TABLE service_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  provider text NOT NULL,
  label text,
  key_encrypted text NOT NULL,
  key_hint text,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, provider)
);

-- updated_at 触发器
CREATE TRIGGER brands_updated BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER works_updated BEFORE UPDATE ON works
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER admin_users_updated BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inquiries_updated BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER faqs_updated BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER testimonials_updated BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER translation_jobs_updated BEFORE UPDATE ON translation_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER service_credentials_updated BEFORE UPDATE ON service_credentials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER roles_updated BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER process_steps_updated BEFORE UPDATE ON process_steps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER position_principles_updated BEFORE UPDATE ON position_principles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER seo_updated BEFORE UPDATE ON seo
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed：语言
INSERT INTO locales (code, name, native_name, flag, sort_order) VALUES
  ('en','English','English','gb',1),
  ('zh-cn','Simplified Chinese','简体中文','cn',2),
  ('zh-tw','Traditional Chinese','繁體中文','hk',3),
  ('fr','French','Français','fr',4),
  ('de','German','Deutsch','de',5),
  ('ru','Russian','Русский','ru',6),
  ('ja','Japanese','日本語','jp',7);

-- Seed：角色
INSERT INTO roles (slug, name, description, is_system) VALUES
  ('superadmin','超级管理员','全部权限',true),
  ('admin','管理员','除用户/角色管理外全部权限',true),
  ('editor','编辑','内容新建/编辑（无删除/发布）',true);

-- Seed：权限点（模块.动作）
INSERT INTO permissions (slug, name, module) VALUES
  ('works.view','查看作品','works'),('works.create','新建作品','works'),
  ('works.edit','编辑作品','works'),('works.delete','删除作品','works'),
  ('works.publish','发布作品','works'),
  ('products.view','查看产品','products'),('products.create','新建产品','products'),
  ('products.edit','编辑产品','products'),('products.delete','删除产品','products'),
  ('products.publish','发布产品','products'),
  ('services.view','查看服务','services'),('services.create','新建服务','services'),
  ('services.edit','编辑服务','services'),('services.delete','删除服务','services'),
  ('services.publish','发布服务','services'),
  ('faqs.view','查看FAQ','faqs'),('faqs.create','新建FAQ','faqs'),
  ('faqs.edit','编辑FAQ','faqs'),('faqs.delete','删除FAQ','faqs'),
  ('faqs.publish','发布FAQ','faqs'),
  ('process_steps.view','查看工序步骤','process_steps'),
  ('process_steps.create','新建工序步骤','process_steps'),
  ('process_steps.edit','编辑工序步骤','process_steps'),
  ('process_steps.delete','删除工序步骤','process_steps'),
  ('process_steps.publish','发布工序步骤','process_steps'),
  ('position_principles.view','查看定位原则','position_principles'),
  ('position_principles.create','新建定位原则','position_principles'),
  ('position_principles.edit','编辑定位原则','position_principles'),
  ('position_principles.delete','删除定位原则','position_principles'),
  ('position_principles.publish','发布定位原则','position_principles'),
  ('testimonials.view','查看评价','testimonials'),
  ('testimonials.moderate','审核评价','testimonials'),
  ('testimonials.delete','删除评价','testimonials'),
  ('media.view','查看媒体','media'),('media.upload','上传媒体','media'),
  ('media.delete','删除媒体','media'),
  ('inquiries.view','查看询盘','inquiries'),('inquiries.update','跟进询盘','inquiries'),
  ('translation.trigger','触发翻译','translation'),('translation.retry','重试翻译','translation'),
  ('settings.view','查看设置','settings'),('settings.edit','编辑设置','settings'),
  ('seo.view','查看SEO','seo'),('seo.edit','编辑SEO','seo'),
  ('credentials.view','查看凭证','credentials'),('credentials.edit','编辑凭证','credentials'),
  ('users.view','查看用户','users'),('users.create','新建用户','users'),
  ('users.edit','编辑用户','users'),('users.delete','删除用户','users'),
  ('roles.view','查看角色','roles'),('roles.edit','编辑角色','roles'),
  ('logs.view','查看日志','logs');

-- Seed：角色权限分配
-- superadmin：全部
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.slug='superadmin';
-- admin：除 users.* / roles.* 外全部
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug='admin' AND p.module NOT IN ('users','roles');
-- editor：内容新建/编辑 + 查看类
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug='editor' AND (
  (p.module IN ('works','products','services','faqs','process_steps','position_principles') AND p.slug LIKE '%.view')
  OR p.slug IN ('works.create','works.edit','products.create','products.edit',
                'services.create','services.edit','faqs.create','faqs.edit',
                'process_steps.create','process_steps.edit',
                'position_principles.create','position_principles.edit',
                'testimonials.view','media.view','media.upload','inquiries.view',
                'translation.trigger')
);
-- Seed：品牌
INSERT INTO brands (slug, name, tagline, domain, default_locale, contact_email, social_links, theme)
VALUES ('werkero','Werkero','{"en":"Independent studio","zh-cn":"独立工作室","zh-tw":"獨立工作室","fr":"Studio indépendant","de":"Unabhängiges Studio","ru":"Независимая студия","ja":"インディペンデントスタジオ"}','werkero-studio.vercel.app','en',
  'hello@werkero.studio','{"github":"https://github.com/adlerdler"}',
  '{"heroBg":"#0A0A0E","accent":"#F2FE67","serif":"Playfair Display"}');
