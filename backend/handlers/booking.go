package handlers

import (
	"backendgo/config"
	"backendgo/models"
	"backendgo/services"
	"fmt"
	"net/http"
	"time"

	"encoding/base64"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
)

type BookingHandler struct {
	EmailService *services.EmailService
}

type UpdateBookingInput struct {
	RoomID    string    `json:"room_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Status    string    `json:"status"`
	Purpose   string    `json:"purpose"`
}

type BookingResponse struct {
	ID              uuid.UUID  `json:"id"`
	RoomID          uuid.UUID  `json:"room_id"`
	UserEmail       string     `json:"user_email"`
	UserName        string     `json:"user_name"`
	RoomName        string     `json:"room_name"`
	Purpose         string     `json:"purpose"`
	Attendees       int        `json:"attendees"`
	StartTime       time.Time  `json:"start_time"`
	EndTime         time.Time  `json:"end_time"`
	Status          string     `json:"status"`
	QRCodeToken     string     `json:"qr_code_token"`
	CreatedAt       time.Time  `json:"created_at"`
	QRCodeBase64    string     `json:"qr_code_base64,omitempty"`
	IsOvertime      bool       `json:"is_overtime"`
	OvertimeMinutes int        `json:"overtime_minutes,omitempty"`
	ExtendedUntil   *time.Time `json:"extended_until,omitempty"`
}

func (h *BookingHandler) GetBookings(c *gin.Context) {
	// Pagination
	page := 1
	limit := 10
	if p := c.Query("page"); p != "" {
		fmt.Sscanf(p, "%d", &page)
	}
	if l := c.Query("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	roomID := c.Query("room_id")
	status := c.Query("status")

	var bookings []models.Booking
	query := config.DB.Preload("Room")

	if roomID != "" {
		if roomUUID, err := uuid.Parse(roomID); err == nil {
			query = query.Where("room_id = ?", roomUUID)
		}
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Offset((page - 1) * limit).Limit(limit).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data booking", "data": nil})
		return
	}

	// Convert to response format with QR codes
	var bookingsWithQR []BookingResponse
	for _, b := range bookings {
		var qrBase64 string
		isOvertime := false
		overtimeMinutes := 0
		var extendedUntil *time.Time
		now := time.Now()
		if b.Status == "approved" && now.After(b.EndTime) {
			isOvertime = true
			overtimeMinutes = int(now.Sub(b.EndTime).Minutes())
			t := now
			extendedUntil = &t
			deleteURL := fmt.Sprintf("http://localhost:8080/api/bookings/delete/%s", b.QRCodeToken)
			qr, err := qrcode.Encode(deleteURL, qrcode.Medium, 256)
			if err == nil {
				qrBase64 = base64.StdEncoding.EncodeToString(qr)
			}
		}
		roomName := ""
		if b.Room.Name != "" {
			roomName = b.Room.Name
		}
		bookingsWithQR = append(bookingsWithQR, BookingResponse{
			ID:              b.ID,
			RoomID:          b.RoomID,
			UserName:        b.UserName,
			UserEmail:       b.UserEmail,
			Purpose:         b.Purpose,
			Attendees:       b.Attendees,
			StartTime:       b.StartTime,
			EndTime:         b.EndTime,
			Status:          b.Status,
			QRCodeToken:     b.QRCodeToken,
			CreatedAt:       b.CreatedAt,
			QRCodeBase64:    qrBase64,
			RoomName:        roomName,
			IsOvertime:      isOvertime,
			OvertimeMinutes: overtimeMinutes,
			ExtendedUntil:   extendedUntil,
		})
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data booking berhasil diambil", "data": bookingsWithQR})
}

func (h *BookingHandler) GetBookingByID(c *gin.Context) {
	id := c.Param("id")
	bookingUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID booking tidak valid", "data": nil})
		return
	}

	var booking models.Booking
	if err := config.DB.Preload("Room").First(&booking, bookingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}

	// Generate QR code if meeting has ended
	var qrBase64 string
	isOvertime := false
	overtimeMinutes := 0
	var extendedUntil *time.Time
	now := time.Now()
	if booking.Status == "approved" && now.After(booking.EndTime) {
		isOvertime = true
		overtimeMinutes = int(now.Sub(booking.EndTime).Minutes())
		t := now
		extendedUntil = &t
		deleteURL := fmt.Sprintf("http://localhost:8080/api/bookings/delete/%s", booking.QRCodeToken)
		qr, err := qrcode.Encode(deleteURL, qrcode.Medium, 256)
		if err == nil {
			qrBase64 = base64.StdEncoding.EncodeToString(qr)
		}
	}
	response := BookingResponse{
		ID:              booking.ID,
		RoomID:          booking.RoomID,
		UserName:        booking.UserName,
		UserEmail:       booking.UserEmail,
		Purpose:         booking.Purpose,
		Attendees:       booking.Attendees,
		StartTime:       booking.StartTime,
		EndTime:         booking.EndTime,
		Status:          booking.Status,
		QRCodeToken:     booking.QRCodeToken,
		CreatedAt:       booking.CreatedAt,
		QRCodeBase64:    qrBase64,
		RoomName:        booking.Room.Name,
		IsOvertime:      isOvertime,
		OvertimeMinutes: overtimeMinutes,
		ExtendedUntil:   extendedUntil,
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data booking berhasil diambil", "data": response})
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var input models.CreateBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Warnf("Invalid input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}
	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		log.Warnf("Validation failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Validasi input gagal", "data": nil})
		return
	}

	// Panggil service untuk logic utama
	booking, err := services.CreateBookingService(input)
	if err != nil {
		log.Errorf("Failed to create booking: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil dibuat", "data": booking})
}

func (h *BookingHandler) ApproveBooking(c *gin.Context) {
	id := c.Param("id")
	bookingUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID booking tidak valid", "data": nil})
		return
	}

	var booking models.Booking
	if err := config.DB.First(&booking, bookingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}
	if booking.Status == "approved" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Booking sudah disetujui", "data": nil})
		return
	}

	oldStatus := booking.Status
	booking.Status = "approved"
	if err := config.DB.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyetujui booking", "data": nil})
		return
	}

	// Send email notification for status update
	go func() {
		var room models.Room
		if err := config.DB.First(&room, booking.RoomID).Error; err == nil {
			qrBase64 := ""
			if booking.Status == "approved" {
				deleteURL := fmt.Sprintf("http://localhost:8080/api/bookings/delete/%s", booking.QRCodeToken)
				qr, err := qrcode.Encode(deleteURL, qrcode.Medium, 256)
				if err == nil {
					qrBase64 = base64.StdEncoding.EncodeToString(qr)
				}
			}
			h.EmailService.SendBookingStatusUpdate(&booking, &room, oldStatus, qrBase64)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil disetujui", "data": booking})
}

func (h *BookingHandler) RejectBooking(c *gin.Context) {
	id := c.Param("id")
	bookingUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID booking tidak valid", "data": nil})
		return
	}

	var booking models.Booking
	if err := config.DB.First(&booking, bookingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}
	if booking.Status == "rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Booking sudah ditolak", "data": nil})
		return
	}

	oldStatus := booking.Status
	booking.Status = "rejected"
	if err := config.DB.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menolak booking", "data": nil})
		return
	}

	// Send email notification for status update
	go func() {
		var room models.Room
		if err := config.DB.First(&room, booking.RoomID).Error; err == nil {
			qrBase64 := ""
			// QR code hanya untuk status approved, jadi kosong di reject
			h.EmailService.SendBookingStatusUpdate(&booking, &room, oldStatus, qrBase64)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil ditolak", "data": booking})
}

func (h *BookingHandler) UpdateBooking(c *gin.Context) {
	id := c.Param("id")
	bookingUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID booking tidak valid", "data": nil})
		return
	}

	var booking models.Booking
	if err := config.DB.First(&booking, bookingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}

	var input UpdateBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	if input.RoomID != "" && input.RoomID != "null" {
		roomUUID, err := uuid.Parse(input.RoomID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID ruangan tidak valid", "data": nil})
			return
		}
		booking.RoomID = roomUUID
	}
	if !input.StartTime.IsZero() {
		booking.StartTime = input.StartTime
	}
	if !input.EndTime.IsZero() {
		booking.EndTime = input.EndTime
	}
	if input.Status != "" {
		booking.Status = input.Status
	}
	if input.Purpose != "" {
		booking.Purpose = input.Purpose
	}

	if err := config.DB.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memperbarui booking", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil diperbarui", "data": booking})
}

func (h *BookingHandler) DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	bookingUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID booking tidak valid", "data": nil})
		return
	}

	var booking models.Booking
	if err := config.DB.First(&booking, bookingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}
	if err := config.DB.Delete(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menghapus booking", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil dihapus", "data": nil})
}

func (h *BookingHandler) DeleteBookingByToken(c *gin.Context) {
	token := c.Param("token")
	var booking models.Booking
	if err := config.DB.Where("qr_code_token = ?", token).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Booking tidak ditemukan", "data": nil})
		return
	}
	if err := config.DB.Delete(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menghapus booking", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Booking berhasil dihapus", "data": nil})
}
