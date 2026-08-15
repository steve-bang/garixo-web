# Garixo.com — Kế Hoạch SEO 6 Tháng (Reset)

**Ngày lập:** 15/08/2026 · **Thời gian:** 15/08/2026 → 15/02/2027 (6 tháng)
**Baseline hiện tại:** < 100 organic visits/tháng
**Mục tiêu:** 1.000 organic visits/tháng vào cuối tháng 6 (tháng 02/2027)

---

## 1. Tóm tắt điều hành

Garixo đã public từ tháng 3/2026 — tức là đã sống được **5,5 tháng** — nhưng traffic organic vẫn dưới 100/tháng. Sau khi audit toàn bộ codebase và crawl trực tiếp garixo.com, kết luận chính là:

> **Đây không phải vấn đề chất lượng content. Đây là vấn đề thực thi (execution) và uy tín off-page (authority).**

Bằng chứng:

- Một kế hoạch content 6 tháng rất chi tiết đã tồn tại từ tháng 3/2026 (`docs/blog-planning.md`, 72 bài, lịch 3 bài/tuần) — nhưng **chưa bao giờ được thực thi đúng lịch**. Chỉ 16/72 bài tồn tại, và cả 16 bài đó được publish dồn trong một khoảng ~36 giờ (14–15/08/2026, tức hôm qua/hôm nay), không phải trải đều theo lịch Thứ 2/4/6 như kế hoạch gốc.
- Một rủi ro mà chính kế hoạch cũ đã tự cảnh báo trong checklist của nó ("merge 2 bài đang bị cannibalization") **vẫn chưa được xử lý** — 2 bài `auto-repair-shop-losing-money` và `auto-repair-shop-losing-money-without-software` vẫn tồn tại song song.
- Các bài đã publish thực sự **tốt**: 2.800+ từ, cấu trúc H1/H2 rõ ràng, internal link tốt, có FAQ schema. Đây không phải vấn đề chất lượng.
- **Zero off-page presence**: không tìm thấy bất kỳ backlink, listing trên directory, hay mention nào từ bên thứ ba cho "garixo" hoặc "garixo.com" ở bất kỳ đâu trên web.
- Có một loạt bug kỹ thuật SEO cụ thể, dễ sửa (chi tiết ở mục 3).

Kế hoạch này **không viết lại từ đầu** — nó audit lại 16 bài đã có, sửa các lỗi kỹ thuật, và **resequence phần còn lại** của kế hoạch 72 bài cũ với tần suất thực tế hơn (2 bài/tuần thay vì 3 bài/tuần đã thất bại), song song với một track xây dựng uy tín off-page mà kế hoạch cũ hoàn toàn thiếu.

---

## 2. Đánh giá hiện trạng (Audit)

### 2.1. Điểm mạnh (giữ nguyên, không cần sửa)

- Kiến trúc content: Firestore-backed blog với đầy đủ field SEO (`metaTitle`, `metaDescription`, `focusKeyword`, `canonical`, `schemaType`, `seoScore`, `faqItems`) — hệ thống CMS đã ready để scale.
- `robots.txt` (`src/app/robots.ts`) đúng chuẩn Next.js, block đúng `/api/`, `/dashboard/`.
- Sitemap blog (`src/app/sitemap-blog.xml/route.ts`) là dynamic, đúng, chỉ lấy bài `published && isIndexed`.
- Mỗi trang marketing đều có `title`/`description`/`canonical`/`openGraph` riêng, viết tay, không generic.
- Đã có `BreadcrumbList` schema trên phần lớn trang tĩnh (commit `04fa8d5`).
- 16 bài blog hiện tại: content dài, có internal link, có FAQ schema, có author attribution.
- Google đã bắt đầu crawl và trust một phần content — bài "7 Best Garage Management Software" đã xuất hiện trong AI-generated search summary cho query "best garage management software small shops 2026".
- 2 tool tương tác (`Labor Rate Calculator`, `Shop Profit Calculator`) — tài sản link-bait tự nhiên, hiện chưa được tận dụng.

