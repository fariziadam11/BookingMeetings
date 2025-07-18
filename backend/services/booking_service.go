package services

import (
	"backendgo/config"
	"backendgo/models"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

func CreateBookingService(input models.CreateBookingInput) (*models.Booking, error) {
	// Parse room ID as UUID
	roomUUID, err := uuid.Parse(input.RoomID)
	if err != nil {
		return nil, fmt.Errorf("Format ID ruangan tidak valid")
	}

	// Validate booking conflicts
	var count int64
	config.DB.Model(&models.Booking{}).
		Where("room_id = ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))",
			roomUUID, input.EndTime, input.EndTime, input.StartTime, input.StartTime, input.StartTime, input.EndTime).
		Count(&count)
	if count > 0 {
		return nil, fmt.Errorf("Jadwal booking bentrok dengan jadwal yang sudah ada")
	}

	// Validate room capacity
	var room models.Room
	if err := config.DB.First(&room, roomUUID).Error; err != nil {
		return nil, fmt.Errorf("Ruangan tidak ditemukan")
	}
	if input.Attendees > room.Capacity {
		return nil, fmt.Errorf("Jumlah peserta melebihi kapasitas ruangan")
	}

	// Generate token for QR code
	token := uuid.New().String()
	createdAt := time.Now()
	status := "pending"

	booking := models.Booking{
		RoomID:      roomUUID,
		UserName:    input.UserName,
		UserEmail:   input.UserEmail,
		Purpose:     input.Purpose,
		Attendees:   input.Attendees,
		StartTime:   input.StartTime,
		EndTime:     input.EndTime,
		Status:      status,
		QRCodeToken: token,
		CreatedAt:   createdAt,
	}

	if err := config.DB.Create(&booking).Error; err != nil {
		return nil, fmt.Errorf("Gagal membuat booking")
	}

	// Send email notification to user
	// (EmailService bisa dipanggil di handler jika ingin inject dependency)
	// go func() {
	// 	h.EmailService.SendBookingNotification(&booking, &room, qrBase64)
	// }()

	// Send email notification to admin(s)
	adminEmails := os.Getenv("ADMIN_EMAIL")
	if adminEmails != "" {
		emails := strings.Split(adminEmails, ",")
		for _, adminEmail := range emails {
			adminEmail = strings.TrimSpace(adminEmail)
			if adminEmail != "" {
				// Send email to admin (implementasi di handler)
			}
		}
	}

	return &booking, nil
}
