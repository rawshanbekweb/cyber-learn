package handlers

import (
	"net/http"
	"strconv"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type StudentResponse struct {
	ID                      uint                      `json:"id"`
	Name                    string                    `json:"name"`
	Age                     int                       `json:"age"`
	Role                    models.Role               `json:"role"`
	DiagnosticScore         float64                   `json:"diagnosticScore"`
	Level                   models.Level              `json:"level"`
	FuzzyScore              float64                   `json:"fuzzyScore"`
	CompletedModulesCount   int                       `json:"completedModulesCount"`
	Speed                   float64                   `json:"speed"`
	Errors                  float64                   `json:"errors"`
	HasCompletedInitialTest bool                      `json:"hasCompletedInitialTest"`
	HasFuzzyResult          bool                      `json:"hasFuzzyResult"`
	LastFuzzyResult         *FuzzyResultPublic        `json:"lastFuzzyResult"`
	ModuleProgress          []ModuleProgressResponse  `json:"moduleProgress"`
}

type ModuleProgressResponse struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	Unlocked  bool    `json:"unlocked"`
	Completed bool    `json:"completed"`
	Score     float64 `json:"score"`
}

func buildStudentResponse(u models.User) StudentResponse {
	resp := StudentResponse{
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
		resp.LastFuzzyResult = &FuzzyResultPublic{
			Score: u.LastFuzzyScore,
			Level: u.LastFuzzyLevel,
			Rule1: u.LastFuzzyRule1,
			Rule2: u.LastFuzzyRule2,
			Rule3: u.LastFuzzyRule3,
		}
	}
	// Build module progress
	for _, mp := range u.ModuleProgresses {
		resp.ModuleProgress = append(resp.ModuleProgress, ModuleProgressResponse{
			ID:        mp.ModuleID,
			Title:     mp.Module.Title,
			Unlocked:  mp.Unlocked,
			Completed: mp.Completed,
			Score:     mp.Score,
		})
	}
	return resp
}

// GET /api/students — Teacher only
func GetStudents(c *gin.Context) {
	var users []models.User
	database.DB.
		Where("role = ?", models.RoleStudent).
		Preload("ModuleProgresses.Module").
		Find(&users)

	var result []StudentResponse
	for _, u := range users {
		result = append(result, buildStudentResponse(u))
	}
	if result == nil {
		result = []StudentResponse{}
	}
	c.JSON(http.StatusOK, result)
}

// GET /api/students/:id
func GetStudent(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	// Students can only view their own profile; teachers can view any
	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")
	if role != "Teacher" && userID.(uint) != uint(id) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Ruxsat yo'q"})
		return
	}

	var user models.User
	if err := database.DB.
		Where("role = ?", models.RoleStudent).
		Preload("ModuleProgresses.Module").
		First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "O'quvchi topilmadi"})
		return
	}

	c.JSON(http.StatusOK, buildStudentResponse(user))
}

// GET /api/students/me/progress — current student's module progress
func GetMyProgress(c *gin.Context) {
	userID, _ := c.Get("userID")

	var progresses []models.ModuleProgress
	database.DB.Where("user_id = ?", userID).Preload("Module").Order("module_id asc").Find(&progresses)

	var result []ModuleProgressResponse
	for _, mp := range progresses {
		result = append(result, ModuleProgressResponse{
			ID:        mp.ModuleID,
			Title:     mp.Module.Title,
			Unlocked:  mp.Unlocked,
			Completed: mp.Completed,
			Score:     mp.Score,
		})
	}
	if result == nil {
		result = []ModuleProgressResponse{}
	}
	c.JSON(http.StatusOK, result)
}
