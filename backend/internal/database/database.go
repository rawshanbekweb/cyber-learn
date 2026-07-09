package database

import (
	"log"
	"os"
	"strings"

	"cyberai-backend/internal/models"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "cyberai.db"
	}

	var dialector gorm.Dialector
	if strings.HasPrefix(dbPath, "postgres://") || strings.HasPrefix(dbPath, "postgresql://") {
		dialector = postgres.Open(dbPath)
	} else {
		dialector = sqlite.Open(dbPath)
	}

	var err error
	DB, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.Module{},
		&models.ModuleProgress{},
		&models.Lesson{},
		&models.LessonRead{},
		&models.UploadedFile{},
		&models.Assignment{},
		&models.AssignmentQuestion{},
		&models.FuzzyWeights{},
		&models.Certificate{},
		&models.CTFChallenge{},
		&models.CTFSolve{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	backfillLegacyAssignmentBatches()
	seed()
}

// backfillLegacyAssignmentBatches assigns a shared BatchID to "hamma
// o'quvchilar" (all-students) assignment rows created before the BatchID
// column existed, so CreateAssignment/Register can treat them as one
// broadcast batch (see Register in handlers/auth.go). It infers batches
// using the same identity the frontend already groups cards by — one-time
// and idempotent: rows that already have a BatchID are skipped.
func backfillLegacyAssignmentBatches() {
	var rows []models.Assignment
	DB.Where("batch_id IS NULL OR batch_id = ''").Order("created_at asc").Find(&rows)
	if len(rows) == 0 {
		return
	}

	type groupKey struct {
		title       string
		description string
		moduleID    uint
		aType       models.AssignmentType
		day         string
	}
	groups := make(map[groupKey][]uint)
	for _, a := range rows {
		k := groupKey{a.Title, a.Description, a.TargetModuleID, a.AssignmentType, a.DateAssigned.Format("2006-01-02")}
		groups[k] = append(groups[k], a.ID)
	}

	for _, ids := range groups {
		if len(ids) < 2 {
			continue // targeted at a single student, not a broadcast batch
		}
		DB.Model(&models.Assignment{}).Where("id IN ?", ids).Update("batch_id", uuid.NewString())
	}
}

