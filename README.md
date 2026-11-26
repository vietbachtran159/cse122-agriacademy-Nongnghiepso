# AgriAcademy — Hệ thống hỗ trợ giảng dạy và học tập môn Nông nghiệp

> Đồ án môn học CSE122 — Nhóm BTL-31
> Công nghệ: HTML5 + CSS3 + JavaScript thuần (không framework, không bước build)

---

## 1. Giới thiệu

AgriAcademy là website hỗ trợ dạy và học môn Nông nghiệp. Website **không yêu cầu đăng nhập**: mở trang là dùng được ngay, trên thanh điều hướng có bộ chọn **vai trò trải nghiệm** để chuyển giữa Khách / Sinh viên / Giảng viên / Quản trị viên. Lựa chọn được lưu trong trình duyệt cho lần mở sau.

| Vai trò | Mô tả | Cách truy cập |
| --- | --- | --- |
| **Khách** | Xem giới thiệu khóa học, thư viện cây trồng, hướng dẫn mùa vụ | Trang chủ, 3 trang giới thiệu hoặc chọn **Khách** trên thanh điều hướng |
| **Sinh viên** | Học bài giảng, lên lịch mùa vụ, ghi nhật ký cây trồng, chẩn đoán sâu bệnh, làm bài tập tình huống | Chọn **Sinh viên** trên thanh điều hướng (mặc định) |
| **Giảng viên** | Quản lý bài giảng, cây trồng, xây dựng bài tập, chấm bài | Chọn **Giảng viên** trên thanh điều hướng |
| **Quản trị viên** | Quản lý người dùng, duyệt thư viện sâu bệnh, theo dõi hệ thống | Chọn **Quản trị viên** trên thanh điều hướng |

Ba vai trò Sinh viên / Giảng viên / Quản trị dùng hồ sơ mẫu cố định trong `db.json` (`u1`, `u4`, `u5`); vai trò Khách không gắn hồ sơ. Tài khoản `sv4@agri.vn` đang bị khóa để minh hoạ trạng thái "Đang khóa" trong màn hình quản trị người dùng.

> Bốn phương thức truyền đạt kiến thức cốt lõi của đồ án:
> 1. **Lịch mùa vụ tương tác** — chọn cây trồng, kéo–thả giai đoạn canh tác trên lịch 12 tháng.
> 2. **Nhật ký cây trồng** — sinh viên ghi lại hoạt động chăm sóc theo từng ngày.
> 3. **Chẩn đoán sâu bệnh** — chọn cây + triệu chứng, hệ thống đối chiếu và đề xuất hướng xử lý.
> 4. **Bài tập có lời giải** — bài tập tình huống nhiều bước, chấm điểm tự động kèm giải thích.

---

## 2. Cấu trúc thư mục

```
agriacademy/
├─ index.html                 # Trang chủ (giới thiệu sản phẩm)
├─ db.json                    # Cơ sở dữ liệu mẫu (JSON Server shape)
├─ README.md                  # Tài liệu này
├─ assets/                    # Hình ảnh, icon tĩnh
├─ design/                    # Liên kết thiết kế (Figma)
│  └─ figma-link.txt
├─ docs/                      # Tài liệu đồ án
│  ├─ project-proposal.md
│  ├─ screen-list.md
│  ├─ team-assignment.md
│  └─ ai-usage-report.md
├─ css/
│  ├─ style.css               # Design system + layout + component chung
│  ├─ modules.css             # Style riêng cho các module nghiệp vụ
│  ├─ calendar.css            # Style cho lịch mùa vụ
│  └─ responsive.css          # Điểm ngắt responsive (drawer ≤ 980px)
├─ js/
│  ├─ api.js                  # Mock API đọc/ghi db.json qua localStorage
│  ├─ main.js                 # Tiện ích dùng chung, app shell, phân quyền
│  ├─ data/
│  │  └─ seed.js              # Dữ liệu mẫu nhúng sẵn (sinh từ db.json)
│  └─ modules/                # Mỗi trang một module JS tương ứng
│     ├─ landing.js           # Trang chủ
│     ├─ visitor.js           # 3 trang khách
│     ├─ dashboard.js         # Tổng quan 3 vai trò
│     ├─ lesson.js            # Học bài giảng
│     ├─ season-calendar.js   # Lịch mùa vụ
│     ├─ crop-journal.js      # Nhật ký cây trồng
│     ├─ pest-diagnose.js     # Chẩn đoán sâu bệnh
│     ├─ exercise.js          # Bài tập tình huống
│     ├─ manage.js            # Quản lý bài giảng / cây trồng / bài tập
│     ├─ grading.js           # Chấm bài
│     ├─ admin.js             # Quản trị người dùng & sâu bệnh
│     └─ account.js           # Hồ sơ, cài đặt, thông báo
└─ pages/                     # 22 trang chức năng (không gồm trang đăng nhập)
```

