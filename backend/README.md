# CyberAI Platform — Backend

Go + Gin + GORM + SQLite asosida yozilgan REST API backend.

## Texnologiyalar

- **Go** 1.21+
- **Gin** — HTTP framework
- **GORM** — ORM
- **SQLite** — ma'lumotlar bazasi (`mattn/go-sqlite3`)
- **JWT** — autentifikatsiya (`golang-jwt/jwt/v5`)
- **bcrypt** — parol hashlash
- **CORS** — frontend bilan ishlash uchun

---

## Ishga tushirish

### Talablar

- Go 1.21 yoki yangi versiya
- GCC (go-sqlite3 CGO talab qiladi) — Linux/macOS da odatda o'rnatilgan

### O'rnatish va ishga tushirish

```bash
# Bog'liqliklarni yuklab olish
go mod download

# Ishga tushirish (dev mode)
go run main.go

# Yoki build qilib ishlatish
go build -o cyberai-server .
./cyberai-server
```

Server `http://localhost:8080` da ishlaydi.

---

## Muhit o'zgaruvchilari (Environment Variables)

| O'zgaruvchi | Standart qiymat | Tavsif |
|---|---|---|
| `PORT` | `8080` | Server porti |
| `DB_PATH` | `cyberai.db` | SQLite fayl yo'li |
| `JWT_SECRET` | `cyberai-secret-key-change-in-production` | JWT imzolash kaliti |
| `GIN_MODE` | `debug` | `debug` yoki `release` |
| `ALLOWED_ORIGIN` | — | Qo'shimcha CORS manzili |

**Muhim:** Production da `JWT_SECRET` ni o'zgartiring!

---

## Avtomatik seed ma'lumotlar

Server birinchi marta ishga tushganda quyidagilar avtomatik yaratiladi:

### O'qituvchi hisobi
| Login | Parol |
|---|---|
| `teacher` | `teacher123` |

### Demo o'quvchilar
| Ism | Daraja | Fuzzy Score |
|---|---|---|
| Davron Aliev | Beginner | 0.32 |
| Madina Karimova | Intermediate | 0.62 |
| Jasur Nematov | Advanced | 0.85 |

### Modullar
1. Kiberxavfsizlik asoslari
2. Tarmoq xavflari
3. Kriptografiya
4. Tizim himoyasi

---

## API Endpointlar

### Ochiq (autentifikatsiyasiz)

| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/health` | Server holati |
| `POST` | `/api/auth/login` | Kirish (o'quvchi yoki o'qituvchi) |
| `POST` | `/api/auth/register` | Yangi o'quvchi ro'yxatdan o'tish |

### Himoyalangan (JWT token talab qiladi)

**Header:** `Authorization: Bearer <token>`

#### Autentifikatsiya
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/auth/me` | Joriy foydalanuvchi ma'lumotlari |

#### O'quvchilar (faqat o'qituvchi)
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/students` | Barcha o'quvchilar ro'yxati |
| `GET` | `/api/students/:id` | O'quvchi ma'lumotlari |
| `GET` | `/api/students/me/progress` | O'z modul progressi |

#### Modullar
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/modules` | Barcha modullar (progress bilan) |
| `GET` | `/api/modules/:id` | Modul tafsilotlari |
| `POST` | `/api/modules/:id/complete` | Modulni yakunlash |

#### Baholash (Fuzzy)
| Method | Endpoint | Tavsif |
|---|---|---|
| `POST` | `/api/assessment/submit` | Dastlabki test natijasini yuborish |

**Body:**
```json
{
  "knowledge": 0.75,
  "errors": 0.2,
  "speed": 0.6
}
```

#### Darslar
| Method | Endpoint | Tavsif | Rol |
|---|---|---|---|
| `GET` | `/api/lessons` | Barcha darslar | Hammasi |
| `POST` | `/api/lessons` | Yangi dars qo'shish | Teacher |
| `DELETE` | `/api/lessons/:id` | Darsni o'chirish | Teacher |
| `POST` | `/api/lessons/:id/read` | Darsni o'qilgan deb belgilash | Student |

