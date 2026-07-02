package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type CTFChallengeResponse struct {
	ID          uint                 `json:"id"`
	ModuleID    uint                 `json:"moduleId"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	Difficulty  models.CTFDifficulty `json:"difficulty"`
	Points      int                  `json:"points"`
	Hint        string               `json:"hint"`
	Solved      bool                 `json:"solved"`
}

// GET /api/modules/:id/ctf — CTF challenges for a module; flags are never sent to the client
func GetModuleCTFChallenges(c *gin.Context) {
	moduleID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri modul ID"})
		return
	}

	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")

	if role == "Student" {
		var mp models.ModuleProgress
		if err := database.DB.Where("user_id = ? AND module_id = ?", userID, moduleID).First(&mp).Error; err != nil || !mp.Unlocked {
			c.JSON(http.StatusForbidden, gin.H{"error": "Bu modul hali ochilmagan"})
			return
		}
	}

	var challenges []models.CTFChallenge
	database.DB.Where("module_id = ?", moduleID).Order("id asc").Find(&challenges)

	solvedIDs := map[uint]bool{}
	if role == "Student" {
		var solves []models.CTFSolve
		database.DB.Where("user_id = ?", userID).Find(&solves)
		for _, s := range solves {
			solvedIDs[s.ChallengeID] = true
		}
	}

	result := make([]CTFChallengeResponse, 0, len(challenges))
	for _, ch := range challenges {
		result = append(result, CTFChallengeResponse{
			ID:          ch.ID,
			ModuleID:    ch.ModuleID,
			Title:       ch.Title,
			Description: ch.Description,
			Difficulty:  ch.Difficulty,
			Points:      ch.Points,
			Hint:        ch.Hint,
			Solved:      solvedIDs[ch.ID],
		})
	}

	c.JSON(http.StatusOK, result)
}

type SubmitFlagRequest struct {
	Flag string `json:"flag" binding:"required"`
}

// POST /api/ctf/:id/submit — Student submits a flag guess
func SubmitCTFFlag(c *gin.Context) {
	challengeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	role, _ := c.Get("userRole")
	if role != "Student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Faqat o'quvchilar flag yubora oladi"})
		return
	}

	var req SubmitFlagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Flag kiritilishi shart"})
		return
	}

	var challenge models.CTFChallenge
	if err := database.DB.First(&challenge, challengeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Challenge topilmadi"})
		return
	}

	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var existing models.CTFSolve
	if database.DB.Where("user_id = ? AND challenge_id = ?", userID, challengeID).First(&existing).Error == nil {
		c.JSON(http.StatusOK, gin.H{"correct": true, "alreadySolved": true, "message": "Siz bu challenge'ni allaqachon yechgansiz"})
		return
	}

	normalized := strings.ToLower(strings.TrimSpace(req.Flag))
	if err := bcrypt.CompareHashAndPassword([]byte(challenge.FlagHash), []byte(normalized)); err != nil {
		c.JSON(http.StatusOK, gin.H{"correct": false, "message": "Flag noto'g'ri. Qayta urinib ko'ring."})
		return
	}

	database.DB.Create(&models.CTFSolve{UserID: userID, ChallengeID: uint(challengeID), SolvedAt: time.Now()})
	database.DB.Model(&models.User{}).Where("id = ?", userID).
		Update("xp", gorm.Expr("xp + ?", challenge.Points))

	c.JSON(http.StatusOK, gin.H{
		"correct":       true,
		"alreadySolved": false,
		"message":       "To'g'ri! Flag qabul qilindi.",
		"pointsAwarded": challenge.Points,
	})
}
