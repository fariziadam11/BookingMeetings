package handlers

import (
	"backendgo/config"
	"backendgo/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetRooms godoc
// @Summary Get all rooms
// @Description Get list of rooms with optional pagination and name filter
// @Tags room
// @Accept  json
// @Produce  json
// @Param   page   query  int  false  "Page number"
// @Param   limit  query  int  false  "Items per page"
// @Param   name   query  string  false  "Room name filter"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/rooms [get]
func GetRooms(c *gin.Context) {
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
	name := c.Query("name")

	var rooms []models.Room
	query := config.DB
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	if err := query.Offset((page - 1) * limit).Limit(limit).Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data ruangan", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data ruangan berhasil diambil", "data": rooms})
}

// GetRoomDetail godoc
// @Summary Get room detail
// @Description Get detail of a room by ID
// @Tags room
// @Accept  json
// @Produce  json
// @Param   id  path  string  true  "Room ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/rooms/{id} [get]
func GetRoomDetail(c *gin.Context) {
	id := c.Param("id")
	roomUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID ruangan tidak valid", "data": nil})
		return
	}

	var room models.Room
	if err := config.DB.First(&room, roomUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Ruangan tidak ditemukan", "data": nil})
		return
	}

	var bookings []models.Booking
	if err := config.DB.Where("room_id = ?", roomUUID).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data booking", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Detail ruangan berhasil diambil", "data": gin.H{"room": room, "bookings": bookings}})
}

type CreateRoomInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Capacity    int    `json:"capacity" binding:"required"`
}

// CreateRoom godoc
// @Summary Create room
// @Description Create a new room
// @Tags room
// @Accept  json
// @Produce  json
// @Param   input  body  CreateRoomInput  true  "Room info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/rooms [post]
func CreateRoom(c *gin.Context) {
	var input CreateRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	room := models.Room{
		Name:        input.Name,
		Description: input.Description,
		Capacity:    input.Capacity,
	}
	if err := config.DB.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal membuat ruangan", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ruangan berhasil dibuat", "data": room})
}

type UpdateRoomInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Capacity    int    `json:"capacity"`
}

// UpdateRoom godoc
// @Summary Update room
// @Description Update an existing room by ID
// @Tags room
// @Accept  json
// @Produce  json
// @Param   id     path  string  true  "Room ID"
// @Param   input  body  UpdateRoomInput  true  "Room info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/rooms/{id} [put]
func UpdateRoom(c *gin.Context) {
	id := c.Param("id")
	roomUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID ruangan tidak valid", "data": nil})
		return
	}

	var room models.Room
	if err := config.DB.First(&room, roomUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Ruangan tidak ditemukan", "data": nil})
		return
	}

	var input UpdateRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	if input.Name != "" {
		room.Name = input.Name
	}
	if input.Description != "" {
		room.Description = input.Description
	}
	if input.Capacity != 0 {
		room.Capacity = input.Capacity
	}

	if err := config.DB.Save(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memperbarui ruangan", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ruangan berhasil diperbarui", "data": room})
}

// DeleteRoom godoc
// @Summary Delete room
// @Description Delete a room by ID
// @Tags room
// @Accept  json
// @Produce  json
// @Param   id  path  string  true  "Room ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/rooms/{id} [delete]
func DeleteRoom(c *gin.Context) {
	id := c.Param("id")
	roomUUID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format ID ruangan tidak valid", "data": nil})
		return
	}

	var room models.Room
	if err := config.DB.First(&room, roomUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Ruangan tidak ditemukan", "data": nil})
		return
	}

	if err := config.DB.Delete(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menghapus ruangan", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ruangan berhasil dihapus", "data": nil})
}
