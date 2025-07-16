
# 📦 Belvedere Booking System (Full Version without invoices)

## 🧩 Overview
This project is a complete booking system for the Belvedere Family Community center, built using:
- Google Apps Script (backend logic)
- Google Sheets (data storage & admin interface)
- Google Calendar (auto-add bookings)
- Google Sites (frontend, with Web App embedded via link)
- Google Drive (for spot images and logo)

> ❗ Note: this version excludes PDF invoice generation, but includes everything else.

---

## ✅ Key Features

### Frontend (Google Sites + Web App)
- Google Sites page with:
  - Header image/logo
  - Contact details:  
    ```
    Belvedere Family  
    723 South Broadway, Tarrytown, NY 10592  
    adminbelvedere
    ```
- Categories to group spots (e.g., indoor)
- List of indoor spots with name + image:
| Spot             | Image Link                                                                                  |
|------------------|---------------------------------------------------------------------------------------------|
| Agora           | https://drive.google.com/file/d/1ZCgGgcbROgd2F4md6al8WzaDMOWjTxMP/view?usp=drive_link       |
| White House     | https://drive.google.com/file/d/1_AYp3OOfCP9vG5pYnJ8gFvIaTLKaU_fh/view?usp=drive_link       |
| Training Center | https://drive.google.com/file/d/19Gl4PmAZe-7OJENWgNn5_4UFzESeSWYD/view?usp=drive_link       |
| Main Room       | https://drive.google.com/file/d/1XqbddGKfMIxtaYcRoP0Ccu_m9jjGNIIy/view?usp=drive_link       |
| Lounge          | https://drive.google.com/file/d/1q9T8Ru5_03g3Rvtc5_76I6Hsj4s-WaYo/view?usp=drive_link       |
| Kitchen         | https://drive.google.com/file/d/1NyGBvfODklKFIUC2-M2DABoY6dZt_tB-/view?usp=drive_link       |
| CSW Prayer Hall | https://drive.google.com/file/d/1qH-dySVtUUA04Lbcgrqnmqkk6MkVtEgM/view?usp=drive_link       |
| Room A          | https://drive.google.com/file/d/1Y1Io8q3-Jed791F3bJS826FOl-_IjvpT/view?usp=drive_link       |
| Room D          | https://drive.google.com/file/d/1ayjzPz0hRVp9pmye54wJbHVwHcNgIKvW/view?usp=drive_link       |
| Room G          | https://drive.google.com/file/d/1bI6um4gogML55y-YkD_cc-6_LD8ZDTNi/view?usp=drive_link       |
| Baby Room A     | https://drive.google.com/file/d/1wz_xCsQquODgKyJjSFCokoCaKHHawEKS/view?usp=drive_link       |
| Baby Room B     | https://drive.google.com/file/d/1_sWFD-7dIqaiGSD-DPiXJit8tLAdfys-/view?usp=drive_link       |
| Belvedere Estate| https://drive.google.com/file/d/1XVcl9hfohZ5mdrQvAkTcPthjhT5JhLlU/view?usp=drive_link       |

- When clicking a spot → open dynamic booking form:
  - Spot name (pre-filled)
  - Date picker
  - Start & end time pickers
  - Name, email, phone
  - Note
  - Booking frequency (one-time, weekly, monthly)
- At the end, shows a summary of the booking before submitting
- “Reserve” button to send booking

📌 The Web App **must be embedded in Google Sites by its URL (iframe embed link)** so it auto-updates.  
Do *not* ask users to copy/paste HTML code.

---

## ⚙️ Backend & Admin

### Google Sheets
- Main sheet with 12 tabs (January to December)
- Columns:
  `Spot Name, Date, Start Time, End Time, Name, Email, Phone, Note, Frequency, Timestamp, Status (Pending/Approved/Rejected), Comments, Approved/Rejected by`

---

### Admin panel
- Custom sidebar/modal in Google Sheets:
  - Set operating hours (e.g., 8am–9pm)
  - Minimum days in advance (e.g., 3 days)
  - Allowed weekdays (Mon–Fri or Mon–Sun)
  - Holiday blocks
- Changes saved to PropertiesService or hidden config sheet
- Booking form validation uses these rules live (without republishing)

---

### Booking process
1. Validate input:
   - Only within operating hours
   - Booking at least X days in advance
   - Allowed weekday and not on blocked holidays
2. Save booking in the correct month's sheet
3. Create event in Google Calendar
4. Send confirmation email to user
5. Send notification email to manager

---

### Booking approval
- In the Google Sheet, admin sees “Pending” status
- Click approve/reject button:
  - Changes status
  - Sends approval/rejection email to user (email templates editable via admin panel or hidden sheet)
  - Records who approved/rejected and internal comment

---

## 📧 Emails
- Confirmation email to user
- Notification email to manager
- Approval/rejection email (customizable)

Sender: `adminbelvedere`

---

## 🚀 Setup
- Script function to create Google Sheet structure with columns & config
- Deploy Web App (exec URL)
- Embed Web App in Google Sites via iframe URL

---

## 🎯 Goals
Dynamic, user-friendly booking system:
- Easy to configure from admin panel
- Automatic updates in frontend
- Calendar integration
- Clear, centralized data in Google Sheets

No PDF invoices included in this version.

---
