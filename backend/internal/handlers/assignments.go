package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type AssignmentQuestionRequest struct {
	Question      string   `json:"question" binding:"required"`
	Options       []string `json:"options" binding:"required,min=2"`
	CorrectAnswer int      `json:"correctAnswer"`
}

type AssignmentRequest struct {
	Title          string                      `json:"title" binding:"required,min=2"`
	Description    string                      `json:"description"`
	StudentID      uint                        `json:"studentId" binding:"required"`
	TargetModuleID uint                        `json:"targetModuleId" binding:"required"`
	AssignmentType string                      `json:"assignmentType"`
	Questions      []AssignmentQuestionRequest `json:"questions"`
}

type AssignmentQuestionResponse struct {
	ID            uint     `json:"id"`
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectAnswer int      `json:"correctAnswer"`
}

type AssignmentResponse struct {
	ID             uint                         `json:"id"`
	Title          string                       `json:"title"`
	Description    string                       `json:"description"`
	StudentID      uint                         `json:"studentId"`
	StudentName    string                       `json:"studentName"`
	TargetModuleID uint                         `json:"targetModuleId"`
	AssignmentType string                       `json:"assignmentType"`
	Completed      bool                         `json:"completed"`
	DateAssigned   time.Time                    `json:"dateAssigned"`
	Questions      []AssignmentQuestionResponse `json:"questions"`
}

func buildAssignmentResponse(a models.Assignment) AssignmentResponse {
	assignmentType := string(a.AssignmentType)
	if assignmentType == "" {
		assignmentType = "Nazariy"
	}
	resp := AssignmentResponse{
		ID:             a.ID,
		Title:          a.Title,
		Description:    a.Description,
		StudentID:      a.StudentID,
		StudentName:    a.StudentName,
		TargetModuleID: a.TargetModuleID,
		AssignmentType: assignmentType,
		Completed:      a.Completed,
		DateAssigned:   a.DateAssigned,
		Questions:      []AssignmentQuestionResponse{},
	}
	for _, q := range a.Questions {
		var opts []string
		if q.Options != "" {
			_ = json.Unmarshal([]byte(q.Options), &opts)
		}
		if opts == nil {
			opts = []string{}
		}
		resp.Questions = append(resp.Questions, AssignmentQuestionResponse{
			ID:            q.ID,
			Question:      q.Question,
			Options:       opts,
			CorrectAnswer: q.CorrectAnswer,
		})
	}
	return resp
}

// GET /api/assignments
// Teacher: all assignments; Student: own assignments
func GetAssignments(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")

	var assignments []models.Assignment
	query := database.DB.Preload("Questions").Order("created_at desc")

	if role == "Student" {
		query = query.Where("student_id = ?", userID)
	}

	query.Find(&assignments)

	var result []AssignmentResponse
	for _, a := range assignments {
		result = append(result, buildAssignmentResponse(a))
	}
	if result == nil {
		result = []AssignmentResponse{}
	}
	c.JSON(http.StatusOK, result)
}

// GET /api/assignments/:id
func GetAssignment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")

	var assignment models.Assignment
	if err := database.DB.Preload("Questions").First(&assignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topshiriq topilmadi"})
		return
	}

	if role == "Student" && assignment.StudentID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Ruxsat yo'q"})
		return
	}

	c.JSON(http.StatusOK, buildAssignmentResponse(assignment))
}

// POST /api/assignments — Teacher only
func CreateAssignment(c *gin.Context) {
	var req AssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify student exists
	var student models.User
	if err := database.DB.Where("id = ? AND role = ?", req.StudentID, models.RoleStudent).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "O'quvchi topilmadi"})
		return
	}

	assignmentType := models.AssignmentType(req.AssignmentType)
	if assignmentType == "" {
		assignmentType = models.AssignmentTypeNazariy
	}

	assignment := models.Assignment{
		Title:          req.Title,
		Description:    req.Description,
		StudentID:      req.StudentID,
		StudentName:    student.Name,
		TargetModuleID: req.TargetModuleID,
		AssignmentType: assignmentType,
		Completed:      false,
		DateAssigned:   time.Now(),
	}

	if err := database.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Topshiriq yaratishda xato"})
		return
	}

	// Create questions
	for _, qr := range req.Questions {
		optsJSON, _ := json.Marshal(qr.Options)
		q := models.AssignmentQuestion{
			AssignmentID:  assignment.ID,
			Question:      qr.Question,
			Options:       string(optsJSON),
			CorrectAnswer: qr.CorrectAnswer,
		}
		database.DB.Create(&q)
	}

	// Unlock target module for student
	var mp models.ModuleProgress
	if database.DB.Where("user_id = ? AND module_id = ?", req.StudentID, req.TargetModuleID).First(&mp).Error == nil {
		database.DB.Model(&mp).Update("unlocked", true)
	}

	database.DB.Preload("Questions").First(&assignment, assignment.ID)
	c.JSON(http.StatusCreated, buildAssignmentResponse(assignment))
}

// POST /api/assignments/:id/complete — Student completes assignment
func CompleteAssignment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	userID, _ := c.Get("userID")

	var assignment models.Assignment
	if err := database.DB.First(&assignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topshiriq topilmadi"})
		return
	}

	if assignment.StudentID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Bu topshiriq sizga tegishli emas"})
		return
	}

	if assignment.Completed {
		c.JSON(http.StatusOK, gin.H{"message": "Topshiriq allaqachon bajarilgan"})
		return
	}

	database.DB.Model(&assignment).Update("completed", true)
	c.JSON(http.StatusOK, gin.H{"message": "Topshiriq muvaffaqiyatli bajarildi!"})
}
