/**
 * Belvedere Family Community Center Booking System
 * Complete Google Apps Script backend implementation
 * Author: System Administrator
 * Contact: adminbelvedere@belvedere.org
 */

// Configuration Constants
const MANAGER_EMAIL = 'adminbelvedere@belvedere.org'; // Update with actual email
const CALENDAR_ID = 'primary'; // Use primary calendar or specific calendar ID
const SHEET_NAME = 'Belvedere Bookings';
const CONFIG_SHEET_NAME = 'Config';

// Default configuration
const DEFAULT_CONFIG = {
  operatingHours: {
    start: '08:00',
    end: '21:00'
  },
  minDaysAdvance: 3,
  allowedWeekdays: [1, 2, 3, 4, 5, 6, 0], // Monday to Sunday
  holidays: [],
  emailTemplates: {
    confirmation: {
      subject: 'Booking Confirmation - Belvedere Family Community Center',
      body: `Dear {name},

Your booking has been confirmed and is pending approval!

📍 Belvedere Family Community Center
📧 Contact: adminbelvedere@belvedere.org
📞 Phone: Contact us for inquiries
📍 Address: 723 South Broadway, Tarrytown, NY 10592

Booking Details:
🏢 Spot: {spotName}
📅 Date: {date}
⏰ Time: {startTime} - {endTime}
📝 Note: {note}
🔄 Frequency: {frequency}

Your booking is currently PENDING approval. You will receive another email once it's been reviewed by our team.

Thank you for choosing Belvedere Family Community Center!

Best regards,
Belvedere Family Team`
    },
    approval: {
      subject: 'Booking Approved - Belvedere Family Community Center',
      body: `Dear {name},

Great news! Your booking has been APPROVED.

Booking Details:
🏢 Spot: {spotName}
📅 Date: {date}
⏰ Time: {startTime} - {endTime}

Please arrive on time and follow all facility guidelines.

Best regards,
Belvedere Family Team`
    },
    rejection: {
      subject: 'Booking Update - Belvedere Family Community Center',
      body: `Dear {name},

We regret to inform you that your booking request has been declined.

Booking Details:
🏢 Spot: {spotName}
📅 Date: {date}
⏰ Time: {startTime} - {endTime}

Reason: {comments}

Please feel free to contact us at adminbelvedere@belvedere.org for alternative arrangements.

Best regards,
Belvedere Family Team`
    },
    managerNotification: {
      subject: 'New Booking Request - {spotName}',
      body: `A new booking request has been submitted:

Booking Details:
🏢 Spot: {spotName}
📅 Date: {date}
⏰ Time: {startTime} - {endTime}
👤 Name: {name}
📧 Email: {email}
📞 Phone: {phone}
📝 Note: {note}
🔄 Frequency: {frequency}

Please review and approve/reject this booking in the admin panel.

Booking made at: {timestamp}`
    }
  }
};

/**
 * Serves the HTML interface for the booking system
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Belvedere Family Community Center - Booking System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Includes external HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Gets the spots data with names and image URLs
 */
