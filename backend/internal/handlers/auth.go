package handlers

import (
	"net/http"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/middleware"
	"cyberai-backend/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Name     string `json:"name" binding:"required"`
	Password string `json:"password"`
	Role     string `json:"role" binding:"required,oneof=Student Teacher"`
}

type RegisterRequest struct {
	Name string `json:"name" binding:"required,min=2"`
	Age  int    `json:"age" binding:"required,min=5,max=100"`
}

type AuthResponse struct {
	Token string     `json:"token"`
	User  UserPublic `json:"user"`
}

type UserPublic struct {
	ID                      uint         `json:"id"`
	Name                    string       `json:"name"`
	Age                     int          `json:"age"`
	Role                    models.Role  `json:"role"`
	DiagnosticScore         float64      `json:"diagnosticScore"`
	Level                   models.Level `json:"level"`
	FuzzyScore              float64      `json:"fuzzyScore"`
	CompletedModulesCount   int          `json:"completedModulesCount"`
	Speed                   float64      `json:"speed"`
	Errors                  float64      `json:"errors"`
	HasCompletedInitialTest bool         `json:"hasCompletedInitialTest"`
	HasFuzzyResult          bool         `json:"hasFuzzyResult"`
	LastFuzzyResult         *FuzzyResultPublic `json:"lastFuzzyResult"`
}

type FuzzyResultPublic struct {
	Score float64      `json:"score"`
	Level models.Level `json:"level"`
	Rule1 float64      `json:"rule1"`
	Rule2 float64      `json:"rule2"`
	Rule3 float64      `json:"rule3"`
}

func userToPublic(u models.User) UserPublic {
	pub := UserPublic{
		ID:                      u.ID,
		Name:                    u.Name,
		Age:                     u.Age,
		Role:                    u.Role,
		DiagnosticScore:         u.DiagnosticScore,
		Level:                   u.Level,
		FuzzyScore:              u.FuzzyScore,
		CompletedModulesCount:   u.CompletedModulesCount,
		Speed:                   u.Speed,
		Errors:                  u.Errors,
		HasCompletedInitialTest: u.HasCompletedInitialTest,
		HasFuzzyResult:          u.HasFuzzyResult,
	}
	if u.HasFuzzyResult {
		pub.LastFuzzyResult = &FuzzyResultPublic{
			Score: u.LastFuzzyScore,
			Level: u.LastFuzzyLevel,
			Rule1: u.LastFuzzyRule1,
			Rule2: u.LastFuzzyRule2,
			Rule3: u.LastFuzzyRule3,
		}
	}
	return pub
}

// POST /api/auth/login
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if req.Role == "Teacher" {
		result := database.DB.Where("role = ? AND name = ?", models.RoleTeacher, req.Name).First(&user)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Login yoki parol noto'g'ri!"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Server xatosi"})
			}
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Login yoki parol noto'g'ri!"})
			return
		}
	} else {
		result := database.DB.Where("role = ? AND name = ?", models.RoleStudent, req.Name).First(&user)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Bunday o'quvchi topilmadi. Iltimos ro'yxatdan o'ting!"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Server xatosi"})
			}
			return
		}
	}

	token, err := middleware.GenerateToken(user.ID, user.Name, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token yaratishda xato"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  userToPublic(user),
	})
}

// POST /api/auth/register
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if name is already taken
	var existing models.User
	result := database.DB.Where("name = ?", req.Name).First(&existing)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Ushbu ismdagi foydalanuvchi allaqachon mavjud!"})
		return
	}

	newUser := models.User{
		Name:  req.Name,
		Age:   req.Age,
		Role:  models.RoleStudent,
		Level: models.LevelBeginner,
	}
	if err := database.DB.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Foydalanuvchi yaratishda xato"})
		return
	}

	// Create module progress entries (all locked except first)
	var modules []models.Module
	database.DB.Order("order_index asc").Find(&modules)
	for _, mod := range modules {
		mp := models.ModuleProgress{
			UserID:    newUser.ID,
			ModuleID:  mod.ID,
			Unlocked:  mod.OrderIndex == 1,
			Completed: false,
		}
		database.DB.Create(&mp)
	}

	token, err := middleware.GenerateToken(newUser.ID, newUser.Name, string(newUser.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token yaratishda xato"})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  userToPublic(newUser),
	})
}

// GET /api/auth/me
func Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
		return
	}
	c.JSON(http.StatusOK, userToPublic(user))
}