**Dars yaratish body:**
```json
{
  "title": "SQL Injection",
  "description": "SQL injection hujumlari haqida",
  "content": "SQL injection...",
  "category": "Tarmoq",
  "difficulty": "O'rta",
  "videoUrl": "https://youtube.com/...",
  "tags": ["sql", "injection", "web"]
}
```

#### Topshiriqlar
| Method | Endpoint | Tavsif | Rol |
|---|---|---|---|
| `GET` | `/api/assignments` | Topshiriqlar ro'yxati | Hammasi |
| `GET` | `/api/assignments/:id` | Topshiriq tafsilotlari | Hammasi |
| `POST` | `/api/assignments` | Yangi topshiriq | Teacher |
| `POST` | `/api/assignments/:id/complete` | Topshiriqni bajarish | Student |

**Topshiriq yaratish body:**
```json
{
  "title": "CIA Triadi testi",
  "description": "Asosiy tushunchalarni tekshirish",
  "studentId": 1,
  "targetModuleId": 1,
  "questions": [
    {
      "question": "CIA nimaning qisqartmasi?",
      "options": ["Maxfiylik, Butunlik, Mavjudlik", "Control, Integrity, Access", "Cyber, Information, Attack"],
      "correctAnswer": 0
    }
  ]
}
```

#### Analitika
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/analytics` | O'qituvchi: guruh tahlili; O'quvchi: shaxsiy tahlil |

#### Fuzzy og'irliklari (faqat o'qituvchi)
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/fuzzy-weights` | Joriy og'irliklar |
| `PUT` | `/api/fuzzy-weights` | Og'irliklarni yangilash |

**Yangilash body:**
```json
{
  "rule1Weight": 0.2,
  "rule2Weight": 0.5,
  "rule3Weight": 0.9,
  "beginnerThreshold": 0.4,
  "intermediateThreshold": 0.7
}
```

---

## Fuzzy Mantiq Algoritmi

Tizim uchta qoidaga asoslangan Mamdani fuzzy mantiq tizimidan foydalanadi:

```
rule1 = min(low(knowledge), high(errors))      -- Boshlang'ich daraja
rule2 = min(medium(knowledge), medium(speed))  -- O'rta daraja
rule3 = min(high(knowledge), low(errors))      -- Yuqori daraja

score = (rule1*w1 + rule2*w2 + rule3*w3) / (rule1 + rule2 + rule3 + 0.001)

Level:
  score < beginnerThreshold     → Beginner
  score < intermediateThreshold → Intermediate
  score ≥ intermediateThreshold → Advanced
```

---

## Loyiha tuzilmasi

```
cyberai-backend/
├── main.go                          # Asosiy entry point, routing
├── go.mod                           # Go module
├── go.sum                           # Bog'liqlik checksums
├── internal/
│   ├── database/
│   │   └── database.go              # GORM init + seed
│   ├── fuzzy/
│   │   └── engine.go                # Fuzzy mantiq algoritmi
│   ├── handlers/
│   │   ├── auth.go                  # Login, register, me
│   │   ├── students.go              # O'quvchilar
│   │   ├── modules.go               # Modullar va progress
│   │   ├── assessment.go            # Dastlabki test
│   │   ├── lessons.go               # Darslar
│   │   ├── assignments.go           # Topshiriqlar
│   │   ├── analytics.go             # Analitika
│   │   └── fuzzy.go                 # Fuzzy og'irliklari
│   ├── middleware/
│   │   └── auth.go                  # JWT auth middleware
│   └── models/
│       └── models.go                # GORM modellari
└── README.md
```

---

## Frontend bilan ulash

Frontend ning `.env` fayliga qo'shing:

```env
VITE_API_URL=http://localhost:8080
```

API chaqiruvlarida `Authorization: Bearer <token>` headerini yuborishni unutmang.

---

## Production ga joylashtirish

```bash
# Release mode da build
GIN_MODE=release go build -o cyberai-server .

# Muhit o'zgaruvchilari bilan ishga tushirish
JWT_SECRET=your-super-secret-key-here \
PORT=8080 \
DB_PATH=/data/cyberai.db \
GIN_MODE=release \
./cyberai-server
```