function getSpots() {
  const spots = [
    { name: 'Agora', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1ZCgGgcbROgd2F4md6al8WzaDMOWjTxMP/view?usp=drive_link' },
    { name: 'White House', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1_AYp3OOfCP9vG5pYnJ8gFvIaTLKaU_fh/view?usp=drive_link' },
    { name: 'Training Center', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/19Gl4PmAZe-7OJENWgNn5_4UFzESeSWYD/view?usp=drive_link' },
    { name: 'Main Room', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1XqbddGKfMIxtaYcRoP0Ccu_m9jjGNIIy/view?usp=drive_link' },
    { name: 'Lounge', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1q9T8Ru5_03g3Rvtc5_76I6Hsj4s-WaYo/view?usp=drive_link' },
    { name: 'Kitchen', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1NyGBvfODklKFIUC2-M2DABoY6dZt_tB-/view?usp=drive_link' },
    { name: 'CSW Prayer Hall', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1qH-dySVtUUA04Lbcgrqnmqkk6MkVtEgM/view?usp=drive_link' },
    { name: 'Room A', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1Y1Io8q3-Jed791F3bJS826FOl-_IjvpT/view?usp=drive_link' },
    { name: 'Room D', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1ayjzPz0hRVp9pmye54wJbHVwHcNgIKvW/view?usp=drive_link' },
    { name: 'Room G', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1bI6um4gogML55y-YkD_cc-6_LD8ZDTNi/view?usp=drive_link' },
    { name: 'Baby Room A', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1wz_xCsQquODgKyJjSFCokoCaKHHawEKS/view?usp=drive_link' },
    { name: 'Baby Room B', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1_sWFD-7dIqaiGSD-DPiXJit8tLAdfys-/view?usp=drive_link' },
    { name: 'Belvedere Estate', category: 'Indoor', imageUrl: 'https://drive.google.com/file/d/1XVcl9hfohZ5mdrQvAkTcPthjhT5JhLlU/view?usp=drive_link' }
  ];
  
  return spots;
}

/**
 * Gets current system configuration
 */
function getConfig() {
  const config = PropertiesService.getScriptProperties().getProperty('systemConfig');
  if (config) {
    return JSON.parse(config);
  }
  
  // Return default config if none exists
  PropertiesService.getScriptProperties().setProperty('systemConfig', JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
}

/**
 * Updates system configuration
 */
function updateConfig(newConfig) {
  try {
    PropertiesService.getScriptProperties().setProperty('systemConfig', JSON.stringify(newConfig));
    return { success: true, message: 'Configuration updated successfully!' };
  } catch (error) {
    console.error('Error updating config:', error);
    return { success: false, message: 'Error updating configuration.' };
  }
}

/**
 * Validates and submits booking
 */
function submitBooking(bookingData) {
  try {
    const config = getConfig();
    
    // Validate booking data
    const validation = validateBooking(bookingData, config);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    // Save booking to appropriate month sheet
    const bookingResult = saveBooking(bookingData);
    if (!bookingResult.success) {
      return bookingResult;
    }
    
    // Create calendar event
    createCalendarEvent(bookingData);
    
    // Send confirmation email
    sendConfirmationEmail(bookingData);
    
    // Send manager notification
    sendManagerNotification(bookingData);
    
    return { 
      success: true, 
      message: 'Booking submitted successfully! You will receive a confirmation email and notification once approved.' 
    };
    
  } catch (error) {
    console.error('Error submitting booking:', error);
    return { 
      success: false, 
      message: 'An error occurred while processing your booking. Please try again.' 
    };
  }
}

/**
 * Validates booking according to system rules
 */
function validateBooking(bookingData, config) {
  const { date, startTime, endTime, name, email, phone, frequency } = bookingData;
  
  // Check required fields
  if (!date || !startTime || !endTime || !name || !email || !phone || !frequency) {
    return { valid: false, message: 'Please fill in all required fields.' };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  
  // Check booking date advance requirement
  const bookingDate = new Date(date);
  const today = new Date();
  const minAdvanceMs = config.minDaysAdvance * 24 * 60 * 60 * 1000;
  const requiredDate = new Date(today.getTime() + minAdvanceMs);
  
  if (bookingDate < requiredDate) {
    return { valid: false, message: `Bookings must be made at least ${config.minDaysAdvance} days in advance.` };
  }
  
  // Check if booking day is allowed
  const bookingDayOfWeek = bookingDate.getDay();
  if (!config.allowedWeekdays.includes(bookingDayOfWeek)) {
    return { valid: false, message: 'Bookings are not allowed on this day of the week.' };
  }
  
  // Check if date is a holiday
  const dateString = date;
  if (config.holidays.includes(dateString)) {
    return { valid: false, message: 'Bookings are not allowed on this holiday.' };
  }
  
  // Validate operating hours
  const startHour = parseInt(startTime.split(':')[0]);
  const startMinute = parseInt(startTime.split(':')[1]);
  const endHour = parseInt(endTime.split(':')[0]);
  const endMinute = parseInt(endTime.split(':')[1]);
  
  const configStartHour = parseInt(config.operatingHours.start.split(':')[0]);
  const configStartMinute = parseInt(config.operatingHours.start.split(':')[1]);
  const configEndHour = parseInt(config.operatingHours.end.split(':')[0]);
  const configEndMinute = parseInt(config.operatingHours.end.split(':')[1]);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const configStartTotalMinutes = configStartHour * 60 + configStartMinute;
  const configEndTotalMinutes = configEndHour * 60 + configEndMinute;
  
  if (startTotalMinutes < configStartTotalMinutes || endTotalMinutes > configEndTotalMinutes) {
    return { valid: false, message: `Bookings are only allowed between ${config.operatingHours.start} and ${config.operatingHours.end}.` };
  }
  
  // Check if start time is before end time
  if (startTime >= endTime) {
    return { valid: false, message: 'Start time must be before end time.' };
  }
  
  return { valid: true };
}

/**
 * Saves booking to the appropriate month sheet
 */
function saveBooking(bookingData) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const bookingDate = new Date(bookingData.date);
    const month = bookingDate.toLocaleString('default', { month: 'long' });
    
    let sheet = spreadsheet.getSheetByName(month);
    if (!sheet) {
      sheet = createMonthSheet(spreadsheet, month);
    }
    
    const timestamp = new Date();
    const row = [
      bookingData.spotName,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime,
      bookingData.name,
      bookingData.email,
      bookingData.phone,
      bookingData.note || '',
      bookingData.frequency,
      timestamp,
      'Pending',
      '', // Comments
      '' // Approved/Rejected by
    ];
    
    sheet.appendRow(row);
    return { success: true };
    
  } catch (error) {
    console.error('Error saving booking:', error);
    return { success: false, message: 'Error saving booking to sheet.' };
  }
}

/**
 * Creates calendar event for booking
 */
function createCalendarEvent(bookingData) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}`);
    
    const event = calendar.createEvent(
      `${bookingData.spotName} - ${bookingData.name}`,
      startDateTime,
      endDateTime,
      {
        description: `Booking for ${bookingData.spotName}\n\nContact: ${bookingData.name}\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\nFrequency: ${bookingData.frequency}\n\nNote: ${bookingData.note || 'No additional notes'}`,
        location: '723 South Broadway, Tarrytown, NY 10592'
      }
    );
    
    return event;
    
  } catch (error) {
    console.error('Error creating calendar event:', error);
  }
}

/**
 * Sends confirmation email to user
 */
function sendConfirmationEmail(bookingData) {
  try {
    const config = getConfig();
    const template = config.emailTemplates.confirmation;
    
    const subject = template.subject;
    const body = template.body
      .replace(/{name}/g, bookingData.name)
      .replace(/{spotName}/g, bookingData.spotName)
      .replace(/{date}/g, bookingData.date)
      .replace(/{startTime}/g, bookingData.startTime)
      .replace(/{endTime}/g, bookingData.endTime)
      .replace(/{note}/g, bookingData.note || 'No additional notes')
      .replace(/{frequency}/g, bookingData.frequency);
    
    MailApp.sendEmail({
      to: bookingData.email,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Sends notification to manager
 */
function sendManagerNotification(bookingData) {
  try {
    const config = getConfig();
    const template = config.emailTemplates.managerNotification;
    
    const subject = template.subject
      .replace(/{spotName}/g, bookingData.spotName);
    
    const body = template.body
      .replace(/{name}/g, bookingData.name)
      .replace(/{spotName}/g, bookingData.spotName)
      .replace(/{date}/g, bookingData.date)
      .replace(/{startTime}/g, bookingData.startTime)
      .replace(/{endTime}/g, bookingData.endTime)
      .replace(/{email}/g, bookingData.email)
      .replace(/{phone}/g, bookingData.phone)
      .replace(/{note}/g, bookingData.note || 'No additional notes')
      .replace(/{frequency}/g, bookingData.frequency)
      .replace(/{timestamp}/g, new Date().toLocaleString());
    
    MailApp.sendEmail({
      to: MANAGER_EMAIL,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    console.error('Error sending manager notification:', error);
  }
}

/**
 * Approves or rejects a booking
 */
function updateBookingStatus(sheetName, row, status, comments, approvedBy) {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found.' };
    }
    
    // Update status, comments, and approved by
    sheet.getRange(row, 11).setValue(status); // Status column
    sheet.getRange(row, 12).setValue(comments || ''); // Comments column
    sheet.getRange(row, 13).setValue(approvedBy); // Approved/Rejected by column
    
    // Get booking data for email
    const bookingData = {
      name: sheet.getRange(row, 5).getValue(),
      email: sheet.getRange(row, 6).getValue(),
      spotName: sheet.getRange(row, 1).getValue(),
      date: sheet.getRange(row, 2).getValue(),
      startTime: sheet.getRange(row, 3).getValue(),
      endTime: sheet.getRange(row, 4).getValue(),
      comments: comments || ''
    };
    
    // Send appropriate email
    if (status === 'Approved') {
      sendApprovalEmail(bookingData);
    } else if (status === 'Rejected') {
      sendRejectionEmail(bookingData);
    }
    
    return { success: true, message: `Booking ${status.toLowerCase()} successfully!` };
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, message: 'Error updating booking status.' };
  }
}

/**
 * Sends approval email
 */
function sendApprovalEmail(bookingData) {
  try {
    const config = getConfig();
    const template = config.emailTemplates.approval;
    
    const subject = template.subject;
    const body = template.body
      .replace(/{name}/g, bookingData.name)
      .replace(/{spotName}/g, bookingData.spotName)
      .replace(/{date}/g, bookingData.date)
      .replace(/{startTime}/g, bookingData.startTime)
      .replace(/{endTime}/g, bookingData.endTime);
    
    MailApp.sendEmail({
      to: bookingData.email,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}

/**
 * Sends rejection email
 */
function sendRejectionEmail(bookingData) {
  try {
    const config = getConfig();
    const template = config.emailTemplates.rejection;
    
    const subject = template.subject;
    const body = template.body
      .replace(/{name}/g, bookingData.name)
      .replace(/{spotName}/g, bookingData.spotName)
      .replace(/{date}/g, bookingData.date)
      .replace(/{startTime}/g, bookingData.startTime)
      .replace(/{endTime}/g, bookingData.endTime)
      .replace(/{comments}/g, bookingData.comments);
    
    MailApp.sendEmail({
      to: bookingData.email,
      subject: subject,
      body: body
    });
    
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}

/**
 * Gets or creates the main spreadsheet
 */
function getOrCreateSpreadsheet() {
  let spreadsheet;
  
  try {
    const files = DriveApp.getFilesByName(SHEET_NAME);
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.openById(files.next().getId());
    } else {
      throw new Error('Spreadsheet not found');
    }
  } catch (error) {
    spreadsheet = SpreadsheetApp.create(SHEET_NAME);
  }
  
  return spreadsheet;
}

/**
 * Creates a month sheet with proper headers
 */
function createMonthSheet(spreadsheet, month) {
  const sheet = spreadsheet.insertSheet(month);
  
  const headers = [
    'Spot Name', 'Date', 'Start Time', 'End Time', 'Name', 'Email', 'Phone', 
    'Note', 'Frequency', 'Timestamp', 'Status', 'Comments', 'Approved/Rejected by'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#e8f4fd');
  headerRange.setFontColor('#1a73e8');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  return sheet;
}

/**
 * Gets pending bookings from all month sheets
 */
function getPendingBookings() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const pendingBookings = [];
    
    months.forEach(month => {
      const sheet = spreadsheet.getSheetByName(month);
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Find status column index
      const statusIndex = headers.indexOf('Status');
      if (statusIndex === -1) return;
      
      // Check each row for pending bookings
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[statusIndex] === 'Pending') {
          pendingBookings.push({
            sheetName: month,
            row: i + 1,
            spotName: row[0],
            date: row[1],
            startTime: row[2],
            endTime: row[3],
            name: row[4],
            email: row[5],
            phone: row[6],
            note: row[7],
            frequency: row[8],
            timestamp: row[9]
          });
        }
      }
    });
    
    return pendingBookings;
    
  } catch (error) {
    console.error('Error getting pending bookings:', error);
    return [];
  }
}

/**
 * Gets spreadsheet URL
 */
function getSpreadsheetUrl() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    return spreadsheet.getUrl();
  } catch (error) {
    console.error('Error getting spreadsheet URL:', error);
    return null;
  }
}

/**
 * Creates admin sidebar in Google Sheets
 */
function createAdminSidebar() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Belvedere Admin Panel')
      .setWidth(350);
    
    SpreadsheetApp.getUi().showSidebar(html);
    
  } catch (error) {
    console.error('Error creating admin sidebar:', error);
    SpreadsheetApp.getUi().alert('Error creating admin sidebar: ' + error.message);
  }
}

/**
 * Creates admin menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏢 Belvedere Admin')
    .addItem('📋 Admin Panel', 'createAdminSidebar')
    .addItem('🔄 Initialize System', 'initializeBelvedereBookingSystem')
    .addItem('⚙️ Open Settings', 'openFullAdminPanel')
    .addSeparator()
    .addItem('📊 Refresh Data', 'refreshAllData')
    .addToUi();
}

/**
 * Opens full admin panel in new window
 */
function openFullAdminPanel() {
  const url = ScriptApp.getService().getUrl().replace('/exec', '') + '?page=admin';
  const html = `
    <script>
      window.open('${url}', '_blank');
      google.script.host.close();
    </script>
  `;
  
  const htmlOutput = HtmlService.createHtml(html)
    .setWidth(200)
    .setHeight(100);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Opening Admin Panel...');
}

/**
 * Handles different page requests
 */
function doGet(e) {
  const page = e.parameter.page;
  
  if (page === 'admin') {
    return HtmlService.createTemplateFromFile('admin')
      .evaluate()
      .setTitle('Belvedere Admin Panel')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Default to main booking interface
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Belvedere Family Community Center - Booking System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Refreshes all data in the system
 */
function refreshAllData() {
  try {
    // Clear any cached data
    PropertiesService.getScriptProperties().deleteProperty('cachedConfig');
    
    // Reinitialize if needed
    const spreadsheet = getOrCreateSpreadsheet();
    
    SpreadsheetApp.getUi().alert('Data refreshed successfully!');
    
  } catch (error) {
    console.error('Error refreshing data:', error);
    SpreadsheetApp.getUi().alert('Error refreshing data: ' + error.message);
  }
}

/**
 * Initializes the complete booking system
 */
function initializeBelvedereBookingSystem() {
  try {
    // Create main spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    
    // Create month sheets
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    months.forEach(month => {
      if (!spreadsheet.getSheetByName(month)) {
        createMonthSheet(spreadsheet, month);
      }
    });
    
    // Initialize default configuration
    const config = getConfig();
    
    // Create admin sidebar
    createAdminSidebar();
    
    console.log('Belvedere Booking System initialized successfully!');
    console.log('Spreadsheet ID:', spreadsheet.getId());
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl(),
      message: 'System initialized successfully!'
    };
    
  } catch (error) {
    console.error('Error initializing system:', error);
    return {
      success: false,
      message: 'Error initializing system: ' + error.message
    };
  }
}
