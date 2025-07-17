package models

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Room struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name        string    `gorm:"unique" json:"name"`
	Description string    `json:"description"`
	Capacity    int       `json:"capacity"`
}

func (r *Room) BeforeCreate(tx *gorm.DB) (err error) {
	fmt.Printf("BeforeCreate called for room: %s, current ID: %v\n", r.Name, r.ID)
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
		fmt.Printf("Generated UUID: %s\n", r.ID)
	}
	return
}
