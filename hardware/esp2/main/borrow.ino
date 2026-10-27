// Smart Shelf / Borrowing Station Logic

enum ShelfState { MENU, SCAN_PATRON, SCAN_BOOK, CONFIRM_BORROW, SUBMITTING };
ShelfState currentShelfState = MENU;

int menuIndex = 0;
const int maxMenuItems = 2;
const char* menuItems[] = { "1. Borrow Book", "2. Reset System" };

String shelfPatronRfid = "";
String shelfBookRfid   = "";

unsigned long lastShelfDebounce = 0;
const unsigned long shelfDebounceDelay = 250;

void updateShelfLCD(String line1, String line2) {
  lcdShelf.clear();
  lcdShelf.setCursor(0, 0);
  lcdShelf.print(line1.substring(0, 16));
  lcdShelf.setCursor(0, 1);
  lcdShelf.print(line2.substring(0, 16));
}

void displayShelfMenu() {
  updateShelfLCD("Smart Shelf Menu", menuItems[menuIndex]);
}

void resetShelfSession() {
  shelfPatronRfid = "";
  shelfBookRfid = "";
  currentShelfState = MENU;
  menuIndex = 0;
  displayShelfMenu();
}

void sendBorrowRequest() {
  updateShelfLCD("Sending Request", "Please Wait...");
  
  if (WiFi.status() != WL_CONNECTED) {
    updateShelfLCD("Error:", "WiFi Disconnected");
    delay(2000);
    resetShelfSession();
    return;
  }

  HTTPClient http;
  http.begin(borrowEndpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["patronRfid"] = shelfPatronRfid;
  doc["bookRfid"]   = shelfBookRfid;
  
  String requestBody;
  serializeJson(doc, requestBody);
  Serial.println("\n[BORROW OUT] " + requestBody);

  int httpCode = http.POST(requestBody);
  Serial.printf("[BORROW IN] Status: %d\n", httpCode);

  if (httpCode == 200 || httpCode == 201) {
    updateShelfLCD("Success!", "Book Borrowed");
  } else {
    updateShelfLCD("Borrow Failed!", "Error: " + String(httpCode));
  }
  
  http.end();
  delay(3000);
  resetShelfSession();
}

void setupBorrowStation() {
  resetShelfSession();
}

void loopBorrowStation() {
  bool btnNext = (digitalRead(BTN_NEXT_PIN) == LOW);
  bool btnSel  = (digitalRead(BTN_SEL_PIN) == LOW);

  if ((btnNext || btnSel) && (millis() - lastShelfDebounce > shelfDebounceDelay)) {
    lastShelfDebounce = millis();

    if (currentShelfState == MENU) {
      if (btnNext) {
        menuIndex = (menuIndex + 1) % maxMenuItems;
        displayShelfMenu();
      } else if (btnSel) {
        if (menuIndex == 0) {
          currentShelfState = SCAN_PATRON;
          updateShelfLCD("Step 1 of 2:", "Scan Patron Card");
        } else if (menuIndex == 1) {
          resetShelfSession();
        }
      }
    } 
    else if (currentShelfState == CONFIRM_BORROW) {
      if (btnNext) {
        updateShelfLCD("Cancelled!", "Resetting...");
        delay(1500);
        resetShelfSession();
      } else if (btnSel) {
        currentShelfState = SUBMITTING;
        sendBorrowRequest();
      }
    }
  }

  // Poll Smart Shelf RFID Reader
  if (currentShelfState == SCAN_PATRON) {
    String shelfTag = readTagUID(rfidShelf);
    if (shelfTag != "") {
      shelfPatronRfid = shelfTag;
      Serial.println("[SHELF RFID] Patron Scanned: " + shelfPatronRfid);
      updateShelfLCD("Patron Saved!", "Scan Book Tag");
      delay(1500);
      currentShelfState = SCAN_BOOK;
      updateShelfLCD("Step 2 of 2:", "Scan Book Tag");
    }
  } 
  else if (currentShelfState == SCAN_BOOK) {
    String shelfTag = readTagUID(rfidShelf);
    if (shelfTag != "") {
      if (shelfTag == shelfPatronRfid) {
        updateShelfLCD("Invalid Tag!", "Scan Book Tag");
        delay(1000);
        updateShelfLCD("Step 2 of 2:", "Scan Book Tag");
        return;
      }
      shelfBookRfid = shelfTag;
      Serial.println("[SHELF RFID] Book Scanned: " + shelfBookRfid);
      currentShelfState = CONFIRM_BORROW;
      updateShelfLCD("Press Select to", "Confirm Borrow");
    }
  }
}