### 2.2. Bug kỹ thuật SEO cần sửa (Phase 0, chi tiết mục 4)

| #   | Vấn đề                                                                                                                                                   | File                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `lastmod` trong sitemap index bị hardcode cứng (`2026-03-01T06:45:12.110Z`) cho mọi trang                                                                | `src/app/sitemap.xml/route.ts`                                                  |
| 2   | `/about` xuất hiện **2 lần** trong sitemap-static với 2 priority khác nhau (0.9 và 0.7)                                                                  | `src/app/sitemap-static.xml/route.ts`                                           |
| 3   | Bug copy-paste trong breadcrumb schema: item thứ 2 có `name: 'Case Studies'` nhưng `item` trỏ về `/about`                                                | `src/app/about/page.tsx`                                                        |
| 4   | Không có Google Search Console verification (không có meta tag, không có file verification)                                                              | `src/app/layout.tsx`                                                            |
| 5   | `metadataBase` bị lặp lại y hệt ở **19 trang** thay vì set 1 lần ở root layout                                                                           | toàn bộ `src/app/**/page.tsx`                                                   |
| 6   | Thiếu `BreadcrumbList` schema trên 2 template quan trọng nhất: chi tiết blog và chi tiết case study                                                      | `src/app/blog/[slug]/page.tsx`, `src/app/case-studies/[slug]/page.tsx`          |
| 7   | Thiếu Twitter card metadata                                                                                                                              | `src/app/features/page.tsx`, `src/app/blog/[slug]/page.tsx`                     |
| 8   | Brand casing không nhất quán trong `<title>`: `Garixo` vs `GARIXO`                                                                                       | `privacy-policy`, `term-of-services`, `case-studies`, `case-studies/[slug]`     |
| 9   | `/auth/login`, `/auth/sign-up` đang **indexable** (không bị disallow, còn có breadcrumb schema) — không nên để Google index trang login                  | `src/app/robots.ts`, `src/app/(public)/auth/*`                                  |
| 10  | Không có `WebSite` schema site-wide, `Organization` schema bị lặp lại với field khác nhau ở 3+ nơi                                                       | `src/components/SEO/*`, `src/app/case-studies/**`                               |
| 11  | Author bio **đã viết trong code nhưng bị comment out** — mất tín hiệu E-E-A-T; chỉ có 1 author hardcode, chưa có avatar                                  | `src/features/blogs/components/blog-author.tsx`, `src/features/blogs/author.ts` |
| 12  | Function scheduler tên là `weeklyBlogPublish` nhưng cron thực tế đã đổi thành chạy **hàng ngày** (`40 0 * * *`) — comment/tên bị stale, dễ gây hiểu nhầm | `functions/src/index.ts`                                                        |

### 2.3. Gap trong hệ thống content

- **Không có trang category/tag** — filter category trên `/blog` chỉ chạy client-side, không có URL riêng, không thể index như trang chủ đề riêng biệt. Tag được lưu trong Firestore (`blogTags`, có `postCount`) nhưng **hoàn toàn không được dùng ở frontend**.
- **Không có pagination** trên `/blog` — trang blog fetch và render toàn bộ bài đã publish. Sẽ nặng dần khi số bài tăng lên như kế hoạch (72+ bài).
- **Related posts** chỉ match theo category, không có liên kết tự động đến `/solutions/*`, `/tools/*`, `/features/*` — trong khi đây là các "money page" cần internal link nhiều nhất.
- Không có content plan/migration script nào trong repo — toàn bộ 16 bài hiện tại nằm trong Firestore, không có version kiểm soát trong code.

### 2.4. Off-page: gần như bằng 0

