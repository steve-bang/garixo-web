# Blog consolidation plan (planning only, no posts removed)

Goal: one page per search intent. Decide which post to keep using Search Console (Performance > Pages, 3 months): keep the post with more impressions, merge useful sections from the other, then 301 the old URL in `next.config.ts` `redirects()` and drop it from the blog sitemap.

| Intent | Posts | Suggested keeper |
| --- | --- | --- |
| Best software | `best-auto-repair-shop-management-software-2026`, `best-garage-management-software-for-small-shops` | `best-garage-management-software-for-small-shops` (closer to the target keyword) |
| Vs spreadsheets | `garage-management-software-vs-spreadsheets`, `auto-repair-shop-spreadsheet-vs-software` | `garage-management-software-vs-spreadsheets` |
| Losing money | `auto-repair-shop-losing-money`, `auto-repair-shop-losing-money-without-software` | `auto-repair-shop-losing-money` |

Keep as separate posts (different intent, named competitors): `garixo-vs-tekmetric`, `garixo-vs-shopmonkey`, `tekmetric-vs-shopmonkey-vs-garixo`.

Steps per group: confirm keeper from Search Console, merge sections, add `redirects()` entry, update internal links (`grep -rn "<old-slug>" public/blog src`), delete the old markdown file, verify the sitemap.