> Mã `pages/` gồm 22 tệp; cộng `index.html` là 23 màn hình trong danh sách màn hình của đồ án.

---

## 3. Cách chạy

### Cách 1 — Mở trực tiếp (nhanh nhất)
Mở `agriacademy/index.html` bằng trình duyệt.

> Dữ liệu mẫu được nhúng trong `js/data/seed.js` nên app **chạy được cả khi mở từ ổ đĩa (file://)**.
> Lần đầu chạy, dữ liệu được ghi vào `localStorage`; các lần sau ứng dụng đọc lại từ đó.

### Cách 2 — Chạy qua web server (khuyến nghị khi kiểm thử)
```bash
# Tại thư mục gốc dự án
npx http-server .
# hoặc
python -m http.server 8000
```
Mở `http://localhost:8000/agriacademy/`.

### Cách 3 — JSON Server (tuỳ chọn)
`db.json` có sẵn theo đúng định dạng JSON Server để nhóm có thể chuyển sang backend thật:
```bash
npx json-server --watch agriacademy/db.json --port 3000
```

### Khôi phục dữ liệu mẫu
Vào **Cài đặt → Khôi phục dữ liệu mẫu**, hoặc xoá các khoá `agriacademy.` trong DevTools (`agriacademy.db.v1` — dữ liệu, `agriacademy.role.v1` — vai trò đang chọn, `agriacademy.prefs.v1` — tùy chọn thông báo).

---

## 4. Luồng sử dụng chính

1. **Mở trang** `index.html` → bấm **Vào học ngay** hoặc chọn vai trò mong muốn. Vai trò mặc định là Sinh viên.
2. **Sinh viên**: xem Tổng quan → vào **Bài giảng** học từng bài (đánh dấu đã học) → mở **Lịch mùa vụ** kéo–thả giai đoạn cho cây của mình → ghi **Nhật ký cây trồng** → **Chẩn đoán sâu bệnh** → làm **Bài tập tình huống** (được chấm điểm tức thì kèm lời giải).
3. **Giảng viên**: xem **Tổng quan lớp** → quản lý **Bài giảng**, **Cây trồng**, **Bài tập** → vào **Chấm bài**, chấm điểm và nhận xét bài nộp của sinh viên.
4. **Quản trị viên**: xem **Tổng quan hệ thống** → quản lý **Người dùng** (thêm, sửa, khóa/mở khóa) → **Duyệt thư viện sâu bệnh** do giảng viên gửi.
5. **Chuyển vai trò**: dùng ô chọn trên thanh điều hướng (hoặc trong **Cài đặt → Vai trò trải nghiệm**). Trang hiện tại không thuộc quyền của vai trò mới sẽ tự chuyển về trang tổng quan phù hợp; mở trực tiếp một trang sai quyền sẽ hiện `pages/403.html` (riêng Khách được đưa về trang chủ).

---

## 5. Mô hình dữ liệu (`db.json`)

| Nhóm | Khoá | Ghi chú |
| --- | --- | --- |
| Người dùng | `users` | 6 tài khoản cho 3 vai trò + 1 tài khoản bị khóa |
| Cây trồng | `crops` | 7 loại cây, mỗi cây có các bước chăm sóc |
| Lịch mùa vụ | `seasons` | 7 lịch; mỗi lịch gồm nhiều `phases` (gieo, cây, chăm sóc, bón phân, thu hoạch) |
| Bài giảng | `lessons` | 6 bài, 1 bài ở trạng thái nháp |
| Nhật ký | `cropJournals` | Ghi chép hoạt động chăm sóc theo ngày |
| Sâu bệnh | `pests` | 8 kỹ thuật, 2 mục đang chờ duyệt |
| Bài tập | `exercises` | 3 bài, mỗi bài nhiều bước có lời giải |
| Bài nộp | `submissions` | Đã chấm + đang chờ chấm |
| Chẩn đoán | `diagnoses` | Lịch sử chẩn đoán của sinh viên |
| Thông báo | `notifications` | Thông báo hệ thống + thông báo cá nhân |
| Nhật ký hoạt động | `activities` | Dòng thời gian thao tác gần đây |

Quan hệ chính:
- `seasons.ownerId` → `users.id` (một sinh viên có thể có nhiều lịch).
- `cropJournals.seasonId` → `seasons.id`, `cropJournals.cropId` → `crops.id`.
- `submissions.exerciseId` → `exercises.id`, `submissions.studentId` → `users.id`.
- `notifications.userId` → `users.id` (`null` = thông báo toàn hệ thống).

---

## 6. Trạng thái giao diện được đáp ứng

Đồ án triển khai đầy đủ các trạng thái theo yêu cầu môn học:

| Trạng thái | Nơi thể hiện |
| --- | --- |
| **Đang tải** | Skeleton khi tải danh sách (bài giảng, sâu bệnh, người dùng) |
| **Rỗng** | Empty state kèm nút hành động (nhật ký trống, chưa có bài nộp…) |
| **Thành công** | Toast xanh + cập nhật dữ liệu tức thì |
| **Lỗi** | Toast đỏ + thông báo lỗi ngay dưới trường nhập |
| **Vô hiệu hóa** | Nút bị disable khi chưa đủ điều kiện (vd: chưa chọn đáp án) |
| **Đang chờ** | Badge vàng cho bài nộp / sâu bệnh chờ duyệt |
| **Bị từ chối** | Badge đỏ + lý do từ chối |
| **Hoàn thành** | Badge xanh cho bài đã chấm / mục đã duyệt |
| **Đã hủy / Lưu trữ** | Badge xám cho bản nháp và mục lưu trữ |

---

## 7. Kiểm thử nhanh (checklist)

- [ ] Đổi vai trò trên thanh điều hướng → giao diện và menu tự cập nhật, chuyển về đúng trang tổng quan.
- [ ] Vai trò Sinh viên mở `pages/admin-user-management.html` → chuyển hướng `403.html`.
- [ ] Vai trò Quản trị viên mở được mọi trang chức năng (kể cả trang của sinh viên/giảng viên).
- [ ] Vai trò Khách chỉ xem được 3 trang giới thiệu; mở trang sinh viên → quay về trang chủ.
- [ ] Vai trò được lưu sau khi tải lại trang; nút Khôi phục dữ liệu mẫu giữ nguyên vai trò.
- [ ] Lịch mùa vụ: kéo một giai đoạn sang tháng khác → lưu và tải lại vẫn giữ.
- [ ] Nhật ký: thêm/xoá mục → thống kê cập nhật.
- [ ] Chẩn đoán: chọn cây + triệu chứng → hiện kết quả phù hợp nhất.
- [ ] Bài tập: trả lời sai → hiện lời giải; nộp → có bản ghi "đang chờ".
- [ ] Giảng viên chấm bài nộp → sinh viên thấy điểm + nhận xét.
- [ ] Quản trị duyệt một mục sâu bệnh đang chờ → trạng thái chuyển "Hoàn thành".

---

## 8. Ghi chú kỹ thuật

- Toàn bộ nghiệp vụ chạy phía client, dữ liệu lưu ở `localStorage` — phù hợp đồ án front-end, dễ chuyển sang REST API thật.
- Không dùng thư viện ngoài ⇒ tải nhanh, không phụ thuộc CDN.
- App shell (`topbar`, `sidebar`, `footer`) được render động trong `js/main.js`, tự đổi menu theo vai trò.
- Không có đăng nhập/mật khẩu: vai trò trải nghiệm lưu ở `localStorage` và ánh xạ tới hồ sơ mẫu trong `db.json`.
- Vai trò **Khách** không gắn hồ sơ người dùng: chỉ xem trang công khai; mở trang chức năng sẽ được đưa về trang chủ.
- Menu responsive: ≤ 980px chuyển thành drawer mở bằng nút hamburger; ô chọn vai trò thu gọn trên màn hình nhỏ.
