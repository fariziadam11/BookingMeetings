package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Booking struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	RoomID      uuid.UUID `json:"room_id" gorm:"type:char(36);column:room_id"`
	UserName    string    `json:"user_name" gorm:"column:user_name"`
	UserEmail   string    `json:"user_email" gorm:"column:user_email"`
	Purpose     string    `json:"purpose" gorm:"column:purpose"`
	Attendees   int       `json:"attendees" gorm:"column:attendees"`
	StartTime   time.Time `json:"start_time" gorm:"column:start_time"`
	EndTime     time.Time `json:"end_time" gorm:"column:end_time"`
	Status      string    `json:"status" gorm:"column:status"`
	QRCodeToken string    `json:"qr_code_token" gorm:"column:qr_code_token"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`

	// Add relationship to Room
	Room Room `json:"room,omitempty" gorm:"foreignKey:RoomID;references:ID"`
}

func (Booking) TableName() string {
	return "bookings"
}

func (b *Booking) BeforeCreate(tx *gorm.DB) (err error) {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	if b.CreatedAt.IsZero() {
		b.CreatedAt = time.Now()
	}
	return
}
