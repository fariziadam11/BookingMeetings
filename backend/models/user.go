package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID             uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	Email          string     `gorm:"unique" json:"email"`
	Username       string     `gorm:"unique" json:"username"`
	Password       string     `json:"-"`
	Role           string     `json:"role"` // e.g. "admin"
	ResetOTP       string     `gorm:"column:reset_otp" json:"-"`
	ResetOTPExpiry *time.Time `gorm:"column:reset_otp_expiry" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}
