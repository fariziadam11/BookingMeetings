package services

import (
	"backendgo/config"
	"backendgo/models"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func CreateBookingService(input models.CreateBookingInput) (*models.Booking, error) {
	// Parse room ID as UUID
	roomUUID, err := uuid.Parse(input.RoomID)
	if err != nil {
		return nil, fmt.Errorf("format ID ruangan tidak valid")
	}

	// Validate booking conflicts
	var count int64
	config.DB.Model(&models.Booking{}).
		Where("room_id = ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))",
			roomUUID, input.EndTime, input.EndTime, input.StartTime, input.StartTime, input.StartTime, input.EndTime).
		Count(&count)
	if count > 0 {
		return nil, fmt.Errorf("jadwal booking bentrok dengan jadwal yang sudah ada")
	}

	// Validate room capacity
	var room models.Room
	if err := config.DB.First(&room, roomUUID).Error; err != nil {
		return nil, fmt.Errorf("ruangan tidak ditemukan")
	}
	if input.Attendees > room.Capacity {
		return nil, fmt.Errorf("jumlah peserta melebihi kapasitas ruangan")
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
		return nil, fmt.Errorf("gagal membuat booking")
	}

	// TODO: Implement email notification to user and admin in handler if needed

	return &booking, nil
}
