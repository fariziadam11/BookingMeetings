package handlers

import (
	"backendgo/config"
	"backendgo/models"
	"fmt"
	"net/http"
	"time"

	"backendgo/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("your_secret_key")

type RegisterInput struct {
	Email    string `json:"email" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Claims struct {
	ID   uuid.UUID `json:"id"`
	Role string    `json:"role"`
	jwt.RegisteredClaims
}

type ForgotPasswordInput struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordInput struct {
	Email       string `json:"email" binding:"required,email"`
	OTP         string `json:"otp" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// RegisterAdmin godoc
// @Summary Register admin
// @Description Register a new admin user
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   input  body  RegisterInput  true  "Admin registration info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/auth/register [post]
func RegisterAdmin(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to hash password", "data": nil})
		return
	}

	user := models.User{Email: input.Email, Username: input.Username, Password: string(hashedPassword), Role: "admin"}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Username already exists", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Admin registered successfully", "data": nil})
}

// LoginAdmin godoc
// @Summary Login admin
// @Description Authenticate admin and return JWT token
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   input  body  LoginInput  true  "Admin login info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/auth/login [post]
func LoginAdmin(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	var user models.User
	if err := config.DB.Where("username = ? AND role = ?", input.Username, "admin").First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid credentials", "data": nil})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid credentials", "data": nil})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		ID:   user.ID,
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to generate token", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Login successful", "data": gin.H{"token": tokenString}})
}

// ForgotPassword godoc
// @Summary Forgot password (admin)
// @Description Request OTP for admin password reset
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   input  body  ForgotPasswordInput  true  "Forgot password info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/auth/forgot-password [post]
func ForgotPassword(c *gin.Context) {
	var input ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ? AND role = ?", input.Email, "admin").First(&user).Error; err != nil {
		// Untuk keamanan, selalu response sukses walau email tidak ditemukan
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Jika email terdaftar, OTP telah dikirim."})
		return
	}

	// Generate OTP 6 digit
	otp := fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	expiry := time.Now().Add(10 * time.Minute)
	user.ResetOTP = otp
	user.ResetOTPExpiry = &expiry
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan OTP", "data": nil})
		return
	}

	// Kirim OTP ke email
	emailService := c.MustGet("emailService").(*services.EmailService)
	go emailService.SendOTPEmail(user.Email, otp)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Jika email terdaftar, OTP telah dikirim."})
}

// ResetPassword godoc
// @Summary Reset password (admin)
// @Description Reset admin password using OTP
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   input  body  ResetPasswordInput  true  "Reset password info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/auth/reset-password [post]
func ResetPassword(c *gin.Context) {
	var input ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "data": nil})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ? AND role = ?", input.Email, "admin").First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "OTP tidak valid atau sudah expired", "data": nil})
		return
	}

	if user.ResetOTP == "" || user.ResetOTP != input.OTP || user.ResetOTPExpiry == nil || user.ResetOTPExpiry.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "OTP tidak valid atau sudah expired", "data": nil})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal hash password baru", "data": nil})
		return
	}
	user.Password = string(hashedPassword)
	user.ResetOTP = ""
	user.ResetOTPExpiry = nil
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal update password", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password berhasil direset. Silakan login dengan password baru."})
}
