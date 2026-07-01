package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleStudent Role = "Student"
	RoleTeacher Role = "Teacher"
)

type Level string

const (
	LevelBeginner     Level = "Beginner"
	LevelIntermediate Level = "Intermediate"
	LevelAdvanced     Level = "Advanced"
)

type Difficulty string

const (
	DifficultyBeginner     Difficulty = "Boshlang'ich"
	DifficultyIntermediate Difficulty = "O'rta"
	DifficultyAdvanced     Difficulty = "Yuqori"
)

// User represents both students and teacher
type User struct {
	gorm.Model
	Name     string `gorm:"uniqueIndex;not null" json:"name"`
	Age      int    `json:"age"`
	Role     Role   `gorm:"not null;default:'Student'" json:"role"`
	Password string `json:"-"` // only teacher uses password

	// Student-specific fields
	DiagnosticScore        float64 `json:"diagnosticScore"`
	Level                  Level   `gorm:"default:'Beginner'" json:"level"`
	FuzzyScore             float64 `json:"fuzzyScore"`
	CompletedModulesCount  int     `json:"completedModulesCount"`
	Speed                  float64 `json:"speed"`
	Errors                 float64 `json:"errors"`
	HasCompletedInitialTest bool   `gorm:"default:false" json:"hasCompletedInitialTest"`
	XP                     int     `gorm:"default:0" json:"xp"`
	Avatar                 string  `json:"avatar"`

	// Fuzzy result (stored as separate fields)
	LastFuzzyScore float64 `json:"lastFuzzyScore"`
	LastFuzzyLevel Level   `json:"lastFuzzyLevel"`
	LastFuzzyRule1 float64 `json:"lastFuzzyRule1"`
	LastFuzzyRule2 float64 `json:"lastFuzzyRule2"`
	LastFuzzyRule3 float64 `json:"lastFuzzyRule3"`
	HasFuzzyResult bool    `gorm:"default:false" json:"hasFuzzyResult"`

	// Relations
	ModuleProgresses []ModuleProgress `gorm:"foreignKey:UserID" json:"moduleProgress,omitempty"`
}

// ModuleProgress tracks each student's progress per module
type ModuleProgress struct {
	gorm.Model
	UserID    uint `gorm:"uniqueIndex:idx_user_module;not null" json:"userId"`
	ModuleID  uint `gorm:"uniqueIndex:idx_user_module;not null" json:"moduleId"`
	Unlocked  bool `gorm:"default:false" json:"unlocked"`
	Completed bool `gorm:"default:false" json:"completed"`

	Module Module `gorm:"foreignKey:ModuleID" json:"module,omitempty"`
}

// Module is the static module definition
type Module struct {
	gorm.Model
	Title       string `gorm:"not null" json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	OrderIndex  int    `gorm:"default:0" json:"orderIndex"`
}

type LessonType string

const (
	LessonTypeNazariy LessonType = "Nazariy"
	LessonTypeAmaliy  LessonType = "Amaliy"
)

// Lesson created by teacher
type Lesson struct {
	gorm.Model
	Title       string     `gorm:"not null" json:"title"`
	Description string     `json:"description"`
	Content     string     `json:"content"`
	Category    string     `json:"category"`
	Difficulty  Difficulty `json:"difficulty"`
	LessonType  LessonType `gorm:"default:'Nazariy'" json:"lessonType"`
	VideoURL    string     `json:"videoUrl"`
	Tags        string     `json:"tags"` // JSON array stored as string
	CreatedAt   time.Time  `json:"createdAt"`

	// Many-to-many: students who read this lesson
	ReadByStudents []User `gorm:"many2many:lesson_reads;" json:"readByStudents,omitempty"`
}

// LessonRead tracks which students read which lessons
type LessonRead struct {
	LessonID uint      `gorm:"primaryKey" json:"lessonId"`
	UserID   uint      `gorm:"primaryKey" json:"userId"`
	ReadAt   time.Time `json:"readAt"`
}

type AssignmentType string

const (
	AssignmentTypeNazariy AssignmentType = "Nazariy"
	AssignmentTypeAmaliy  AssignmentType = "Amaliy"
)

// Assignment created by teacher for a student
type Assignment struct {
	gorm.Model
	Title          string         `gorm:"not null" json:"title"`
	Description    string         `json:"description"`
	StudentID      uint           `gorm:"not null" json:"studentId"`
	StudentName    string         `json:"studentName"`
	TargetModuleID uint           `gorm:"not null" json:"targetModuleId"`
	AssignmentType AssignmentType `gorm:"default:'Nazariy'" json:"assignmentType"`
	Completed      bool           `gorm:"default:false" json:"completed"`
	DateAssigned   time.Time      `json:"dateAssigned"`

	Questions []AssignmentQuestion `gorm:"foreignKey:AssignmentID" json:"questions"`
}

// AssignmentQuestion is a quiz question in an assignment
type AssignmentQuestion struct {
	gorm.Model
	AssignmentID  uint   `gorm:"not null" json:"assignmentId"`
	Question      string `gorm:"not null" json:"question"`
	Options       string `json:"options"`       // JSON array stored as string
	CorrectAnswer int    `json:"correctAnswer"` // index of correct option
}

// FuzzyWeights stores the teacher-configurable fuzzy engine parameters
type FuzzyWeights struct {
	gorm.Model
	Rule1Weight           float64 `gorm:"default:0.2" json:"rule1Weight"`
	Rule2Weight           float64 `gorm:"default:0.5" json:"rule2Weight"`
	Rule3Weight           float64 `gorm:"default:0.9" json:"rule3Weight"`
	BeginnerThreshold     float64 `gorm:"default:0.4" json:"beginnerThreshold"`
	IntermediateThreshold float64 `gorm:"default:0.7" json:"intermediateThreshold"`
}
