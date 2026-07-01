package handlers

import (
	"net/http"
	"strconv"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /api/modules
func GetModules(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")

	var modules []models.Module
	database.DB.Order("order_index asc").Find(&modules)

	type ModuleWithProgress struct {
		ID          uint   `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Content     string `json:"content"`
		OrderIndex  int    `json:"orderIndex"`
		Unlocked    bool   `json:"unlocked"`
		Completed   bool   `json:"completed"`
	}

	var result []ModuleWithProgress
	for _, mod := range modules {
		mwp := ModuleWithProgress{
			ID:          mod.ID,
			Title:       mod.Title,
			Description: mod.Description,
			Content:     mod.Content,
			OrderIndex:  mod.OrderIndex,
			Unlocked:    role == "Teacher",
			Completed:   false,
		}

		if role == "Student" {
			var mp models.ModuleProgress
			if err := database.DB.Where("user_id = ? AND module_id = ?", userID, mod.ID).First(&mp).Error; err == nil {
				mwp.Unlocked = mp.Unlocked
				mwp.Completed = mp.Completed
			}
		}

		result = append(result, mwp)
	}

	if result == nil {
		result = []ModuleWithProgress{}
	}
	c.JSON(http.StatusOK, result)
}

// GET /api/modules/:id
func GetModule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	var mod models.Module
	if err := database.DB.First(&mod, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modul topilmadi"})
		return
	}

	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")

	unlocked := role == "Teacher"
	completed := false

	if role == "Student" {
		var mp models.ModuleProgress
		if err := database.DB.Where("user_id = ? AND module_id = ?", userID, id).First(&mp).Error; err == nil {
			unlocked = mp.Unlocked
			completed = mp.Completed
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          mod.ID,
		"title":       mod.Title,
		"description": mod.Description,
		"content":     mod.Content,
		"orderIndex":  mod.OrderIndex,
		"unlocked":    unlocked,
		"completed":   completed,
	})
}

// POST /api/modules/:id/complete — Student completes a module
func CompleteModule(c *gin.Context) {
	idStr := c.Param("id")
	moduleID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	userID, _ := c.Get("userID")

	var mp models.ModuleProgress
	result := database.DB.Where("user_id = ? AND module_id = ?", userID, moduleID).First(&mp)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modul topilmadi yoki sizga biriktirilmagan"})
		return
	}

	if !mp.Unlocked {
		c.JSON(http.StatusForbidden, gin.H{"error": "Bu modul hali ochilmagan"})
		return
	}

	if mp.Completed {
		c.JSON(http.StatusOK, gin.H{"message": "Modul allaqachon yakunlangan"})
		return
	}

	var currentMod models.Module
	database.DB.First(&currentMod, moduleID)

	// Mark as completed
	database.DB.Model(&mp).Update("completed", true)

	// Update student's completed modules count
	var completedCount int64
	database.DB.Model(&models.ModuleProgress{}).
		Where("user_id = ? AND completed = ?", userID, true).
		Count(&completedCount)
	// Later modules are harder, so they're worth more XP.
	xpAward := 50 * currentMod.OrderIndex
	database.DB.Model(&models.User{}).Where("id = ?", userID).
		Updates(map[string]interface{}{
			"completed_modules_count": completedCount,
			"xp":                      gorm.Expr("xp + ?", xpAward),
		})

	// Unlock next module if exists
	var nextModule models.Module
	if err := database.DB.Where("order_index = ?", currentMod.OrderIndex+1).First(&nextModule).Error; err == nil {
		var nextMP models.ModuleProgress
		if database.DB.Where("user_id = ? AND module_id = ?", userID, nextModule.ID).First(&nextMP).Error == nil {
			database.DB.Model(&nextMP).Update("unlocked", true)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Modul muvaffaqiyatli yakunlandi!", "completedCount": completedCount})
}
