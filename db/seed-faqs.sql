-- Seed: faqs（artifact 文案，3 问答 x 7 语言）
INSERT INTO faqs (brand_id, sort_order, status, question, answer)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  1,
  'published',
  '{"en":"How does a project start?","zh-cn":"项目怎么启动？","zh-tw":"專案怎麼啟動？","fr":"Comment démarre un projet ?","de":"Wie startet ein Projekt?","ru":"Как начинается проект?","ja":"プロジェクトはどう始まる？"}',
  '{"en":"A conversation about the problem, not the feature list — then a written statement, success criteria and fixed scope before any code.","zh-cn":"先聊问题，不聊功能清单——然后形成书面陈述、成功标准和固定范围，之后才写一行代码。","zh-tw":"先聊問題，不聊功能清單——然後形成書面陳述、成功標準和固定範圍，之後才寫一行程式碼。","fr":"Une conversation sur le problème, pas sur la liste des fonctionnalités — puis un énoncé écrit, des critères de succès et un périmètre fixe avant la moindre ligne de code.","de":"Ein Gespräch über das Problem, nicht über die Feature-Liste — dann eine schriftliche Aussage, Erfolgskriterien und fixer Umfang, bevor eine Zeile Code entsteht.","ru":"Разговор о проблеме, а не о списке функций — затем письменное задание, критерии успеха и фиксированный скоуп до первой строки кода.","ja":"機能リストではなく問題についての対話から——それから文書化された要件、成功基準、固定スコープを決めて、初めてコードを書く。"}'
);

INSERT INTO faqs (brand_id, sort_order, status, question, answer)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  2,
  'published',
  '{"en":"How long does a build take?","zh-cn":"一个项目要做多久？","zh-tw":"一個專案要做多久？","fr":"Combien de temps prend une réalisation ?","de":"Wie lange dauert ein Build?","ru":"Сколько длится разработка?","ja":"開発期間はどれくらい？"}',
  '{"en":"A focused project usually ships in weeks, not quarters. You get a fixed timeline with the written statement — and a build that actually hits it.","zh-cn":"专注的项目通常按周交付，而不是按季度。书面陈述里会给出固定时间线——并且说到做到。","zh-tw":"專注的專案通常按週交付，而不是按季。書面陳述裡會給出固定時間線——並且說到做到。","fr":"Un projet cadré se livre en semaines, pas en trimestres. Vous recevez un calendrier fixe avec l’énoncé écrit — et une réalisation qui le tient.","de":"Ein fokussiertes Projekt shipped in Wochen, nicht in Quartalen. Sie erhalten eine fixe Timeline mit der schriftlichen Aussage — und einen Build, der sie einhält.","ru":"Сфокусированный проект обычно выходит за недели, а не кварталы. Вы получаете фиксированный таймлайн вместе с письменным заданием — и сборку, которая его выдерживает.","ja":"集中したプロジェクトは四半期ではなく週単位で出荷する。文書化された要件とともに固定タイムラインを提示する——そしてそれを守る。"}'
);

INSERT INTO faqs (brand_id, sort_order, status, question, answer)
VALUES (
  (SELECT id FROM brands WHERE slug='werkero'),
  3,
  'published',
  '{"en":"What does it cost?","zh-cn":"费用怎么算？","zh-tw":"費用怎麼算？","fr":"Combien ça coûte ?","de":"Was kostet es?","ru":"Сколько это стоит?","ja":"費用は？"}',
  '{"en":"Fixed scope, fixed price — quoted after we agree on the written statement. No hourly billing, no surprise invoices.","zh-cn":"范围固定、价格固定——书面陈述确认后再报价。不按小时计费，没有意外账单。","zh-tw":"範圍固定、價格固定——書面陳述確認後再報價。不按小時計費，沒有意外帳單。","fr":"Périmètre fixe, prix fixe — devisé après accord sur l’énoncé écrit. Pas de facturation horaire, pas de facture surprise.","de":"Fixer Umfang, fixer Preis — kalkuliert nach Einigung auf die schriftliche Aussage. Keine Stundenabrechnung, keine Überraschungsrechnungen.","ru":"Фиксированный скоуп, фиксированная цена — смета после согласования письменного задания. Никакой почасовой оплаты, никаких сюрпризов в счетах.","ja":"スコープ固定、価格固定——文書化された要件の合意後に見積もる。時間課金なし、請求のサプライズなし。"}'
);

