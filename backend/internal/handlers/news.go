package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type NewsArticle struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	URL         string `json:"url"`
	ImageURL    string `json:"imageUrl"`
	Source      string `json:"source"`
	PublishedAt string `json:"publishedAt"`
	Category    string `json:"category"`
}

// categoryKeywords is checked in order, so more specific threats (ransomware,
// phishing, ...) win over the generic "Hacking" bucket when a title matches
// several — e.g. "Ransomware Gang Hacks..." should tag as Ransomware.
var categoryKeywords = []struct {
	label    string
	keywords []string
}{
	{"Ransomware", []string{"ransomware"}},
	{"Data Breach", []string{"data breach", "breach", "leaked", "leak"}},
	{"Phishing", []string{"phishing"}},
	{"Malware", []string{"malware", "trojan", "spyware", "virus"}},
	{"Hacking", []string{"hack", "hacker", "hacked", "exploit", "vulnerability", "cve-"}},
}

func categorize(title string) string {
	lower := strings.ToLower(title)
	for _, c := range categoryKeywords {
		for _, kw := range c.keywords {
			if strings.Contains(lower, kw) {
				return c.label
			}
		}
	}
	return "Umumiy"
}

type newsAPIResponse struct {
	Status   string `json:"status"`
	Message  string `json:"message"`
	Articles []struct {
		Source struct {
			Name string `json:"name"`
		} `json:"source"`
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
		URLToImage  string `json:"urlToImage"`
		PublishedAt string `json:"publishedAt"`
	} `json:"articles"`
}

var (
	newsCacheMu  sync.Mutex
	newsCache    []NewsArticle
	newsCachedAt time.Time
)

// newsCacheTTL keeps requests to NewsAPI's free-tier daily quota well under
// its limit regardless of how many users load the page.
const newsCacheTTL = 30 * time.Minute

// GET /api/news — public cybersecurity news feed, proxied server-side so the
// NewsAPI key never reaches the browser.
func GetNews(c *gin.Context) {
	newsCacheMu.Lock()
	if time.Since(newsCachedAt) < newsCacheTTL && len(newsCache) > 0 {
		cached := newsCache
		newsCacheMu.Unlock()
		c.JSON(http.StatusOK, cached)
		return
	}
	newsCacheMu.Unlock()

	apiKey := os.Getenv("NEWS_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Yangiliklar xizmati sozlanmagan"})
		return
	}

	req, err := http.NewRequest(http.MethodGet, "https://newsapi.org/v2/everything", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "So'rov yaratib bo'lmadi"})
		return
	}
	q := req.URL.Query()
	// qInTitle (vs q) restricts matches to the headline, which keeps the feed
	// on-topic — a plain full-text q matches articles that merely mention
	// these words in passing (e.g. unrelated AI/crypto news).
	q.Set("qInTitle", `cybersecurity OR "cyber security" OR hacking OR hacker OR "data breach" OR ransomware OR malware OR phishing`)
	q.Set("language", "en")
	q.Set("sortBy", "publishedAt")
	q.Set("pageSize", "40")
	req.URL.RawQuery = q.Encode()
	req.Header.Set("X-Api-Key", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Yangiliklar serveriga ulanib bo'lmadi"})
		return
	}
	defer resp.Body.Close()

	var parsed newsAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Yangiliklar javobini o'qib bo'lmadi"})
		return
	}
	if parsed.Status != "ok" {
		c.JSON(http.StatusBadGateway, gin.H{"error": parsed.Message})
		return
	}

	articles := make([]NewsArticle, 0, len(parsed.Articles))
	for _, a := range parsed.Articles {
		if a.Title == "" || a.Title == "[Removed]" {
			continue
		}
		articles = append(articles, NewsArticle{
			Title:       a.Title,
			Description: a.Description,
			URL:         a.URL,
			ImageURL:    a.URLToImage,
			Source:      a.Source.Name,
			PublishedAt: a.PublishedAt,
			Category:    categorize(a.Title),
		})
	}

	newsCacheMu.Lock()
	newsCache = articles
	newsCachedAt = time.Now()
	newsCacheMu.Unlock()

	c.JSON(http.StatusOK, articles)
}
