/* Sinh tự động từ db.json – dùng khi mở trang bằng file:// */
window.AGRI_SEED = {
  "users": [
    {
      "id": "u1",
      "name": "Nguyễn Văn An",
      "email": "sv@agri.vn",
      "role": "student",
      "class": "Nông nghiệp K67A",
      "phone": "0912 345 678",
      "studentCode": "67AG001",
      "active": true,
      "completedLessons": [
        "l1",
        "l2"
      ],
      "createdAt": "2026-01-08T08:00:00+07:00"
    },
    {
      "id": "u2",
      "name": "Trần Thị Bình",
      "email": "sv2@agri.vn",
      "role": "student",
      "class": "Nông nghiệp K67A",
      "phone": "0987 654 321",
      "studentCode": "67AG002",
      "active": true,
      "completedLessons": [
        "l1"
      ],
      "createdAt": "2026-01-08T08:10:00+07:00"
    },
    {
      "id": "u3",
      "name": "Lê Minh Cường",
      "email": "sv3@agri.vn",
      "role": "student",
      "class": "Nông nghiệp K67A",
      "phone": "0903 111 222",
      "studentCode": "67AG003",
      "active": true,
      "completedLessons": [],
      "createdAt": "2026-01-08T08:20:00+07:00"
    },
    {
      "id": "u4",
      "name": "ThS. Phạm Thu Hà",
      "email": "gv@agri.vn",
      "role": "teacher",
      "class": "Nông nghiệp K67A",
      "phone": "0904 222 333",
      "studentCode": "",
      "active": true,
      "completedLessons": [],
      "createdAt": "2026-01-02T07:30:00+07:00"
    },
    {
      "id": "u5",
      "name": "Trần Quốc Bảo",
      "email": "admin@agri.vn",
      "role": "admin",
      "class": "Phòng đào tạo",
      "phone": "0905 333 444",
      "studentCode": "",
      "active": true,
      "completedLessons": [],
      "createdAt": "2026-01-01T07:00:00+07:00"
    },
    {
      "id": "u6",
      "name": "Hoàng Thị Dung",
      "email": "sv4@agri.vn",
      "role": "student",
      "class": "Nông nghiệp K67B",
      "phone": "",
      "studentCode": "67AG004",
      "active": false,
      "completedLessons": [],
      "createdAt": "2026-02-11T09:00:00+07:00"
    }
  ],
  "crops": [
    {
      "id": "c1",
      "name": "Lúa",
      "scientificName": "Oryza sativa",
      "region": "Đồng bằng sông Hồng",
      "season": "Xuân–Hè",
      "status": "approved",
      "note": "Cây lương thực chủ lực, ưa nước, cần đất phù sa giàu dinh dưỡng.",
      "careStep": [
        {
          "step": 1,
          "title": "Chọn giống",
          "detail": "Chọn giống kháng đạo ôn, ngâm ủ 24–36 giờ trước khi gieo."
        },
        {
          "step": 2,
          "title": "Làm đất",
          "detail": "Cày bừa kỹ, san phẳng mặt ruộng, giữ mực nước 3–5 cm."
        },
        {
          "step": 3,
          "title": "Gieo cấy",
          "detail": "Mạ 15–18 ngày tuổi, cấy 2–3 dảnh/khóm, khoảng cách 20×20 cm."
        },
        {
          "step": 4,
          "title": "Bón phân",
          "detail": "Bón lót trước cấy, bón thúc đẻ nhánh và làm đòng."
        },
        {
          "step": 5,
          "title": "Thu hoạch",
          "detail": "Thu khi 85–90% hạt chín, phơi khô đạt ẩm 14%."
        }
      ]
    },
    {
      "id": "c2",
      "name": "Ngô",
      "scientificName": "Zea mays",
      "region": "Trung du miền núi phía Bắc",
      "season": "Thu–Đông",
      "status": "approved",
      "note": "Cây ngũ cốc quan trọng, thích hợp đất thoát nước tốt.",
      "careStep": [
        {
          "step": 1,
          "title": "Chọn giống",
          "detail": "Giống lai ngắn ngày, hạt đều, tỷ lệ nảy mầm trên 95%."
        },
        {
          "step": 2,
          "title": "Gieo hạt",
          "detail": "Gieo 2–3 hạt/hốc, khoảng cách 70×25 cm, lấp đất 3–4 cm."
        },
        {
          "step": 3,
          "title": "Chăm sóc",
          "detail": "Tỉa định mức 1 cây/hốc, làm cỏ và vun gốc 2 lần."
        },
        {
          "step": 4,
          "title": "Thu hoạch",
          "detail": "Thu khi lá bi bao phủ chuyển vàng, hạt cứng."
        }
      ]
    },
    {
      "id": "c3",
      "name": "Cà chua",
      "scientificName": "Solanum lycopersicum",
      "region": "Đồng bằng sông Hồng",
      "season": "Đông",
      "status": "approved",
      "note": "Cây rau ăn quả, nhạy cảm với độ ẩm và bệnh sương mai.",
      "careStep": [
        {
          "step": 1,
          "title": "Ươm cây con",
          "detail": "Gieo trong bầu, giữ ẩm, cây con 25–30 ngày tuổi."
        },
        {
          "step": 2,
          "title": "Trồng",
          "detail": "Trồng luống cao 25–30 cm, khoảng cách 60×45 cm."
        },
        {
          "step": 3,
          "title": "Làm giàn",
          "detail": "Cắm giàn chữ A, buộc thân bằng dây mềm."
        },
        {
          "step": 4,
          "title": "Tỉa nhánh",
          "detail": "Tỉa nhánh phụ, giữ 1–2 thân chính để tập trung dinh dưỡng."
        },
        {
          "step": 5,
          "title": "Thu hoạch",
          "detail": "Thu quả chín đỏ, cách 2–3 ngày/lứa."
        }
      ]
    },
    {
      "id": "c4",
      "name": "Cải bắp",
      "scientificName": "Brassica oleracea",
      "region": "Lâm Đồng",
      "season": "Đông–Xuân",
      "status": "approved",
      "note": "Rau ăn lá ưa lạnh, sinh trưởng tốt ở 15–22°C.",
      "careStep": [
        {
          "step": 1,
          "title": "Gieo hạt",
          "detail": "Gieo vườn ươm, tỉa cây con khi có 2–3 lá thật."
        },
        {
          "step": 2,
          "title": "Trồng cây con",
          "detail": "Trồng khoảng cách 40×40 cm, tưới đẫm sau trồng."
        },
        {
          "step": 3,
          "title": "Bón phân",
          "detail": "Bón thúc urê pha loãng 2 lần, kết hợp tưới nước."
        },
        {
          "step": 4,
          "title": "Thu hoạch",
          "detail": "Thu khi bắp cuốn chắc, khối lượng 1–1,5 kg/cây."
        }
      ]
    },
    {
      "id": "c5",
      "name": "Cam",
      "scientificName": "Citrus sinensis",
      "region": "Hà Giang",
      "season": "Thu–Đông",
      "status": "approved",
      "note": "Cây ăn quả lâu năm, cần đất tầng dày và thoát nước.",
      "careStep": [
        {
          "step": 1,
          "title": "Chọn giống",
          "detail": "Cây ghép 1–2 năm tuổi, bầu đất khỏe, sạch bệnh."
        },
        {
          "step": 2,
          "title": "Trồng",
          "detail": "Đào hố 60×60×60 cm, bón lót hữu cơ, trồng đầu mùa mưa."
        },
        {
          "step": 3,
          "title": "Tưới nước",
          "detail": "Tưới 20–30 lít/cây/lần, 2–3 lần/tháng mùa khô."
        },
        {
          "step": 4,
          "title": "Tỉa cành",
          "detail": "Tỉa cành khô, cành vượt, tạo tán cân đối."
        },
        {
          "step": 5,
          "title": "Thu hoạch",
          "detail": "Thu khi quả chuyển vàng đều, vỏ mỏng."
        }
      ]
    },
    {
      "id": "c6",
      "name": "Chè",
      "scientificName": "Camellia sinensis",
      "region": "Trung du miền núi phía Bắc",
      "season": "Quanh năm",
      "status": "approved",
      "note": "Cây công nghiệp dài ngày, thích hợp đất đồi chua nhẹ.",
      "careStep": [
        {
          "step": 1,
          "title": "Trồng",
          "detail": "Trồng trên đồi có mương thoát nước, mật độ 1,8 vạn cây/ha."
        },
        {
          "step": 2,
          "title": "Làm cỏ",
          "detail": "Làm cỏ 3–4 lần/năm, vun gốc giữ ẩm."
        },
        {
          "step": 3,
          "title": "Bón phân",
          "detail": "Bón hữu cơ + NPK theo lứa hái, chia 3–4 đợt/năm."
        },
        {
          "step": 4,
          "title": "Hái búp",
          "detail": "Hái 1 tôm 2 lá, chu kỳ 35–45 ngày/lứa."
        }
      ]
    },
    {
      "id": "c7",
      "name": "Dưa hấu",
      "scientificName": "Citrullus lanatus",
      "region": "Đồng bằng sông Cửu Long",
      "season": "Đông–Xuân",
      "status": "approved",
      "note": "Cây thân bò ngắn ngày, cần nắng và đất cát pha.",
      "careStep": [
        {
          "step": 1,
          "title": "Gieo hạt",
          "detail": "Ngâm ủ hạt 8–12 giờ, gieo thẳng hoặc bầu."
        },
        {
          "step": 2,
          "title": "Chăm sóc",
          "detail": "Tỉa nhánh phụ, giữ 2–3 dây chính/dây."
        },
        {
          "step": 3,
          "title": "Thụ phấn",
          "detail": "Thụ phấn bổ sung 6–9 giờ sáng khi hoa nở."
        },
        {
          "step": 4,
          "title": "Thu hoạch",
          "detail": "Thu sau thụ phấn 28–32 ngày, cuống teo."
        }
      ]
    }
  ],
  "seasons": [
    {
      "id": "s1",
      "cropId": "c1",
      "region": "Đồng bằng sông Hồng",
      "start": "2026-01-20",
      "ownerId": "u1",
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-01-20",
          "to": "2026-02-01"
        },
        {
          "phase": "cham-soc",
          "from": "2026-02-16",
          "to": "2026-04-30"
        },
        {
          "phase": "bon-phan",
          "from": "2026-03-01",
          "to": "2026-03-20"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-05-20",
          "to": "2026-06-10"
        }
      ]
    },
    {
      "id": "s2",
      "cropId": "c2",
      "region": "Trung du miền núi phía Bắc",
      "start": "2026-06-05",
      "ownerId": "u1",
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-06-05",
          "to": "2026-06-15"
        },
        {
          "phase": "cham-soc",
          "from": "2026-06-16",
          "to": "2026-08-20"
        },
        {
          "phase": "bon-phan",
          "from": "2026-07-01",
          "to": "2026-07-20"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-09-10",
          "to": "2026-09-28"
        }
      ]
    },
    {
      "id": "s3",
      "cropId": "c3",
      "region": "Đồng bằng sông Hồng",
      "start": "2026-09-10",
      "ownerId": "u2",
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-09-10",
          "to": "2026-09-25"
        },
        {
          "phase": "cham-soc",
          "from": "2026-10-05",
          "to": "2026-12-10"
        },
        {
          "phase": "bon-phan",
          "from": "2026-10-20",
          "to": "2026-11-10"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-12-15",
          "to": "2026-12-28"
        }
      ]
    },
    {
      "id": "s4",
      "cropId": "c4",
      "region": "Lâm Đồng",
      "start": "2026-08-01",
      "ownerId": "u1",
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-08-01",
          "to": "2026-08-12"
        },
        {
          "phase": "cham-soc",
          "from": "2026-08-20",
          "to": "2026-10-20"
        },
        {
          "phase": "bon-phan",
          "from": "2026-09-01",
          "to": "2026-09-18"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-11-01",
          "to": "2026-11-20"
        }
      ]
    },
    {
      "id": "s5",
      "cropId": "c5",
      "region": "Hà Giang",
      "start": "2026-02-15",
      "ownerId": "u2",
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-02-15",
          "to": "2026-03-05"
        },
        {
          "phase": "cham-soc",
          "from": "2026-03-10",
          "to": "2026-10-30"
        },
        {
          "phase": "bon-phan",
          "from": "2026-04-01",
          "to": "2026-05-01"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-11-10",
          "to": "2026-12-05"
        }
      ]
    },
    {
      "id": "s6",
      "cropId": "c6",
      "region": "Trung du miền núi phía Bắc",
      "start": "2026-02-01",
      "ownerId": null,
      "phases": [
        {
          "phase": "cay",
          "from": "2026-02-01",
          "to": "2026-03-10"
        },
        {
          "phase": "cham-soc",
          "from": "2026-03-11",
          "to": "2026-10-30"
        },
        {
          "phase": "bon-phan",
          "from": "2026-04-01",
          "to": "2026-04-25"
        },
        {
          "phase": "thu-hoach",
          "from": "2026-03-20",
          "to": "2026-11-20"
        }
      ]
    },
    {
      "id": "s7",
      "cropId": "c7",
      "region": "Đồng bằng sông Cửu Long",
      "start": "2026-11-15",
      "ownerId": null,
      "phases": [
        {
          "phase": "gieo",
          "from": "2026-11-15",
          "to": "2026-11-25"
        },
        {
          "phase": "cham-soc",
          "from": "2026-11-26",
          "to": "2027-01-20"
        },
        {
          "phase": "bon-phan",
          "from": "2026-12-05",
          "to": "2026-12-25"
        },
        {
          "phase": "thu-hoach",
          "from": "2027-02-01",
          "to": "2027-02-20"
        }
      ]
    }
  ],
  "lessons": [
    {
      "id": "l1",
      "title": "Quy trình trồng và chăm sóc cây lúa",
      "topic": "Trồng trọt",
      "durationMin": 25,
      "status": "published",
      "order": 1,
      "summary": "Từ chọn giống, làm đất, gieo cấy đến bón phân và thu hoạch lúa vụ Xuân–Hè.",
      "content": "<p>Lúa là cây trồng chủ lực của đồng bằng sông Hồng. Một vụ lúa đạt năng suất cao cần chuẩn bị đất kỹ, giống sạch bệnh và lịch bón phân hợp lý.</p><h3>1. Chuẩn bị giống</h3><p>Chọn giống có nguồn gốc rõ ràng, tỷ lệ nảy mầm trên 90%. Ngâm hạt 24–36 giờ, ủ ấm đến khi nứt nanh rồi mới gieo.</p><h3>2. Làm đất và cấy</h3><p>Cày bừa kỹ, san phẳng mặt ruộng, giữ mực nước 3–5 cm. Mạ 15–18 ngày tuổi được cấy 2–3 dảnh/khóm với khoảng cách 20×20 cm.</p><h3>3. Bón phân</h3><ul><li>Bón lót: phân chuồng hoai + lân trước khi cấy.</li><li>Bón thúc đẻ nhánh: đạm + kali khi lúa bén rễ hồi xanh.</li><li>Bón đón đòng: kali + đạm nhẹ trước trỗ 15–20 ngày.</li></ul><h3>4. Quản lý nước và sâu bệnh</h3><p>Giữ nước nông, rút cạn phơi ruộng 5–7 ngày trước thu hoạch. Theo dõi rầy nâu, sâu cuốn lá và bệnh đạo ôn theo tuần.</p><h3>5. Thu hoạch</h3><p>Thu khi 85–90% hạt chín, phơi khô đạt độ ẩm 14% trước khi bảo quản.</p>",
      "createdBy": "u4",
      "updatedAt": "2026-02-02T09:00:00+07:00"
    },
    {
      "id": "l2",
      "title": "Phòng trừ sâu cuốn lá và rầy nâu",
      "topic": "Sâu bệnh",
      "durationMin": 20,
      "status": "published",
      "order": 2,
      "summary": "Nhận diện triệu chứng, mức thiệt hại và biện pháp phòng trừ tổng hợp trên lúa.",
      "content": "<p>Sâu cuốn lá nhỏ và rầy nâu là hai đối tượng gây hại phổ biến trên lúa. Nhận diện sớm giúp giảm chi phí phun thuốc và hạn chế thiệt hại.</p><h3>Sâu cuốn lá nhỏ</h3><p>Triệu chứng: lá bị cắt, quăn lại thành ống, có ổ sâu non bên trong. Kiểm tra ổ sâu vào sáng sớm.</p><h3>Rầy nâu</h3><p>Triệu chứng: cây lùn, lá vàng, ruộng cháy thành từng đám. Rầy tập trung quanh gốc lúa.</p><h3>Biện pháp phòng trừ tổng hợp</h3><ul><li>Thăm đồng 2 lần/tuần, ghi nhật ký mật độ sâu rầy.</li><li>Giữ mực nước hợp lý, tránh bón đạm quá cao.</li><li>Chỉ phun thuốc khi mật độ vượt ngưỡng kinh tế.</li><li>Ưu tiên thuốc sinh học, luân phiên hoạt chất.</li></ul>",
      "createdBy": "u4",
      "updatedAt": "2026-02-10T09:00:00+07:00"
    },
    {
      "id": "l3",
      "title": "Kỹ thuật trồng cà chua vụ Đông",
      "topic": "Trồng trọt",
      "durationMin": 22,
      "status": "published",
      "order": 3,
      "summary": "Ươm cây con, trồng luống cao, làm giàn và quản lý bệnh sương mai trên cà chua.",
      "content": "<p>Cà chua vụ Đông cho năng suất cao nếu cây con khỏe và luống thoát nước tốt.</p><h3>Ươm và trồng</h3><p>Gieo trong bầu, giữ ẩm, cây con 25–30 ngày tuổi. Trồng luống cao 25–30 cm, khoảng cách 60×45 cm, tưới đẫm sau trồng.</p><h3>Chăm sóc</h3><p>Làm giàn chữ A, buộc thân bằng dây mềm. Tỉa nhánh phụ, giữ 1–2 thân chính. Bón thúc 3 đợt: sau trồng 10 ngày, khi ra hoa và khi quả nhỏ.</p><h3>Bệnh sương mai</h3><p>Đốm vàng trên mặt lá, mốc trắng mặt dưới. Phòng bằng luân canh, tỉa lá gốc và phun thuốc gốc đồng khi mưa kéo dài.</p>",
      "createdBy": "u4",
      "updatedAt": "2026-02-18T09:00:00+07:00"
    },
    {
      "id": "l4",
      "title": "Chăn nuôi gà thả vườn an toàn sinh học",
      "topic": "Chăn nuôi",
      "durationMin": 18,
      "status": "published",
      "order": 4,
      "summary": "Chuồng trại, mật độ, thức ăn và lịch vắc-xin cho gà thả vườn.",
      "content": "<p>Gà thả vườn tận dụng nguồn thức ăn tự nhiên, thịt chắc và được thị trường ưa chuộng.</p><h3>Chuồng trại</h3><p>Nền cao, thoát nước, mật độ 6–8 con/m² trong chuồng. Vườn thả có lưới B40 bao quanh, có mái che nhỏ.</p><h3>Thức ăn</h3><p>Giai đoạn 1–4 tuần: thức ăn hỗn hợp giàu đạm. Sau đó bổ sung rau xanh, thóc, ngô.</p><h3>Vắc-xin</h3><p>Newcastle lúc 7 ngày, Gumboro lúc 14 ngày, tụ huyết trùng lúc 35 ngày. Ghi chép lịch tiêm vào nhật ký trại.</p>",
      "createdBy": "u4",
      "updatedAt": "2026-02-25T09:00:00+07:00"
    },
    {
      "id": "l5",
      "title": "Bón phân cân đối cho cây ngô",
      "topic": "Trồng trọt",
      "durationMin": 15,
      "status": "published",
      "order": 5,
      "summary": "Liều lượng NPK và thời điểm bón cho ngô vụ Thu–Đông.",
      "content": "<p>Ngô cần đạm cao ở giai đoạn 4–8 lá và trước trỗ cờ. Bón cân đối giúp hạt chắc, giảm đổ ngã.</p><h3>Công thức tham khảo (1 ha)</h3><ul><li>Phân chuồng: 8–10 tấn.</li><li>Đạm: 180 kg N, chia 3 lần bón.</li><li>Lân: 80 kg P₂O₅ bón lót toàn bộ.</li><li>Kali: 100 kg K₂O, bón 50% lót + 50% trước trỗ.</li></ul><p>Bón cách gốc 10–15 cm, lấp đất để tránh bay hơi đạm.</p>",
      "createdBy": "u4",
      "updatedAt": "2026-03-02T09:00:00+07:00"
    },
    {
      "id": "l6",
      "title": "Giới thiệu nông nghiệp hữu cơ",
      "topic": "Trồng trọt",
      "durationMin": 20,
      "status": "draft",
      "order": 6,
      "summary": "Nguyên tắc canh tác hữu cơ, chứng nhận và lộ trình chuyển đổi.",
      "content": "<p>Bản nháp đang biên soạn: nguyên tắc 4 KHÔNG, quy trình chuyển đổi 24–36 tháng và tiêu chuẩn chứng nhận hữu cơ.</p>",
      "createdBy": "u4",
      "updatedAt": "2026-03-05T09:00:00+07:00"
    }
  ],
  "cropJournals": [
    {
      "id": "j1",
      "userId": "u1",
      "cropId": "c1",
      "seasonId": "s1",
      "date": "2026-02-16",
      "activity": "Bón thúc đẻ nhánh",
      "note": "Bón 25 kg urê cho 500 m², ruộng giữ nước 3 cm, lúa hồi xanh tốt.",
      "weather": "Nhiều mây, 22°C",
      "createdAt": "2026-02-16T17:00:00+07:00"
    },
    {
      "id": "j2",
      "userId": "u1",
      "cropId": "c1",
      "seasonId": "s1",
      "date": "2026-03-02",
      "activity": "Phun phòng đạo ôn",
      "note": "Phát hiện vài vết đạo ôn trên lá, phun thuốc gốc tricyclazole, cách ly 7 ngày.",
      "weather": "Mưa nhỏ, độ ẩm cao",
      "createdAt": "2026-03-02T16:30:00+07:00"
    },
    {
      "id": "j3",
      "userId": "u1",
      "cropId": "c1",
      "seasonId": "s1",
      "date": "2026-03-20",
      "activity": "Bón đón đòng",
      "note": "Bón 10 kg kali + 5 kg urê, rút nước phơi ruộng 3 ngày.",
      "weather": "Nắng, 26°C",
      "createdAt": "2026-03-20T18:10:00+07:00"
    },
    {
      "id": "j4",
      "userId": "u2",
      "cropId": "c1",
      "seasonId": "s1",
      "date": "2026-02-14",
      "activity": "Cấy lúa",
      "note": "Cấy giống J02, mật độ 20×20 cm, ruộng bằng phẳng.",
      "weather": "Âm u, 20°C",
      "createdAt": "2026-02-14T17:20:00+07:00"
    },
    {
      "id": "j5",
      "userId": "u1",
      "cropId": "c3",
      "seasonId": "s3",
      "date": "2026-10-20",
      "activity": "Tỉa nhánh và buộc giàn",
      "note": "Tỉa nhánh phụ đợt 1, buộc thân chính vào giàn chữ A, tỉa lá gốc cho thoáng.",
      "weather": "Nắng nhẹ, 24°C",
      "createdAt": "2026-10-20T16:00:00+07:00"
    },
    {
      "id": "j6",
      "userId": "u2",
      "cropId": "c5",
      "seasonId": "s5",
      "date": "2026-04-05",
      "activity": "Bón phân đợt 1",
      "note": "Bón 0,3 kg NPK/cây, kết hợp tưới 25 lít nước.",
      "weather": "Nắng ráo",
      "createdAt": "2026-04-05T15:40:00+07:00"
    }
  ],
  "pests": [
    {
      "id": "p1",
      "name": "Sâu cuốn lá nhỏ",
      "cropId": "c1",
      "symptoms": [
        "lá quăn",
        "lá bị cắt",
        "ổ sâu trên lá"
      ],
      "harmLevel": "cao",
      "remedy": "Phun thuốc sinh học Bt khi sâu non mới nở; ngắt ổ sâu thủ công; hạn chế đạm.",
      "status": "approved"
    },
    {
      "id": "p2",
      "name": "Rầy nâu",
      "cropId": "c1",
      "symptoms": [
        "cây lùn",
        "lá vàng",
        "cháy rầy"
      ],
      "harmLevel": "cao",
      "remedy": "Giữ mực nước hợp lý, phun thuốc đặc trị rầy, luân phiên hoạt chất để tránh kháng thuốc.",
      "status": "approved"
    },
    {
      "id": "p3",
      "name": "Bệnh đạo ôn",
      "cropId": "c1",
      "symptoms": [
        "đốm lá hình mắt én",
        "cổ lá thối",
        "đốm nâu trên lá"
      ],
      "harmLevel": "cao",
      "remedy": "Phun tricyclazole khi mới xuất hiện; bón cân đối đạm–kali; dùng giống kháng bệnh.",
      "status": "approved"
    },
    {
      "id": "p4",
      "name": "Sâu keo mùa thu",
      "cropId": "c2",
      "symptoms": [
        "lá bị ăn khuyết",
        "phân sâu trên ngọn",
        "lá non bị cạp"
      ],
      "harmLevel": "trung bình",
      "remedy": "Bắt sâu thủ công, dùng bẫy pheromone, phun thuốc khi mật độ trên 4 con/m².",
      "status": "approved"
    },
    {
      "id": "p5",
      "name": "Bệnh sương mai",
      "cropId": "c3",
      "symptoms": [
        "đốm vàng trên lá",
        "mốc trắng mặt dưới lá",
        "lá khô cháy"
      ],
      "harmLevel": "cao",
      "remedy": "Tỉa lá gốc thoáng, luân canh, phun thuốc gốc đồng hoặc metalaxyl khi trời ẩm kéo dài.",
      "status": "approved"
    },
    {
      "id": "p6",
      "name": "Nhện đỏ",
      "cropId": "c3",
      "symptoms": [
        "lá vàng lấm tấm",
        "tơ mịn mặt dưới lá",
        "lá rụng sớm"
      ],
      "harmLevel": "trung bình",
      "remedy": "Tưới phun sương tăng ẩm, phun thuốc chuyên nhện, tránh lạm dụng thuốc trừ sâu phổ rộng.",
      "status": "approved"
    },
    {
      "id": "p7",
      "name": "Bọ nhảy",
      "cropId": "c4",
      "symptoms": [
        "lá thủng lỗ nhỏ",
        "lá non bị cạp"
      ],
      "harmLevel": "thấp",
      "remedy": "Dùng bẫy dính vàng, phủ lưới màn, phun thuốc sinh học khi mật độ cao.",
      "status": "pending"
    },
    {
      "id": "p8",
      "name": "Bệnh chùn ngọn cam",
      "cropId": "c5",
      "symptoms": [
        "ngọn chùn",
        "lá nhỏ",
        "quả méo"
      ],
      "harmLevel": "cao",
      "remedy": "Loại cây bệnh, diệt rầy chổng cánh phòng lây lan, dùng cây giống sạch bệnh.",
      "status": "pending"
    }
  ],
  "exercises": [
    {
      "id": "e1",
      "title": "Chẩn đoán ruộng lúa bị vàng lá, cháy từng đám",
      "cropId": "c1",
      "level": "Cơ bản",
      "status": "published",
      "steps": [
        {
          "q": "Triệu chứng chính trên ruộng là gì?",
          "options": [
            "Lá bị cắt thành ổ",
            "Cây lùn, lá vàng, cháy thành đám",
            "Đốm lá hình mắt én",
            "Thân bị đục rỗng"
          ],
          "answer": 1,
          "explain": "Cây lùn, lá vàng và cháy rầy thành đám là bộ triệu chứng điển hình của rầy nâu."
        },
        {
          "q": "Tác nhân gây hại phù hợp nhất?",
          "options": [
            "Sâu cuốn lá nhỏ",
            "Bệnh đạo ôn",
            "Rầy nâu",
            "Sâu keo mùa thu"
          ],
          "answer": 2,
          "explain": "Rầy nâu chích hút nhựa cây, gây lùn, vàng lá và cháy rầy; rầy tập trung quanh gốc lúa."
        },
        {
          "q": "Biện pháp ưu tiên xử lý?",
          "options": [
            "Phun thuốc đặc trị rầy, luân phiên hoạt chất",
            "Bón thêm đạm để cây hồi phục",
            "Ngắt ổ sâu thủ công",
            "Rút cạn nước toàn bộ ruộng"
          ],
          "answer": 0,
          "explain": "Kiểm soát rầy bằng thuốc đặc trị và luân phiên hoạt chất; bón thêm đạm sẽ làm rầy phát triển mạnh hơn."
        }
      ]
    },
    {
      "id": "e2",
      "title": "Lá lúa quăn thành ống và bị cắt",
      "cropId": "c1",
      "level": "Cơ bản",
      "status": "published",
      "steps": [
        {
          "q": "Dấu hiệu nào giúp phân biệt với bệnh đạo ôn?",
          "options": [
            "Có ổ sâu non trong lá cuốn",
            "Xuất hiện đốm hình mắt én",
            "Cổ lá bị thối đen",
            "Hạt lúa bị lép"
          ],
          "answer": 0,
          "explain": "Sâu cuốn lá tạo ổ sâu trong lá cuốn; đạo ôn tạo đốm hình mắt én."
        },
        {
          "q": "Thời điểm kiểm tra ruộng hiệu quả nhất?",
          "options": [
            "Giữa trưa nắng",
            "Sáng sớm",
            "Chiều muộn sau mưa",
            "Ban đêm"
          ],
          "answer": 1,
          "explain": "Sáng sớm sâu non tập trung ở ổ, dễ phát hiện và xử lý."
        },
        {
          "q": "Biện pháp phù hợp với sâu non mới nở?",
          "options": [
            "Phun thuốc sinh học Bt",
            "Bón thêm phân đạm",
            "Phun thuốc trừ cỏ",
            "Tăng mực nước tối đa"
          ],
          "answer": 0,
          "explain": "Bt hiệu quả với sâu non mới nở và an toàn cho thiên địch."
        }
      ]
    },
    {
      "id": "e3",
      "title": "Cà chua có đốm vàng, mốc trắng dưới lá",
      "cropId": "c3",
      "level": "Trung bình",
      "status": "published",
      "steps": [
        {
          "q": "Đây là bệnh gì?",
          "options": [
            "Bệnh sương mai",
            "Bệnh đạo ôn",
            "Nhện đỏ",
            "Bọ nhảy"
          ],
          "answer": 0,
          "explain": "Đốm vàng mặt trên, mốc trắng mặt dưới lá là đặc trưng bệnh sương mai."
        },
        {
          "q": "Điều kiện nào làm bệnh phát triển mạnh?",
          "options": [
            "Trời khô nắng",
            "Độ ẩm cao, mưa kéo dài",
            "Nhiệt độ dưới 10°C",
            "Đất cát pha"
          ],
          "answer": 1,
          "explain": "Sương mai phát triển mạnh khi ẩm độ cao và mưa kéo dài."
        },
        {
          "q": "Phòng trừ tổng hợp nên ưu tiên?",
          "options": [
            "Tỉa lá gốc, luân canh, phun gốc đồng khi cần",
            "Bón thật nhiều đạm",
            "Tưới nước lên toàn bộ lá",
            "Phun thuốc trừ cỏ"
          ],
          "answer": 0,
          "explain": "Thoáng gốc, luân canh và thuốc gốc đồng giúp giảm nguồn bệnh."
        }
      ]
    }
  ],
  "submissions": [
    {
      "id": "sub1",
      "exerciseId": "e1",
      "userId": "u2",
      "answers": [
        1,
        2,
        0
      ],
      "score": 8,
      "status": "graded",
      "feedback": "Lập luận tốt ở bước 2, cần chú ý ngưỡng phun thuốc ở bước 3.",
      "submittedAt": "2026-03-08T10:20:00+07:00",
      "gradedAt": "2026-03-09T08:00:00+07:00"
    },
    {
      "id": "sub2",
      "exerciseId": "e1",
      "userId": "u3",
      "answers": [
        1,
        2,
        1
      ],
      "score": null,
      "status": "pending",
      "feedback": "",
      "submittedAt": "2026-03-10T14:05:00+07:00",
      "gradedAt": null
    },
    {
      "id": "sub3",
      "exerciseId": "e2",
      "userId": "u1",
      "answers": [
        0,
        1,
        0
      ],
      "score": null,
      "status": "pending",
      "feedback": "",
      "submittedAt": "2026-03-12T09:40:00+07:00",
      "gradedAt": null
    },
    {
      "id": "sub4",
      "exerciseId": "e2",
      "userId": "u2",
      "answers": [
        0,
        0,
        0
      ],
      "score": 7,
      "status": "graded",
      "feedback": "Sai bước 2, cần ghi nhớ thời điểm kiểm tra ruộng.",
      "submittedAt": "2026-03-11T16:10:00+07:00",
      "gradedAt": "2026-03-12T07:30:00+07:00"
    },
    {
      "id": "sub5",
      "exerciseId": "e3",
      "userId": "u3",
      "answers": [
        0,
        1,
        0
      ],
      "score": null,
      "status": "pending",
      "feedback": "",
      "submittedAt": "2026-03-13T11:15:00+07:00",
      "gradedAt": null
    }
  ],
  "diagnoses": [
    {
      "id": "d1",
      "userId": "u1",
      "cropId": "c1",
      "symptoms": [
        "lá vàng",
        "cháy rầy"
      ],
      "pestId": "p2",
      "confidence": 67,
      "createdAt": "2026-03-06T15:20:00+07:00"
    }
  ],
  "notifications": [
    {
      "id": "n1",
      "userId": null,
      "title": "Lịch gieo cấy vụ Xuân–Hè đã mở",
      "body": "Cập nhật lịch mùa vụ cho lúa tại Đồng bằng sông Hồng trước ngày 20/01/2026.",
      "type": "info",
      "read": false,
      "createdAt": "2026-01-10T08:00:00+07:00"
    },
    {
      "id": "n2",
      "userId": "u1",
      "title": "Bài tập chẩn đoán đang chờ chấm",
      "body": "Bài nộp 'Lá lúa quăn thành ống và bị cắt' đã được ghi nhận, giảng viên sẽ phản hồi sớm.",
      "type": "info",
      "read": false,
      "createdAt": "2026-03-12T09:45:00+07:00"
    },
    {
      "id": "n3",
      "userId": "u1",
      "title": "Cảnh báo sâu bệnh trên lúa",
      "body": "Theo dõi rầy nâu và đạo ôn trong tuần này, ghi nhật ký sau mỗi lần thăm đồng.",
      "type": "warning",
      "read": true,
      "createdAt": "2026-03-05T07:00:00+07:00"
    },
    {
      "id": "n4",
      "userId": "u4",
      "title": "3 bài nộp mới cần chấm",
      "body": "Vào trang Chấm bài để xem chi tiết và gửi phản hồi cho sinh viên.",
      "type": "warning",
      "read": false,
      "createdAt": "2026-03-13T11:20:00+07:00"
    },
    {
      "id": "n5",
      "userId": null,
      "title": "Thư viện sâu bệnh có hồ sơ chờ duyệt",
      "body": "Quản trị viên duyệt hồ sơ 'Bọ nhảy' và 'Bệnh chùn ngọn cam' trong mục Sâu bệnh.",
      "type": "info",
      "read": false,
      "createdAt": "2026-03-09T10:00:00+07:00"
    }
  ],
  "activities": [
    {
      "id": "a1",
      "text": "Nguyễn Văn An đăng ký lịch mùa vụ lúa vụ Xuân–Hè",
      "at": "2026-01-20T09:10:00+07:00"
    },
    {
      "id": "a2",
      "text": "ThS. Phạm Thu Hà xuất bản bài giảng 'Kỹ thuật trồng cà chua vụ Đông'",
      "at": "2026-02-18T09:00:00+07:00"
    },
    {
      "id": "a3",
      "text": "Trần Thị Bình nộp bài tập chẩn đoán rầy nâu",
      "at": "2026-03-08T10:20:00+07:00"
    },
    {
      "id": "a4",
      "text": "ThS. Phạm Thu Hà chấm bài cho Trần Thị Bình (8/10)",
      "at": "2026-03-09T08:00:00+07:00"
    },
    {
      "id": "a5",
      "text": "Hồ sơ sâu bệnh 'Bọ nhảy' được gửi duyệt",
      "at": "2026-03-09T10:00:00+07:00"
    },
    {
      "id": "a6",
      "text": "Lê Minh Cường nộp bài tập chẩn đoán",
      "at": "2026-03-13T11:15:00+07:00"
    }
  ]
};