- Không tìm thấy backlink, không tìm thấy directory listing (G2, Capterra, GetApp, Product Hunt...), không tìm thấy mention nào trên web cho "garixo" hoặc "garixo.com".
- Thị trường cạnh tranh rất đông: Shopmonkey, Tekmetric, Autodots, GarageHive, Workshop Software, Carsu, WinMotorCloud, Support Lane — hầu hết đã có domain authority cao hơn nhiều.

---

## 3. Mục tiêu & Mốc traffic theo tháng

SEO traffic không tăng tuyến tính — nó tăng chậm ở đầu (chờ Google index/crawl lại sau khi sửa kỹ thuật, chờ bài mới lên top 20-50) rồi tăng tốc khi nội dung + backlink bắt đầu cộng dồn hiệu ứng.

| Mốc      | Thời điểm  | Traffic mục tiêu | Động lực chính                                                                                 |
| -------- | ---------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| Baseline | 15/08/2026 | < 100/tháng      | —                                                                                              |
| Tháng 1  | 15/09/2026 | 120–150/tháng    | Fix kỹ thuật (Phase 0) được Google re-crawl, 16 bài cũ được tối ưu lại, submit lại sitemap     |
| Tháng 2  | 15/10/2026 | 220–280/tháng    | Bài mới theo lịch 2x/tuần bắt đầu được index, category pages ra mắt                            |
| Tháng 3  | 15/11/2026 | 380–450/tháng    | Bắt đầu có backlink đầu tiên từ outreach/directory, so sánh Garixo vs đối thủ lên top          |
| Tháng 4  | 15/12/2026 | 550–650/tháng    | Compound effect: bài cũ tăng rank, internal linking dày hơn, tool link-bait bắt đầu có traffic |
| Tháng 5  | 15/01/2027 | 750–850/tháng    | Backlink tích lũy đủ để domain authority tăng, long-tail keyword phủ rộng                      |
| Tháng 6  | 15/02/2027 | **1.000+/tháng** | Đủ khối lượng bài (~55-60 bài) + backlink + brand search tăng                                  |

**Lưu ý quan trọng:** đây là mục tiêu có điều kiện — phụ thuộc vào việc lịch publish thực sự được giữ đều đặn (xem mục 8 — Rủi ro). Ưu tiên **đều đặn hơn số lượng**: 2 bài/tuần giữ đều trong 6 tháng tốt hơn nhiều so với kế hoạch 3 bài/tuần đã publish dồn 16 bài trong 2 ngày rồi dừng.

---

## 4. Phase 0 (Tuần 1: 15–22/08/2026) — Technical SEO Fix Sprint

Đây là batch việc kỹ thuật đầu tiên, sẽ được Claude thực hiện trực tiếp trong phiên làm việc kế tiếp (theo lựa chọn thực thi bạn đã chọn). Ước tính: có thể hoàn thành trong 1 phiên làm việc.

**Nhóm A — Sửa lỗi (bug thật, không tranh cãi):** ✅ Hoàn thành 15/08/2026

- [x] Xoá `/about` bị duplicate trong `sitemap-static.xml`, giữ priority đúng (0.9) — đã bổ sung thêm `/privacy-policy`, `/term-of-services` đang thiếu trong sitemap
- [x] Sửa `lastmod` hardcode trong `sitemap.xml/route.ts` → bỏ field (không có nguồn dữ liệu tin cậy để tính động ở tầng index)
- [x] Sửa breadcrumb bug ở `about/page.tsx` (`name: 'Case Studies'` → `'About'`)
- [x] Thêm `BreadcrumbList` schema cho `blog/[slug]` và `case-studies/[slug]`
- [x] Thêm Twitter card metadata cho `features/page.tsx` và `blog/[slug]/page.tsx` (bổ sung luôn `case-studies/[slug]` — cùng gap, phát hiện khi sửa)
- [x] Đồng bộ brand casing `GARIXO` → `Garixo` trong title/description của `privacy-policy`, `term-of-services`, `case-studies` (index + detail + schema.org name)
- [x] Disallow `/auth/` trong `robots.ts`

