package routes

import (
	"backendgo/handlers"
	"backendgo/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, bookingHandler *handlers.BookingHandler) {
	api := r.Group("/api")
	{
		admin := api.Group("/admin")
		{
			admin.POST("/register", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.RegisterAdmin)
			admin.POST("/login", handlers.LoginAdmin)
			admin.POST("/forgot-password", handlers.ForgotPassword)
			admin.POST("/reset-password", handlers.ResetPassword)
		}

		api.GET("/rooms", handlers.GetRooms)
		api.GET("/rooms/:id", handlers.GetRoomDetail)

		api.GET("/bookings", bookingHandler.GetBookings)
		api.GET("/bookings/:id", bookingHandler.GetBookingByID)

		api.POST("/rooms", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.CreateRoom)
		api.PUT("/rooms/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.UpdateRoom)
		api.DELETE("/rooms/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.DeleteRoom)

		api.PATCH("/bookings/:id/approve", middleware.AuthMiddleware(), middleware.AdminOnly(), bookingHandler.ApproveBooking)
		api.PATCH("/bookings/:id/reject", middleware.AuthMiddleware(), middleware.AdminOnly(), bookingHandler.RejectBooking)
		api.PUT("/bookings/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), bookingHandler.UpdateBooking)
		api.DELETE("/bookings/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), bookingHandler.DeleteBooking)
		api.DELETE("/bookings/delete/:token", bookingHandler.DeleteBookingByToken)
	}
}
