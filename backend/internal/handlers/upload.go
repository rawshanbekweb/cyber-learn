package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	allowedUploadExts = map[string]bool{
		".pdf": true, ".ppt": true, ".pptx": true,
		".doc": true, ".docx": true, ".xlsx": true, ".xls": true,
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
		".mp4": true, ".webm": true, ".mov": true, ".avi": true,
		".zip": true, ".rar": true,
		".txt": true, ".md": true,
	}
	unsafeFileChars = regexp.MustCompile(`[^a-zA-Z0-9]`)
)

// POST /api/upload
func UploadFile(c *gin.Context) {
	_, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fayl topilmadi"})
		return
	}

	const maxSize int64 = 64 << 20 // 64 MB
	if header.Size > maxSize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Fayl hajmi 64MB dan oshmasligi kerak"})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedUploadExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bu fayl turi ruxsat etilmagan: " + ext})
		return
	}

	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Papka yaratishda xato"})
		return
	}

	baseName := strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename))
	safeName := unsafeFileChars.ReplaceAllString(baseName, "_")
	if len(safeName) > 40 {
		safeName = safeName[:40]
	}
	uniqueName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), safeName, ext)
	destPath := filepath.Join(uploadDir, uniqueName)

	if err := c.SaveUploadedFile(header, destPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fayl saqlashda xato"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":  "/uploads/" + uniqueName,
		"name": header.Filename,
		"size": header.Size,
	})
}
