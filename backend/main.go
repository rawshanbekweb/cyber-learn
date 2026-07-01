package main

import (
	"log"
	"os"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/handlers"
	"cyberai-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.Init()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.Default()
	r.MaxMultipartMemory = 64 << 20 // 64 MB for large file uploads

	// CORS — allow frontend dev server and production origins
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:4173"}
	if origin := os.Getenv("ALLOWED_ORIGIN"); origin != "" {
		allowedOrigins = append(allowedOrigins, origin)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve uploaded files as static assets
	r.Static("/uploads", "./uploads")

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "CyberAI Backend"})
	})

	// API routes
	api := r.Group("/api")
	{
		// File upload (public — teachers upload lesson materials)
		api.POST("/upload", handlers.UploadFile)

		// Rankings (public leaderboard)
		api.GET("/rankings", handlers.GetRankings)

		// Auth (public)
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
			auth.GET("/me", middleware.Auth(), handlers.Me)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.Auth())
		{
			// Students
			protected.GET("/students", middleware.TeacherOnly(), handlers.GetStudents)
			protected.GET("/students/me/progress", handlers.GetMyProgress)
			protected.GET("/students/:id", handlers.GetStudent)

			// Modules
			protected.GET("/modules", handlers.GetModules)
			protected.GET("/modules/:id", handlers.GetModule)
			protected.POST("/modules/:id/complete", handlers.CompleteModule)

			// Assessment (fuzzy)
			protected.POST("/assessment/submit", handlers.SubmitAssessment)

			// Lessons
			protected.GET("/lessons", handlers.GetLessons)
			protected.POST("/lessons", middleware.TeacherOnly(), handlers.CreateLesson)
			protected.DELETE("/lessons/:id", middleware.TeacherOnly(), handlers.DeleteLesson)
			protected.POST("/lessons/:id/read", handlers.MarkLessonRead)

			// Assignments
			protected.GET("/assignments", handlers.GetAssignments)
			protected.GET("/assignments/:id", handlers.GetAssignment)
			protected.POST("/assignments", middleware.TeacherOnly(), handlers.CreateAssignment)
			protected.POST("/assignments/:id/complete", handlers.CompleteAssignment)

			// Analytics
			protected.GET("/analytics", handlers.GetAnalytics)

			// Fuzzy weights
			protected.GET("/fuzzy-weights", handlers.GetFuzzyWeights)
			protected.PUT("/fuzzy-weights", middleware.TeacherOnly(), handlers.UpdateFuzzyWeights)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 CyberAI Backend server started on port %s", port)
	log.Printf("📖 API docs: http://localhost:%s/health", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
