package services

import (
	"backendgo/models"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type EmailService struct {
	client *sendgrid.Client
	from   *mail.Email
}

func NewEmailService() *EmailService {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		log.Println("Warning: SENDGRID_API_KEY not set, email notifications will be disabled")
		return &EmailService{
			client: nil,
			from:   mail.NewEmail("Meeting Room System", os.Getenv("FROM_EMAIL")),
		}
	}

	client := sendgrid.NewSendClient(apiKey)
	fromEmail := os.Getenv("FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "fariziadam508@gmail.com"
	}

	return &EmailService{
		client: client,
		from:   mail.NewEmail("Meeting Room System", fromEmail),
	}
}

func (es *EmailService) SendBookingNotification(booking *models.Booking, room *models.Room, qrBase64 string) error {
	if es.client == nil {
		log.Println("Email service not configured, skipping notification")
		return nil
	}

	subject := "New Meeting Room Booking Confirmation"
	startTime := booking.StartTime.Format("Monday, 2 January 2006 at 15:04")
	endTime := booking.EndTime.Format("15:04")

	// Embed QR code as inline image (Content-ID: qr-code)
	qrImgTag := ""

	htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
				.detail { margin: 10px 0; }
				.label { font-weight: bold; color: #4F46E5; }
				.status { 
					display: inline-block; 
					padding: 4px 12px; 
					border-radius: 20px; 
					font-size: 12px; 
					font-weight: bold; 
					text-transform: uppercase;
				}
				.status.pending { background-color: #FEF3C7; color: #92400E; }
				.status.approved { background-color: #D1FAE5; color: #065F46; }
				.status.rejected { background-color: #FEE2E2; color: #991B1B; }
				.footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>📅 Meeting Room Booking</h1>
				</div>
				<div class="content">
					<h2>Hello %s!</h2>
					<p>Your meeting room booking has been successfully created.</p>
					
					<div class="detail">
						<span class="label">Room:</span> %s
					</div>
					<div class="detail">
						<span class="label">Date & Time:</span> %s - %s
					</div>
					<div class="detail">
						<span class="label">Purpose:</span> %s
					</div>
					<div class="detail">
						<span class="label">Attendees:</span> %d people
					</div>
					<div class="detail">
						<span class="label">Status:</span> 
						<span class="status %s">%s</span>
					</div>
					%s
					<div class="footer">
						<p>This is an automated notification from the Meeting Room Booking System.</p>
						<p>Booking ID: %s</p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`,
		booking.UserName,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		booking.Attendees,
		booking.Status,
		booking.Status,
		qrImgTag,
		booking.ID.String(),
	)

	plainTextContent := fmt.Sprintf(`
Meeting Room Booking Confirmation

Hello %s!

Your meeting room booking has been successfully created.

Room: %s
Date & Time: %s - %s
Purpose: %s
Attendees: %d people
Status: %s

Booking ID: %s

This is an automated notification from the Meeting Room Booking System.
	`,
		booking.UserName,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		booking.Attendees,
		booking.Status,
		booking.ID.String(),
	)

	to := mail.NewEmail(booking.UserName, booking.UserEmail)
	message := mail.NewSingleEmail(es.from, subject, to, plainTextContent, htmlContent)

	response, err := es.client.Send(message)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}

	if response.StatusCode >= 400 {
		log.Printf("Email send failed with status: %d, body: %s", response.StatusCode, response.Body)
		return fmt.Errorf("email send failed with status: %d", response.StatusCode)
	}

	log.Printf("Email notification sent successfully to %s", booking.UserEmail)
	return nil
}

// Fungsi baru: kirim email ke admin dengan konten yang sama
func (es *EmailService) SendBookingNotificationToAdmin(booking *models.Booking, room *models.Room, adminEmail string) error {
	if es.client == nil {
		log.Println("Email service not configured, skipping notification")
		return nil
	}

	subject := "New Meeting Room Booking Confirmation"
	startTime := booking.StartTime.Format("Monday, 2 January 2006 at 15:04")
	endTime := booking.EndTime.Format("15:04")

	htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
				.detail { margin: 10px 0; }
				.label { font-weight: bold; color: #4F46E5; }
				.status { 
					display: inline-block; 
					padding: 4px 12px; 
					border-radius: 20px; 
					font-size: 12px; 
					font-weight: bold; 
					text-transform: uppercase;
				}
				.status.pending { background-color: #FEF3C7; color: #92400E; }
				.status.approved { background-color: #D1FAE5; color: #065F46; }
				.status.rejected { background-color: #FEE2E2; color: #991B1B; }
				.footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>📅 Meeting Room Booking</h1>
				</div>
				<div class="content">
					<h2>Hello Admin!</h2>
					<p>A new meeting room booking has been created.</p>
					
					<div class="detail">
						<span class="label">Room:</span> %s
					</div>
					<div class="detail">
						<span class="label">Date & Time:</span> %s - %s
					</div>
					<div class="detail">
						<span class="label">Purpose:</span> %s
					</div>
					<div class="detail">
						<span class="label">Attendees:</span> %d people
					</div>
					<div class="detail">
						<span class="label">Status:</span> 
						<span class="status %s">%s</span>
					</div>
					<div class="detail">
						<span class="label">Booked By:</span> %s (%s)
					</div>
					
					<div class="footer">
						<p>This is an automated notification from the Meeting Room Booking System.</p>
						<p>Booking ID: %s</p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		booking.Attendees,
		booking.Status,
		booking.Status,
		booking.UserName,
		booking.UserEmail,
		booking.ID.String(),
	)

	plainTextContent := fmt.Sprintf(`
Meeting Room Booking Confirmation

A new meeting room booking has been created.

Room: %s
Date & Time: %s - %s
Purpose: %s
Attendees: %d people
Status: %s
Booked By: %s (%s)

Booking ID: %s

This is an automated notification from the Meeting Room Booking System.
	`,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		booking.Attendees,
		booking.Status,
		booking.UserName,
		booking.UserEmail,
		booking.ID.String(),
	)

	to := mail.NewEmail("Admin", adminEmail)
	message := mail.NewSingleEmail(es.from, subject, to, plainTextContent, htmlContent)

	response, err := es.client.Send(message)
	if err != nil {
		log.Printf("Failed to send admin email: %v", err)
		return err
	}

	if response.StatusCode >= 400 {
		log.Printf("Admin email send failed with status: %d, body: %s", response.StatusCode, response.Body)
		return fmt.Errorf("admin email send failed with status: %d", response.StatusCode)
	}

	log.Printf("Admin email notification sent successfully to %s", adminEmail)
	return nil
}

func (es *EmailService) SendBookingStatusUpdate(booking *models.Booking, room *models.Room, oldStatus string, qrBase64 string) error {
	if es.client == nil {
		log.Println("Email service not configured, skipping notification")
		return nil
	}

	subject := "Meeting Room Booking Status Update"
	startTime := booking.StartTime.Format("Monday, 2 January 2006 at 15:04")
	endTime := booking.EndTime.Format("15:04")

	// Embed QR code as inline image (Content-ID: qr-code)
	qrImgTag := ""
	if booking.Status == "approved" && qrBase64 != "" {
		qrImgTag = `<div class="detail"><span class="label">End Meeting QR Code:</span><br><img src="cid:qr-code" alt="QR Code" style="width:180px;height:180px;margin-top:8px;" /></div>`
	}

	htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
				.detail { margin: 10px 0; }
				.label { font-weight: bold; color: #4F46E5; }
				.status { 
					display: inline-block; 
					padding: 4px 12px; 
					border-radius: 20px; 
					font-size: 12px; 
					font-weight: bold; 
					text-transform: uppercase;
				}
				.status.pending { background-color: #FEF3C7; color: #92400E; }
				.status.approved { background-color: #D1FAE5; color: #065F46; }
				.status.rejected { background-color: #FEE2E2; color: #991B1B; }
				.footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>📅 Booking Status Update</h1>
				</div>
				<div class="content">
					<h2>Hello %s!</h2>
					<p>Your meeting room booking status has been updated.</p>
					
					<div class="detail">
						<span class="label">Room:</span> %s
					</div>
					<div class="detail">
						<span class="label">Date & Time:</span> %s - %s
					</div>
					<div class="detail">
						<span class="label">Purpose:</span> %s
					</div>
					<div class="detail">
						<span class="label">Previous Status:</span> 
						<span class="status %s">%s</span>
					</div>
					<div class="detail">
						<span class="label">New Status:</span> 
						<span class="status %s">%s</span>
					</div>
					%s
					<div class="footer">
						<p>This is an automated notification from the Meeting Room Booking System.</p>
						<p>Booking ID: %s</p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`,
		booking.UserName,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		oldStatus,
		oldStatus,
		booking.Status,
		booking.Status,
		qrImgTag,
		booking.ID.String(),
	)

	plainTextContent := fmt.Sprintf(`
Meeting Room Booking Status Update

Hello %s!

Your meeting room booking status has been updated.

Room: %s
Date & Time: %s - %s
Purpose: %s
Previous Status: %s
New Status: %s

Booking ID: %s

This is an automated notification from the Meeting Room Booking System.
	`,
		booking.UserName,
		room.Name,
		startTime,
		endTime,
		booking.Purpose,
		oldStatus,
		booking.Status,
		booking.ID.String(),
	)

	to := mail.NewEmail(booking.UserName, booking.UserEmail)
	message := mail.NewSingleEmail(es.from, subject, to, plainTextContent, htmlContent)

	// Attach QR code as inline image if available
	if booking.Status == "approved" && qrBase64 != "" {
		qrBytes, err := base64.StdEncoding.DecodeString(qrBase64)
		if err == nil {
			attachment := mail.NewAttachment()
			attachment.SetContent(base64.StdEncoding.EncodeToString(qrBytes))
			attachment.SetType("image/png")
			attachment.SetFilename("qr-code.png")
			attachment.SetDisposition("inline")
			attachment.SetContentID("qr-code")
			message.AddAttachment(attachment)
		}
	}

	response, err := es.client.Send(message)
	if err != nil {
		log.Printf("Failed to send status update email: %v", err)
		return err
	}

	if response.StatusCode >= 400 {
		log.Printf("Status update email send failed with status: %d, body: %s", response.StatusCode, response.Body)
		return fmt.Errorf("email send failed with status: %d", response.StatusCode)
	}

	log.Printf("Status update email sent successfully to %s", booking.UserEmail)
	return nil
}

// Kirim email OTP reset password
func (es *EmailService) SendOTPEmail(email, otp string) error {
	if es.client == nil {
		log.Println("Email service not configured, skipping OTP email")
		return nil
	}
	subject := "OTP Reset Password Admin"
	htmlContent := fmt.Sprintf(`
        <html><body>
        <h2>Permintaan Reset Password Admin</h2>
        <p>Kode OTP Anda:</p>
        <div style='font-size:2em; font-weight:bold; color:#4F46E5;'>%s</div>
        <p>Masukkan kode ini di halaman reset password. Berlaku selama 10 menit.</p>
        <br><small>Jika Anda tidak meminta reset password, abaikan email ini.</small>
        </body></html>`, otp)
	plainText := fmt.Sprintf("Kode OTP reset password Anda: %s\nBerlaku 10 menit. Jika tidak meminta reset password, abaikan email ini.", otp)
	to := mail.NewEmail("Admin", email)
	message := mail.NewSingleEmail(es.from, subject, to, plainText, htmlContent)
	response, err := es.client.Send(message)
	if err != nil {
		log.Printf("Failed to send OTP email: %v", err)
		return err
	}
	if response.StatusCode >= 400 {
		log.Printf("OTP email send failed with status: %d, body: %s", response.StatusCode, response.Body)
		return fmt.Errorf("OTP email send failed with status: %d", response.StatusCode)
	}
	log.Printf("OTP email sent successfully to %s", email)
	return nil
}