func seed() {
	// Seed teacher account
	var teacherCount int64
	DB.Model(&models.User{}).Where("role = ?", models.RoleTeacher).Count(&teacherCount)
	if teacherCount == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("teacher123"), bcrypt.DefaultCost)
		teacher := models.User{
			Name:     "teacher",
			Age:      35,
			Role:     models.RoleTeacher,
			Password: string(hash),
		}
		DB.Create(&teacher)
		log.Println("Seeded teacher account: teacher / teacher123")
	}

	// Seed modules
	var moduleCount int64
	DB.Model(&models.Module{}).Count(&moduleCount)
	if moduleCount == 0 {
		modules := []models.Module{
			{
				Title:       "Kiberxavfsizlik asoslari",
				OrderIndex:  1,
				Description: "Kiberxavfsizlikning asosiy tamoyillari: CIA triad, tahdidlarni modellashtirish va himoya qatlamlari.",
				Content:     "Kiberxavfsizlik tizimlar, tarmoqlar va ilovalarni raqamli hujumlardan himoya qilish amaliyotidir. CIA Triadi — Maxfiylik, Butunlik va Mavjudlik — barcha xavfsizlik printsiplarining asosini tashkil etadi. Maxfiylik faqat ruxsat etilgan tomonlarga ma'lumotga kirishga imkon beradi. Butunlik ma'lumotning o'zgarmasligini ta'minlaydi. Mavjudlik esa tizimlarning kerak paytda ishlashini kafolatlaydi.",
			},
			{
				Title:       "Tarmoq xavsizligi",
				OrderIndex:  2,
				Description: "Tarmoq hujumlarini - Man-in-the-Middle, DDoS va paket ushlashni aniqlash va qarshi turish.",
				Content:     "Tarmoq hujumlari turli xil shakllarda kelishi mumkin. Man-in-the-Middle (MitM) hujumida tajovuzkor ikki tomon o'rtasidagi aloqani ushlaydi. DDoS hujumi tizimni haddan tashqari ko'p so'rovlar bilan yuklab, uni foydalanib bo'lmaydigan holga keltiradi.",
			},
			{
				Title:       "Kriptografiya",
				OrderIndex:  3,
				Description: "Simmetrik/asimmetrik shifrlash va hash algoritmlari orqali xavfsiz aloqa.",
				Content:     "Kriptografiya ma'lumotni shifrlash va maxfiy saqlash fani. Simmetrik shifrlashda bir xil kalit ishlatiladi. Asimmetrik shifrlashda ochiq va yopiq kalit juftligi ishlatiladi. Hash funksiyalar ma'lumot yaxlitligini tekshirishda ishlatiladi.",
			},
			{
				Title:       "Tizim himoyasi",
				OrderIndex:  4,
				Description: "Endpoint xavfsizligi, kirish nazorati, ko'p faktorli autentifikatsiya va SIEM monitoring.",
				Content:     "Tizim himoyasi endpoint xavfsizligini, kirish nazoratini va monitoring tizimlarini o'z ichiga oladi. Ko'p faktorli autentifikatsiya (MFA) kirish xavfsizligini oshiradi. SIEM tizimlari xavfsizlik hodisalarini real vaqtda kuzatib boradi.",
			},
		}
		DB.Create(&modules)
		log.Println("Seeded 4 modules")
	}

	// Rename existing "Tarmoq xavflari" module (old title) to "Tarmoq xavsizligi" for already-seeded databases
	DB.Model(&models.Module{}).Where("title = ?", "Tarmoq xavflari").Update("title", "Tarmoq xavsizligi")

	// Seed fuzzy weights
	var fwCount int64
	DB.Model(&models.FuzzyWeights{}).Count(&fwCount)
	if fwCount == 0 {
		fw := models.FuzzyWeights{
			Rule1Weight:           0.2,
			Rule2Weight:           0.5,
			Rule3Weight:           0.9,
			BeginnerThreshold:     0.4,
			IntermediateThreshold: 0.7,
		}
		DB.Create(&fw)
		log.Println("Seeded fuzzy weights")
	}

	// Seed demo students
	var studentCount int64
	DB.Model(&models.User{}).Where("role = ?", models.RoleStudent).Count(&studentCount)
	if studentCount == 0 {
		var modules []models.Module
		DB.Order("order_index asc").Find(&modules)

		// moduleScores[studentIdx][moduleOrderIndex] = score (0.0–1.0)
		// Only completed modules get a non-zero score.
		moduleScores := []map[int]float64{
			// Davron — faqat 1-modulni tugatgan, 78%
			{1: 0.78},
			// Madina — 1 va 2-modulni tugatgan
			{1: 0.82, 2: 0.75},
			// Jasur — barcha 4 ta modulni tugatgan
			{1: 0.91, 2: 0.88, 3: 0.85, 4: 0.95},
		}

		demoStudents := []struct {
			name            string
			age             int
			diagnosticScore float64
			level           models.Level
			fuzzyScore      float64
			speed           float64
			errors          float64
			completedMods   []int
		}{
			{
				name: "Davron Aliev", age: 20,
				diagnosticScore: 0.35, level: models.LevelBeginner, fuzzyScore: 0.32,
				speed: 0.7, errors: 0.6, completedMods: []int{1},
			},
			{
				name: "Madina Karimova", age: 21,
				diagnosticScore: 0.65, level: models.LevelIntermediate, fuzzyScore: 0.62,
				speed: 0.4, errors: 0.3, completedMods: []int{1, 2},
			},
			{
				name: "Jasur Nematov", age: 22,
				diagnosticScore: 0.88, level: models.LevelAdvanced, fuzzyScore: 0.85,
				speed: 0.2, errors: 0.1, completedMods: []int{1, 2, 3, 4},
			},
		}

		for si, ds := range demoStudents {
			// XP: 30 (diagnostic bonus) + 50*orderIndex per completed module
			xp := 30
			for _, cid := range ds.completedMods {
				xp += 50 * cid
			}

			student := models.User{
				Name:                    ds.name,
				Age:                     ds.age,
				Role:                    models.RoleStudent,
				DiagnosticScore:         ds.diagnosticScore,
				Level:                   ds.level,
				FuzzyScore:              ds.fuzzyScore,
				CompletedModulesCount:   len(ds.completedMods),
				Speed:                   ds.speed,
				Errors:                  ds.errors,
				HasCompletedInitialTest: true,
				LastFuzzyScore:          ds.fuzzyScore,
				LastFuzzyLevel:          ds.level,
				HasFuzzyResult:          true,
				XP:                      xp,
			}
			DB.Create(&student)

			scores := moduleScores[si]
			for _, mod := range modules {
				unlocked := false
				completed := false
				score := 0.0
				for _, cid := range ds.completedMods {
					if int(mod.ID) == cid {
						completed = true
						unlocked = true
						score = scores[mod.OrderIndex] // real ball
						break
					}
				}
				if !unlocked {
					switch ds.level {
					case models.LevelBeginner:
						unlocked = mod.OrderIndex == 1
					case models.LevelIntermediate:
						unlocked = mod.OrderIndex <= 2
					case models.LevelAdvanced:
						unlocked = true
					}
				}
				mp := models.ModuleProgress{
					UserID:    student.ID,
					ModuleID:  mod.ID,
					Unlocked:  unlocked,
					Completed: completed,
					Score:     score,
				}
				DB.Create(&mp)
			}
		}
		log.Println("Seeded 3 demo students with module scores")
	}

	seedCTFChallenges()
}

