---
name: blog-writer
description: Write a new SEO-optimized Garixo blog post as a ready-to-commit public/blog/<slug>.md file. Use when the user asks to write, draft, or add a blog post/article for the Garixo website.
---

# Garixo Blog Writer

Viết một bài blog mới cho garixo.com dưới dạng file `public/blog/<slug>.md`, đúng chuẩn kỹ thuật + SEO đã được audit và cố định trong session trước. Site **chỉ hỗ trợ nội dung Markdown thuần** — không HTML, không JSX trong body.

## Bối cảnh sản phẩm (bắt buộc đọc trước khi viết)

- **Đối tượng đọc (ICP):** chủ garage sửa xe độc lập ở Mỹ, 1–10 thợ, không rành kỹ thuật, nhạy cảm về giá. Không viết cho dealership/chuỗi lớn.
- **Giọng văn:** thực tế, cụ thể, có số liệu — không sáo rỗng kiểu AI (tránh các câu filler chung chung như "Customer trust and satisfaction are crucial to driving revenue..."). Viết như người hiểu nghề, không như brochure marketing.
- **Data layer:** `src/services/blog-content/blog-fs.ts` đọc toàn bộ `public/blog/*.md` bằng `gray-matter`. Không có CMS, không có Firestore — tạo file là xong, không cần gọi API nào.
- **Publish tự động theo ngày:** không cần cron/thao tác publish thủ công. `status: scheduled` + `scheduledAt` trong tương lai sẽ tự "published" khi ngày đó tới (nhờ `resolveEffectiveStatus()` chạy lại mỗi request). Bài AI viết nên để `status: draft` mặc định — chỉ đổi sang `scheduled`/`published` khi có người duyệt.

## Bước 1 — Chọn chủ đề, tránh trùng lặp

1. Đọc `docs/blog-planning.md` (kế hoạch từ khoá gốc, funnel ToFu/MoFu/BoFu) và `plan.md` (thứ tự ưu tiên đã resequence) để chọn chủ đề đúng chiến lược, trừ khi user đã chỉ định chủ đề cụ thể.
2. Chạy lệnh sau để xem toàn bộ title/category/focusKeyword hiện có, tránh cannibalize:
   ```bash
   grep -A1 "^title:\|^category:\|^focusKeyword:" public/blog/*.md
   ```
3. Nếu chủ đề mới có khả năng trùng ý định tìm kiếm với 1 bài đã có — hỏi lại user muốn tách góc độ thế nào, đừng tự ý viết bài trùng lặp thứ 3.

## Bước 2 — Frontmatter (bắt buộc đủ field, đúng kiểu dữ liệu)

Tham khảo type `BlogPost` tại `src/features/blogs/types.ts` và ví dụ thật bất kỳ trong `public/blog/*.md`. Schema:

```yaml
---
title: <tiêu đề đầy đủ, hấp dẫn, có thể dài hơn metaTitle>
slug: <kebab-case, trùng với tên file, không đổi sau khi publish>
excerpt: <2-3 câu tóm tắt, dùng làm mô tả preview trên trang /blog>
metaTitle: <30-60 ký tự, PHẢI là câu hoàn chỉnh, không bị cắt cụt>
metaDescription: <120-155 ký tự, PHẢI là câu hoàn chỉnh, chứa focusKeyword>
focusKeyword: <từ khoá chính, phải xuất hiện tự nhiên trong title/H1 và nội dung>
secondaryKeywords: <3-8 từ khoá phụ — KHÔNG quá 10, tránh nhồi nhét heading>
category: <dùng lại 1 trong các category hiện có, xem Bước 1>
tags: <5-10 tag ngắn, liên quan>
status: draft
schemaType: BlogPosting # hoặc HowTo/FAQ nếu format phù hợp hơn
ogTitle: <có thể giống hoặc khác metaTitle, tối ưu cho social share>
ogDescription: <tương tự metaDescription, dùng cho OG card>
ogImage: '' # để trống nếu chưa có ảnh — KHÔNG bịa URL. Hỏi user ảnh cover.
canonical: 'https://www.garixo.com/blog/<slug-CHÍNH-XÁC-của-file-này>'
isIndexed: true
faqItems:
  - question: <câu hỏi>
    answer: <câu trả lời — PHẢI khớp 100% với phần FAQ viết trong body, không được để trống nếu body có FAQ>
ctaBlock:
  title: <tiêu đề CTA>
  description: <mô tả ngắn>
  ctaLabel: <text nút, vd "Start Your Free Trial">
  ctaHref: 'https://www.garixo.com/pricing'
readingTime: <ước tính: số từ / 220, làm tròn lên>
createdAt: '<ISO 8601 UTC, thời điểm tạo — dùng ngày thật hôm nay>'
updatedAt: '<= createdAt khi mới tạo>'
publishedAt: null # để null cho tới khi thật sự publish
scheduledAt: null # hoặc ISO date nếu hẹn lịch
authorId: steve-bang
authorName: Steve Bang
---
```