**Nhóm B — E-E-A-T (ảnh hưởng trực tiếp đến ranking blog):** ✅ Hoàn thành 15/08/2026

- [x] Bỏ comment phần bio trong `blog-author.tsx`, hiển thị bio tác giả trên mỗi bài
- [x] Thêm avatar thật cho author — tái dùng `/images/steve-bang.jpg` (ảnh founder đã có sẵn, dùng trên trang About)

**Nhóm C — Nền tảng kỹ thuật (giảm nợ kỹ thuật, chuẩn bị scale):** ✅ Hoàn thành 15/08/2026

- [x] Centralize `metadataBase` vào root layout, xoá 19 chỗ lặp lại
- [x] Thêm `WebSite` schema site-wide (`src/components/SEO/WebsiteStructuredData.tsx`, mount ở root layout)
- [x] Đổi tên `weeklyBlogPublish` → `dailyBlogPublish` trong `functions/src/index.ts`, cập nhật comment + `README.md` + `functions/README.md` + `CLAUDE.md` cho khớp cron daily thực tế. **Lưu ý khi deploy:** đổi tên export tạo function MỚI, cần chạy `firebase functions:delete weeklyBlogPublish` sau khi deploy để xoá function cũ, tránh chạy trùng.

`npm run typecheck`, `npm run lint` (project root) và `npm run build` (functions/) đã chạy sạch sau các thay đổi trên — không có lỗi/warning mới trong các file đã sửa.

**Nhóm D — Cần hành động thủ công (ngoài code):**

- [ ] Verify Google Search Console (thêm verification tag vào metadata sau khi tạo property trên GSC — cần bạn tạo property trước)
- [ ] Kiểm tra GSC Performance report để biết baseline thật (impressions, clicks, avg position hiện tại) trước khi so sánh tiến độ
- [ ] Quyết định apex (`garixo.com`) vs `www.garixo.com` redirect ở tầng Firebase Hosting (`firebase.json`) — cần kiểm tra DNS/hosting config, không chỉ code

**Nhóm E — Xử lý cannibalization (nội dung, không phải code):**

- [ ] Sau khi có dữ liệu GSC, so sánh performance của `auto-repair-shop-losing-money` và `auto-repair-shop-losing-money-without-software` → merge nội dung tốt vào 1 bài, 301 redirect bài còn lại, cập nhật internal link trỏ về bài giữ lại

---

## 5. Content Calendar Reset

### 5.1. Audit 16 bài đã publish (so với kế hoạch gốc 72 bài)

| Slug đã publish                                    | Khớp với bài nào trong kế hoạch gốc | Ghi chú                                          |
| -------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| `garage-management-software-vs-spreadsheets`       | Bài 3                               | Khớp chính xác                                   |
| `auto-repair-shop-scheduling-software`             | Bài 4                               | Khớp chính xác                                   |
| `auto-repair-shop-appointment-no-shows`            | Bài 5                               | Khớp chính xác                                   |
| `auto-repair-shop-profit-margins`                  | Bài 10                              | Khớp chính xác                                   |
| `how-to-increase-auto-repair-shop-revenue`         | Bài 15                              | Khớp chính xác                                   |
| `digital-work-orders-auto-repair-shop`             | Bài 45                              | Khớp chính xác                                   |
| `best-garage-management-software-for-small-shops`  | Gần với Bài 43                      | Góc độ khác (roundup thay vì "best 2026")        |
| `auto-repair-shop-invoice-software`                | Gần với Bài 2                       | Góc độ khác (software thay vì template)          |
| `auto-repair-shop-inventory-management-software`   | Gần với Bài 6                       | Góc độ khác                                      |
| `what-is-garage-management-software`               | Không có trong 72 bài gốc           | Bài nền tảng tốt, nên giữ                        |
| `signs-auto-repair-shop-needs-management-software` | Không có trong 72 bài gốc           | Bonus, hợp lý                                    |
| `auto-repair-shop-kpis-every-owner-should-track`   | Không có trong 72 bài gốc           | Bonus, hợp lý                                    |
| `cost-of-paper-based-auto-repair-shop`             | Không có trong 72 bài gốc           | Overlap chủ đề với 2 bài "losing money" bên dưới |
| `unbilled-labor-auto-repair-shop`                  | Không có trong 72 bài gốc           | Bonus, hợp lý                                    |
| `auto-repair-shop-losing-money`                    | ⚠️ Cannibalize                      | Xem mục 4, Nhóm E                                |
| `auto-repair-shop-losing-money-without-software`   | ⚠️ Cannibalize                      | Xem mục 4, Nhóm E                                |

