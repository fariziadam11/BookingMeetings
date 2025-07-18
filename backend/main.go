package main

import (
	"backendgo/config"
	"backendgo/handlers"
	"backendgo/models"
	"backendgo/routes"
	"backendgo/services"
	"log"
	"time"

	"fmt"
	"os"

	_ "backendgo/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/ulule/limiter/v3"
	ginmiddleware "github.com/ulule/limiter/v3/drivers/middleware/gin"
	memory "github.com/ulule/limiter/v3/drivers/store/memory"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	fmt.Println("SENDGRID_API_KEY:", os.Getenv("SENDGRID_API_KEY"))

	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.User{}, &models.Room{}, &models.Booking{})

	emailService := services.NewEmailService()
	bookingHandler := &handlers.BookingHandler{EmailService: emailService}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Ganti dengan origin frontend Anda di production
		AllowMethods:     []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Use(func(c *gin.Context) {
		c.Set("emailService", emailService)
		c.Next()
	})

	rate, _ := limiter.NewRateFromFormatted("5-M")
	store := memory.NewStore()
	rateLimiter := ginmiddleware.NewMiddleware(limiter.New(store, rate))

	r.POST("/api/bookings", rateLimiter, bookingHandler.CreateBooking)

	routes.RegisterRoutes(r, bookingHandler)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	go func() {
		for {
			time.Sleep(5 * time.Minute)
			threshold := time.Now().Add(-2 * time.Hour)
			result := config.DB.Where("end_time < ?", threshold).Delete(&models.Booking{})
			if result.Error != nil {
				log.Println("Auto-delete booking error:", result.Error)
			} else if result.RowsAffected > 0 {
				log.Printf("Auto-deleted %d expired bookings\n", result.RowsAffected)
			}
		}
	}()

	r.Run(":8080")
}