**canonical phải khớp chính xác slug của file này** — đây là bug phổ biến nhất tìm thấy khi audit (nhiều bài trỏ sang 1 slug tưởng tượng không tồn tại). Không tự sáng tác URL khác.

## Bước 3 — Viết nội dung (body Markdown)

- **Mở bài:** trả lời thẳng câu hỏi/ý định tìm kiếm trong ~100 từ đầu tiên (dạng "Quick Answer" hoặc "Direct Answer") — tốt cho featured snippet và AI Overviews của Google.
- **Cấu trúc:** H2 cho từng luận điểm chính, H3 khi cần chia nhỏ. Heading phải đọc tự nhiên — không nhồi từ khoá phụ vào heading kiểu "**Auto shop operational waste** compounds the same way..." nghe gượng ép.
- **Độ dài:** 1.500–2.500 từ cho bài thường, 3.000+ từ cho bài pillar/so sánh sâu.
- **Số liệu/case study:** chỉ dùng số liệu có nguồn kiểm chứng được (link tới nguồn thật: BLS, ASA, NADA, khảo sát ngành...). Không bịa số liệu độc quyền kiểu "500+ shops onboarded" hay case study có tên/số cụ thể không xác minh được. Nếu không có nguồn thật, dùng ngôn ngữ định tính ("nhiều shop chúng tôi từng làm việc cùng...") thay vì số liệu giả-chính-xác.
- **Ảnh:** nếu chèn ảnh trong body, chỉ dùng URL ảnh thật do user cung cấp (Firebase Storage). **Không bao giờ** để lại placeholder kiểu `## *Image Suggestion: ...*` — đây là bug đã tìm thấy ở 7/23 bài cũ, hiển thị thật ra ngoài. Nếu chưa có ảnh, bỏ qua phần ảnh, không viết placeholder.
- **Kết bài:** có CTA rõ ràng (dùng `ctaBlock` ở frontmatter, không nhất thiết phải nhắc lại CTA trong body).

## Bước 4 — Internal linking (bắt buộc)

Mỗi bài phải có tối thiểu:

- **3 link tới bài blog khác đang tồn tại thật** (`https://www.garixo.com/blog/<slug-có-thật>`), chèn tự nhiên trong câu văn tại chỗ liên quan — không phải danh sách "related posts" khô khan ở cuối bài (trang đã tự động hiện related posts rồi, không cần lặp lại).
- **1 link tới `/pricing` hoặc `/features`**.

Trước khi hoàn tất, verify mọi slug được link tới đều có file thật:

```bash
node -e "
const fs = require('fs');
const valid = new Set(fs.readdirSync('public/blog').map(f => f.replace('.md','')));
const raw = fs.readFileSync('public/blog/<slug-bài-vừa-viết>.md', 'utf8');
[...raw.matchAll(/\]\(https:\/\/www\.garixo\.com\/blog\/([a-z0-9-]+)\)/g)].forEach(m => {
  if (!valid.has(m[1])) console.log('BROKEN LINK:', m[1]);
});
"
```

## Bước 5 — FAQ

Nếu bài có phần FAQ trong body (khuyến khích, tốt cho FAQPage schema), **bắt buộc** đồng bộ y hệt vào `faqItems` ở frontmatter. Đây là bug tìm thấy ở 2/23 bài cũ (FAQ viết trong body nhưng frontmatter để `[]`, mất schema).

## Bước 6 — Checklist verify trước khi báo hoàn thành

- [ ] `canonical` khớp chính xác slug file
- [ ] `metaTitle` 30–60 ký tự, câu hoàn chỉnh (không cắt cụt giữa từ)
- [ ] `metaDescription` 120–155 ký tự, câu hoàn chỉnh
- [ ] `faqItems` khớp với FAQ trong body (nếu có)
- [ ] Không còn placeholder ảnh/text nào trong body
- [ ] Đủ ≥3 internal link tới slug có thật + 1 link `/pricing` hoặc `/features`
- [ ] Không có số liệu/case study bịa không nguồn
- [ ] `status: draft` (trừ khi user yêu cầu khác)
- [ ] Parse thử bằng gray-matter không lỗi:
  ```bash
  node -e "const m=require('gray-matter'); const fs=require('fs'); m(fs.readFileSync('public/blog/<slug>.md','utf8')); console.log('OK')"
  ```
- [ ] `npm run typecheck` vẫn sạch (không đổi code, chỉ để chắc chắn)

## Sau khi viết xong

Báo lại cho user: chủ đề, slug, số từ, danh sách link nội bộ đã chèn, và **hỏi rõ ảnh cover (ogImage) + ảnh trong bài** vì AI không tự tạo/upload ảnh được — user cần cung cấp URL Firebase Storage hoặc tự upload qua Firebase Console rồi gửi link. Không tự commit/push trừ khi được yêu cầu riêng.