**Kết luận:** 6/72 bài kế hoạch gốc đã xong đúng, 4 bài làm với góc độ khác (không cần viết lại), 6 bài bonus hợp lý, 2 bài bị trùng cần merge. Không có bài nào bị lãng phí hoàn toàn.

### 5.2. Tần suất publish mới: 2 bài/tuần (Thứ Ba & Thứ Sáu)

Kế hoạch cũ đặt 3 bài/tuần và thất bại hoàn toàn trong việc giữ nhịp suốt 5 tháng. Giảm xuống 2 bài/tuần, ưu tiên **giữ đều đặn tuyệt đối** — đây là yếu tố Google đánh giá cao hơn khối lượng dồn cục.

- Từ 18/08/2026 → 15/02/2027: 26 tuần × 2 bài = tối đa 52 bài, nhưng **chỉ cần ~40 bài mới** để đạt mục tiêu (dư địa cho tuần nghỉ/trễ).
- Ưu tiên kéo lên trước (từ kế hoạch gốc, những bài có ký hiệu ⭐ ưu tiên cao nhất):
  1. **Tuần 1–2 sau Phase 0:** `Garixo Review 2026` (Bài 37 gốc) — chiếm SERP cho brand keyword ngay khi kỹ thuật đã sạch.
  2. **Tuần 3–4:** `Tekmetric vs Shopmonkey vs Garixo` (Bài 13) — conversion cao nhất toàn kế hoạch gốc.
  3. **Tuần 5–6:** `Garixo vs Shopmonkey` + `Garixo vs Tekmetric` (Bài 64, 65) — so sánh trực tiếp đối thủ.
  4. **Tuần 7–8:** `garage management software free trial` (Bài 41) — intent chuyển đổi cao nhất.
  5. Sau đó tiếp tục theo thứ tự ToFu → MoFu → BoFu như bảng keyword funnel trong `docs/blog-planning.md` (mục "Tổng Hợp Keyword Theo Funnel"), bỏ qua các bài đã publish ở mục 5.1.
- Mỗi bài bắt buộc: 1 internal link về `/pricing` hoặc `/features`, ít nhất 1 link về `/tools/*` (calculator) khi hợp lý, 3+ link đến bài blog liên quan.

### 5.3. Cải thiện kiến trúc content (song song, trong Tháng 1–2)

- [ ] Xây `/blog/category/[slug]` — trang category thật, có URL, meta, breadcrumb riêng
- [ ] Xây `/blog/tag/[slug]` — tận dụng dữ liệu tag đã có sẵn trong Firestore nhưng chưa dùng
- [ ] Thêm pagination cho `/blog` (server-side, tránh fetch toàn bộ bài)
- [ ] Cải thiện related-posts: thêm gợi ý link đến `/solutions/*`, `/tools/*` dựa trên category thay vì chỉ match category-to-category

---

## 6. Off-page / Xây dựng uy tín (chạy song song, liên tục)

Đây là track mà kế hoạch cũ **hoàn toàn thiếu** — chỉ có 1 dòng ghi chú ngắn gọn. Với content tốt nhưng zero backlink, đây là đòn bẩy lớn nhất bị bỏ trống.

