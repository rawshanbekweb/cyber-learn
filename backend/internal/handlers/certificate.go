package handlers

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	_ "image/png"
	"net/http"
	"os"
	"strconv"
	"time"

	"cyberai-backend/internal/database"
	"cyberai-backend/internal/models"

	"github.com/fogleman/gg"
	"github.com/gin-gonic/gin"
	"github.com/golang/freetype/truetype"
	"github.com/google/uuid"
	qrcode "github.com/skip2/go-qrcode"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
)

const certificateTemplatePath = "assets/certificate-template.png"

var certificateSkills = []string{
	"Onlaynda xavfsiz bo'lish asoslarini, kiberxavfsizlik nima ekanini va uning ta'sirini tushuntiradi.",
	"Eng ko'p uchraydigan kiber tahdidlar, hujumlar va zaifliklarni tushuntiradi.",
	"Onlaynda o'zini qanday himoya qilishni tushuntiradi.",
	"Tashkilotlar bu hujumlardan faoliyatini qanday himoya qilishini tushuntiradi.",
	"Kiberxavfsizlik sohasidagi turli karyera imkoniyatlarini o'rganish uchun manba va resurslardan foydalanadi.",
}

// GET /api/modules/:id/certificate — generates and returns a downloadable PNG
// certificate for the currently logged-in student's completion of one module.
func GetModuleCertificate(c *gin.Context) {
	idStr := c.Param("id")
	moduleID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri ID"})
		return
	}

	userID, _ := c.Get("userID")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
		return
	}

	if user.Role != models.RoleStudent {
		c.JSON(http.StatusForbidden, gin.H{"error": "Sertifikat faqat o'quvchilarga beriladi"})
		return
	}

	var mod models.Module
	if err := database.DB.First(&mod, moduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modul topilmadi"})
		return
	}

	var mp models.ModuleProgress
	if err := database.DB.Where("user_id = ? AND module_id = ?", userID, moduleID).First(&mp).Error; err != nil || !mp.Completed {
		c.JSON(http.StatusForbidden, gin.H{"error": "Sertifikat olish uchun avval ushbu modulni testdan o'tib tugatishingiz kerak"})
		return
	}

	var cert models.Certificate
	if err := database.DB.Where("user_id = ? AND module_id = ?", userID, moduleID).First(&cert).Error; err != nil {
		cert = models.Certificate{
			UserID:           user.ID,
			ModuleID:         mod.ID,
			VerificationCode: uuid.New().String()[:8],
			ModuleTitle:      mod.Title,
			Score:            user.FuzzyScore,
			IssuedAt:         time.Now(),
		}
		database.DB.Create(&cert)
	}

	png, err := renderCertificatePNG(user.Name, cert.ModuleTitle, cert.IssuedAt, cert.VerificationCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Sertifikat yaratishda xato: " + err.Error()})
		return
	}

	c.Header("Content-Disposition", `attachment; filename="sertifikat-`+strconv.FormatUint(moduleID, 10)+`.png"`)
	c.Data(http.StatusOK, "image/png", png)
}

// GET /api/certificate/verify/:code — public lookup to confirm a certificate is genuine
func VerifyCertificate(c *gin.Context) {
	code := c.Param("code")

	var cert models.Certificate
	if err := database.DB.Where("verification_code = ?", code).First(&cert).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"valid": false, "error": "Bunday sertifikat topilmadi"})
		return
	}

	var user models.User
	database.DB.First(&user, cert.UserID)

	c.JSON(http.StatusOK, gin.H{
		"valid":       true,
		"name":        user.Name,
		"moduleTitle": cert.ModuleTitle,
		"issuedAt":    cert.IssuedAt,
	})
}

func verifyURL(code string) string {
	base := os.Getenv("PUBLIC_API_URL")
	if base == "" {
		base = "http://localhost:8080"
	}
	return fmt.Sprintf("%s/api/certificate/verify/%s", base, code)
}

func loadFace(ttf []byte, points float64) (font.Face, error) {
	f, err := truetype.Parse(ttf)
	if err != nil {
		return nil, err
	}
	return truetype.NewFace(f, &truetype.Options{Size: points, DPI: 72}), nil
}

