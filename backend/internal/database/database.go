package database

import (
	"log"
	"math"
	"os"

	"cyberai-backend/internal/models"

	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "cyberai.db"
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
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
		&models.Assignment{},
		&models.AssignmentQuestion{},
		&models.FuzzyWeights{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	seed()
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
				Title:       "Tarmoq xavflari",
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

		for _, ds := range demoStudents {
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
				XP:                      len(ds.completedMods)*100 + int(math.Round(ds.fuzzyScore*100)),
			}
			DB.Create(&student)

			for _, mod := range modules {
				unlocked := false
				completed := false
				for _, cid := range ds.completedMods {
					if int(mod.ID) == cid {
						completed = true
						unlocked = true
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
				}
				DB.Create(&mp)
			}
		}
		log.Println("Seeded 3 demo students")
	}
}