- **Directory listings (Tháng 1):** đăng ký Garixo trên G2, Capterra, GetApp, Software Advice, SourceForge — đều miễn phí, là backlink chất lượng + traffic trực tiếp từ người đang tìm phần mềm.
- **Product Hunt launch (Tháng 1–2):** launch chính thức, tạo backlink + traffic spike + brand awareness cùng lúc.
- **Outreach đến roundup site (Tháng 2, sau khi có 20-30 bài):** liên hệ gitnux.org, zipdo.co, csiaccounting.com (đã xác định trong `docs/blog-planning.md`) để được nhắc đến trong bài "best garage management software" của họ — outreach dựa trên data/thống kê Garixo tự thu thập, không chỉ xin link suông.
- **Link-magnet content (Tháng 3):** bài "Auto Repair Industry Statistics 2026" (Bài 61 gốc) với dữ liệu thật — đầu tư nghiên cứu kỹ vì đây là bài có khả năng được trích dẫn tự nhiên cao nhất.
- **Community engagement (liên tục):** tham gia có giá trị (không spam) vào r/MechanicAdvice, r/AutoBody, Facebook groups cho garage owner — link về tool calculator khi thực sự hữu ích cho câu hỏi.
- **Tận dụng 2 tool đã có:** nhúng Labor Rate Calculator + Profit Calculator vào ít nhất 15 bài blog — đây là tài sản link-bait tự nhiên nhất đang bị bỏ phí.

---

## 7. Đo lường & Báo cáo

- **Setup (Phase 0):** verify Google Search Console, xác nhận GA4 đang chạy đúng (đã có sẵn trong code, chỉ cần confirm `NEXT_PUBLIC_GA_MEASUREMENT_ID` đã set đúng ở production).
- **Check-in hàng tháng**, theo dõi:
  - Tổng clicks + impressions (GSC) so với mốc ở mục 3
  - Số trang được index (GSC Coverage report) — mục tiêu: tất cả bài publish phải được index trong vòng 1 tuần
  - Vị trí trung bình cho danh sách keyword ưu tiên (bảng funnel trong `docs/blog-planning.md`)
  - Số referring domain mới (nếu có tool kiểm tra backlink)
  - Bài nào đang có traffic cao nhất → nhân bản chiến lược đó

---

## 8. Rủi ro & Giả định

- **Rủi ro lớn nhất: năng lực sản xuất content.** Đây chính xác là lý do kế hoạch cũ thất bại — viết kế hoạch dễ, giữ nhịp 6 tháng liên tục mới khó. Giảm xuống 2 bài/tuần là để giảm rủi ro này, nhưng vẫn cần cam kết thực tế từ người viết.
- **Thị trường cạnh tranh đông:** Shopmonkey, Tekmetric, Autodots và nhiều đối thủ khác đã có domain authority cao hơn — các từ khoá KD trung bình (30-45) sẽ khó rank hơn dự kiến ban đầu trong 6 tháng đầu.
- **Backlink tích luỹ chậm hơn content:** track off-page ở mục 6 cần thời gian dài hơn để có hiệu quả đo được — đừng kỳ vọng kết quả trong tháng 1-2, hiệu ứng rõ nhất từ tháng 3 trở đi.
- **Giả định:** không có thay đổi lớn về thuật toán Google trong giai đoạn này; domain không bị penalty kỹ thuật nào khác chưa phát hiện trong audit.

---

## 9. Bước tiếp theo

1. Duyệt kế hoạch này.
2. Bắt đầu **Phase 0** (mục 4) — Claude sẽ thực hiện các fix kỹ thuật trong phiên làm việc kế tiếp.
3. Setup Google Search Console (Nhóm D) — cần bạn thực hiện vì cần quyền truy cập domain/DNS.
4. Xác nhận người viết bài cho lịch 2 bài/tuần bắt đầu từ tuần sau Phase 0.