// renderCertificatePNG overlays the student's name, completed module, issue
// date and a verification QR code onto the static certificate template and
// returns the result as encoded PNG bytes.
func renderCertificatePNG(name, moduleTitle string, issuedAt time.Time, code string) ([]byte, error) {
	bg, err := gg.LoadPNG(certificateTemplatePath)
	if err != nil {
		return nil, err
	}
	dc := gg.NewContextForImage(bg)

	navy := color.RGBA{15, 42, 89, 255}
	blue := color.RGBA{28, 155, 239, 255}
	gray := color.RGBA{55, 65, 81, 255}
	mask := color.RGBA{255, 255, 255, 255}

	maskRect := func(x, y, w, h float64) {
		dc.SetColor(mask)
		dc.DrawRectangle(x, y, w, h)
		dc.Fill()
	}

	setFont := func(bold bool, points float64) error {
		src := goregular.TTF
		if bold {
			src = gobold.TTF
		}
		face, err := loadFace(src, points)
		if err != nil {
			return err
		}
		dc.SetFontFace(face)
		return nil
	}

	// Title
	maskRect(85, 185, 950, 65)
	if err := setFont(true, 40); err != nil {
		return nil, err
	}
	dc.SetColor(navy)
	dc.DrawString("Kursni Tugatganlik Sertifikati", 97, 230)

	// Student name
	maskRect(85, 295, 900, 75)
	if err := setFont(true, 38); err != nil {
		return nil, err
	}
	dc.SetColor(blue)
	dc.DrawString(name, 97, 350)

	// Intro paragraph + module name
	maskRect(85, 400, 1100, 100)
	if err := setFont(false, 21); err != nil {
		return nil, err
	}
	dc.SetColor(gray)
	dc.DrawString("quyidagi bosqichni muvaffaqiyatli yakunlab, o'quvchi darajasidagi", 97, 432)
	dc.DrawString("malakaga ega bo'ldi:", 97, 460)
	if err := setFont(true, 22); err != nil {
		return nil, err
	}
	dc.SetColor(navy)
	dc.DrawString(moduleTitle+" moduli", 97, 490)

	// Skills header + bullets
	maskRect(85, 530, 1150, 230)
	if err := setFont(true, 20); err != nil {
		return nil, err
	}
	dc.SetColor(gray)
	dc.DrawString("O'quvchi quyidagi ko'nikmalarni muvaffaqiyatli o'zlashtirdi:", 97, 558)
	if err := setFont(false, 17); err != nil {
		return nil, err
	}
	y := 600.0
	for _, skill := range certificateSkills {
		dc.DrawStringWrapped("•  "+skill, 115, y, 0, 0, 1080, 1.3, gg.AlignLeft)
		y += 30
	}

	// QR verification code (mask the placeholder box interior first)
	maskRect(210, 820, 134, 128)
	qrPNG, err := qrcode.Encode(verifyURL(code), qrcode.Medium, 120)
	if err == nil {
		if qrImg, _, err := image.Decode(bytes.NewReader(qrPNG)); err == nil {
			dc.DrawImage(qrImg, 217, 826)
		}
	}

	// Signature block
	maskRect(715, 885, 470, 125)
	if err := setFont(true, 20); err != nil {
		return nil, err
	}
	dc.SetColor(navy)
	dc.DrawString("CyberAI", 722, 905)
	if err := setFont(false, 15); err != nil {
		return nil, err
	}
	dc.SetColor(gray)
	dc.DrawString("Ta'lim Direktori", 722, 930)
	dc.DrawString("CyberAI Ta'lim Platformasi", 722, 953)

	// Date
	maskRect(95, 985, 350, 30)
	if err := setFont(true, 18); err != nil {
		return nil, err
	}
	dc.SetColor(navy)
	dc.DrawString("Sana: "+issuedAt.Format("2006-01-02"), 97, 1008)

	var buf bytes.Buffer
	if err := dc.EncodePNG(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
