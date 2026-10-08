SEO Audit — garixo.com
Type: SaaS (garage management software for auto repair shops) · Next.js/Vercel · SEO Health Score: 67/100 (Needs Work)

Category	Weight	Score	Basis
Technical SEO	22%	76	seo-technical
Content Quality	23%	58	seo-content
On-Page SEO	20%	~70	synthesized from technical/GEO findings
Schema	10%	58	seo-schema
Performance (CWV)	10%	74	seo-performance, lab data only — no CrUX creds
AI Search (GEO)	10%	68	seo-geo
Images	5%	~68	estimated — no dedicated /seo images run
(Backlinks: no score — 0/7 scoring factors have data, no Moz/Bing keys configured. SXO: separate 59/100 Gap Score. Sitemap/Cluster: folded into findings below, not part of the weighted score.)

Critical
1. Unverifiable 4.9★/98-review claim — flagged independently by 4 of 10 agents (schema, content, SXO, GEO). The homepage SoftwareApplication schema declares aggregateRating: {ratingValue: "4.9", reviewCount: "98"}, but only 3 unattributed testimonials ("Marcus T.", no shop name/photo) exist anywhere on the site — no G2, Capterra, or Trustpilot listing found. This is a genuine Google structured-data policy risk (manual action / rich-result suppression), not just an optimization gap. Fix: remove aggregateRating until backed by a real, linked review source, or replace it with a review array matching the 3 real testimonials.

2. 116 blog tag pages against only 23 actual posts (sitemap agent) — templated single-post wrapper pages, the same doorway-page risk profile as the location-page hard-stop rule. Fix: noindex/prune tags with <3 posts, consolidate into the 6 category pages.

3. Article schema missing image on every blog post (schema agent) — disqualifies all posts from Article rich results/Discover. Template-level fix, applies site-wide in one change.

High
Mobile LCP 3.4s (technical + performance, corroborated) — hero image is preloaded but missing fetchpriority="high"; render-blocking CSS also contributes.
Blog routes serve uncached, dynamic SSR — TTFB ~470ms vs ~187ms on the homepage, hurting exactly the comparison posts doing the real SEO work. Needs generateStaticParams()/ISR on /blog/[slug].
No security headers beyond HSTS (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy all missing).
IndexNow not implemented — free win for faster Bing/Yandex indexing of new blog content.
SoftwareApplication schema is duplicated and inconsistent between homepage (implies free) and /pricing ($79–129 tiers), no shared @id.
Every blog post shares an identical, verbatim author bio — a specific QRG AI-content marker; no expertise diversity beyond the founder.
No phone/email/address anywhere — ContactPoint schema and visible pages both lack it, a core B2B trust signal.
Zero external brand presence (GEO agent) — no LinkedIn, YouTube, G2, Capterra, or Wikipedia footprint; Organization.sameAs is empty. Identified as the single biggest lever for AI-citation improvement.
No competitor comparison/alternatives content despite the SERP itself surfacing listicles — SXO's "Comparison Shopper" persona scores 34/100 (Critical Mismatch).
Tablet breakpoint (~768px) clips the header CTA to "Get Starte" and wraps nav awkwardly (visual agent, screenshot-confirmed).
No pillar/hub page exists despite 23 solid blog posts (cluster agent) — two clear gaps: a commercial "Buyer's Guide" hub and an orphaned "Profitability" cluster (8 posts, largest topic bucket, unlinked). Also: "technician job management software" in meta keywords targets a completely different vertical (0% SERP overlap) — drop it.
Medium
Apex→www redirect is 2 hops with mismatched 307/308 codes.
GTM script 50% unused and preloaded ahead of the LCP image; first-party JS chunk 40% unused.
Favicon is 394KB — larger than the hero image, ~49% of total page weight.
/features (463 words, floor is 800) and /pricing (242 words, no FAQ) are thin.
Unsourced stats ("500+ shops," profit-loss %) sit next to properly-cited ones on the same page — inconsistent sourcing reads as a trust flag.
"Independent review" framing on a founder-authored blog post is misleading despite an in-body disclosure.
Schema polish: Organization.sameAs missing (ties to #11), Person (Steve Bang) not unified via @id, Offer objects missing seller.
Quick-answer blocks run short for AI citation (73–85 words vs. 134–167 optimal); homepage H1 is a tagline, not query-aligned.
Suspicious lastmod clustering in the sitemap (many URLs share identical millisecond timestamps).
No Moz/Bing API keys configured — backlink profile is fully unmeasured (free 10-minute fix: Moz signup).
Low
Title tag is 84 characters, will truncate in SERPs.
No theme-color/manifest; no llms.txt (unconfirmed adoption, cheap if added); deprecated priority/changefreq still in sitemap; footer touch targets under 48px; FAQPage schema present but delivers no Google SERP benefit post-May-2026 retirement (info only — don't remove, don't add more expecting rich results).
Recommended sequence
Today, no dependencies: Fix #1 (remove/source the rating), #3 (Article image template), #6 (security headers), #7 (IndexNow) — all fast, independent, unblock nothing else.
This week: #4+#16 (fetchpriority + defer GTM), #5 (ISR on blog), #8 (unify SoftwareApplication schema), #13 (tablet nav fix), #17 (favicon).
This month: #2 (tag-page pruning), #9+#10+#18-20 (content/trust pass), #12 (build first comparison page), #14's keyword cleanup before building pillars.
Ongoing initiative: #11 (brand presence — LinkedIn/YouTube/G2), #14's two pillar pages — these compound in value the longer they exist, so start now even though payoff is slower.
Each fix above has an implicit falsifiability check: e.g. #1 is resolved when the schema's reviewCount matches a page a user can actually verify; #4 is resolved when Lighthouse mobile LCP drops under 2.5s; #14 is resolved when a pillar page exists and internal links from the 23 posts point to it.