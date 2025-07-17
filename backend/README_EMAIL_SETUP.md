# Email Notification Setup

Sistem ini menggunakan SendGrid untuk mengirim email notification ketika ada booking room meeting baru atau status booking berubah.

## Setup SendGrid

### 1. Daftar SendGrid Account
- Kunjungi [SendGrid](https://sendgrid.com/)
- Daftar account gratis (100 email/hari)
- Verifikasi email Anda

### 2. Dapatkan API Key
1. Login ke SendGrid Dashboard
2. Buka menu **Settings** > **API Keys**
3. Klik **Create API Key**
4. Pilih **Restricted Access** dan centang **Mail Send**
5. Copy API Key yang diberikan

### 3. Setup Environment Variables

Buat file `.env` di folder `backend/` dengan isi:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bookingdb

# JWT Configuration
JWT_SECRET=your-secret-key-here

# SendGrid Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=noreply@yourdomain.com

# Server Configuration
PORT=8080
```

### 4. Verifikasi Domain (Opsional)
Untuk deliverability yang lebih baik:
1. Di SendGrid Dashboard, buka **Settings** > **Sender Authentication**
2. Verifikasi domain Anda
3. Update `FROM_EMAIL` dengan email domain yang sudah diverifikasi

## Fitur Email Notification

### 1. Booking Baru
- Email dikirim otomatis ketika booking baru dibuat
- Berisi detail booking: ruangan, waktu, tujuan, peserta, status
- Template HTML yang responsif dan menarik

### 2. Status Update
- Email dikirim ketika status booking berubah (approved/rejected)
- Menampilkan status lama dan baru
- Memberikan informasi yang jelas kepada user

### 3. Template Email
- Design modern dengan warna yang konsisten
- Responsive untuk mobile dan desktop
- Plain text fallback untuk email client lama

## Testing

### Test Email Tanpa SendGrid
Jika `SENDGRID_API_KEY` tidak diset, sistem akan:
- Log warning bahwa email service tidak dikonfigurasi
- Tetap berfungsi normal tanpa mengirim email
- Tidak mengganggu flow aplikasi

### Test dengan SendGrid
1. Set environment variable `SENDGRID_API_KEY`
2. Buat booking baru
3. Cek email inbox untuk konfirmasi
4. Approve/reject booking untuk test status update

## Troubleshooting

### Email tidak terkirim
1. Cek API Key SendGrid
2. Cek log aplikasi untuk error message
3. Pastikan `FROM_EMAIL` sudah benar
4. Cek SendGrid Dashboard untuk delivery status

### Rate Limiting
- SendGrid free tier: 100 email/hari
- Jika melebihi limit, email akan gagal terkirim
- Upgrade ke paid plan untuk limit lebih tinggi

## Alternatif Email Service

Jika tidak ingin menggunakan SendGrid, bisa mengganti dengan:

### 1. Resend
```go
// Install: go get github.com/resendlabs/resend-go
// Update email service untuk menggunakan Resend
```

### 2. SMTP Gmail
```go
// Gunakan net/smtp package
// Setup SMTP dengan Gmail
```

### 3. AWS SES
```go
// Install: go get github.com/aws/aws-sdk-go
// Setup AWS SES untuk email delivery
```

## Security Best Practices

1. **Jangan commit API key** ke repository
2. **Gunakan environment variables** untuk konfigurasi
3. **Validasi email** sebelum mengirim
4. **Rate limiting** untuk mencegah spam
5. **Logging** untuk monitoring email delivery 