func seedCTFChallenges() {
	var ctfCount int64
	DB.Model(&models.CTFChallenge{}).Count(&ctfCount)
	if ctfCount > 0 {
		return
	}

	var modules []models.Module
	DB.Order("order_index asc").Find(&modules)
	if len(modules) < 4 {
		return
	}

	defaults := []struct {
		title       string
		description string
		difficulty  models.CTFDifficulty
		points      int
		hint        string
		flag        string
	}{
		{
			title:       "Yashirin xabar",
			description: "Terminalga tushib qolgan quyidagi qator Base64 formatida kodlangan: `Y3liZXJhaXtoNHNoX25lX3V6dW5fbmVfcWlzcWF9`. Uni dekodlab, ochiq matnni flag sifatida kiriting.",
			difficulty:  models.CTFDifficultyEasy,
			points:      50,
			hint:        "Base64 — bu shifrlash emas, kodlash usuli. `base64 -d` buyrug'i yoki onlayn dekoderdan foydalaning.",
			flag:        "cyberai{h4sh_ne_uzun_ne_qisqa}",
		},
		{
			title:       "Ushlangan paket",
			description: "Tarmoq trafigini kuzatish paytida quyidagi hex (o'n oltilik) ketma-ketlik ushlandi: `637962657261697b6d616e5f6f72746164615f747572616d616e7d`. Buni matnga o'girib, flag'ni kiriting.",
			difficulty:  models.CTFDifficultyMedium,
			points:      75,
			hint:        "Har bir juft hex raqam bitta ASCII belgini bildiradi. Onlayn hex-to-text konverterdan foydalaning.",
			flag:        "cyberai{man_ortada_turaman}",
		},
		{
			title:       "Qadimiy shifr",
			description: "Yuliy Tsezar qo'llagan klassik shifr bilan yashiringan xabar: `plorenv{pnrfne_fuvsg_hpu}`. Har bir harf alifboda 13 pozitsiyaga siljitilgan. Asl matnni tiklab, flag sifatida kiriting.",
			difficulty:  models.CTFDifficultyMedium,
			points:      75,
			hint:        "Bu ROT13 — 13 pozitsiyaga siljitilgan Caesar shifri. Uni yana 13 pozitsiyaga siljitsangiz asl matn chiqadi.",
			flag:        "cyberai{caesar_shift_uch}",
		},
		{
			title:       "Konfiguratsiya sizishi",
			description: "Tizim konfiguratsiya faylidan quyidagi qator topildi: `637962657261697b656e675f6b616d5f68757175717d`. Bu qanday formatda ekanligini aniqlab, flag'ni tiklang.",
			difficulty:  models.CTFDifficultyHard,
			points:      100,
			hint:        "Avvalgi \"Ushlangan paket\" challenge'idagi usul bu yerda ham ishlaydi.",
			flag:        "cyberai{eng_kam_huquq}",
		},
	}

	for i, d := range defaults {
		hash, err := bcrypt.GenerateFromPassword([]byte(d.flag), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("CTF flag hash xatosi: %v", err)
			continue
		}
		DB.Create(&models.CTFChallenge{
			ModuleID:    modules[i].ID,
			Title:       d.title,
			Description: d.description,
			Difficulty:  d.difficulty,
			Points:      d.points,
			Hint:        d.hint,
			FlagHash:    string(hash),
		})
	}
	log.Println("Seeded 4 default CTF challenges")
}
