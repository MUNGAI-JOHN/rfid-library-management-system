//Smart Shelf Display, Camera & Business Logic Function

void updateShelfDisplay(String line1, String line2) {
  if (line1.length() > 16) line1 = line1.substring(0, 16);
  if (line2.length() > 16) line2 = line2.substring(0, 16);

  lcdShelf.clear();
  lcdShelf.setCursor(0, 0);
  lcdShelf.print(line1);
  lcdShelf.setCursor(0, 1);
  lcdShelf.print(line2);

  Serial.println("\n--- [SMART SHELF STATION] ---");
  Serial.print("| "); Serial.print(line1);
  for (int i = line1.length(); i < 16; i++) Serial.print(" ");
  Serial.println(" |");
  Serial.print("| "); Serial.print(line2);
  for (int i = line2.length(); i < 16; i++) Serial.print(" ");
  Serial.println(" |");
}

void updateShelfIdleDisplay() {
  if (activePatronRfid == "") {
    updateShelfDisplay("Smart Shelf", "Scan Patron Card");
  } else {
    updateShelfDisplay(activePatronName, "Scan Book Tag");
  }
}

String urlEncode(String value) {
  String encoded = "";
  char c;
  char hex[] = "0123456789ABCDEF";
  for (int i = 0; i < value.length(); i++) {
    c = value.charAt(i);
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
        c == '-' || c == '_' || c == '.' || c == '~') {
      encoded += c;
    } else {
      encoded += '%';
      encoded += hex[(c >> 4) & 0x0F];
      encoded += hex[c & 0x0F];
    }
  }
  return encoded;
}

bool triggerCameraCapture(String bookRfid, String patronRfid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[CAMERA] WiFi disconnected");
    return false;
  }

  String encodedBook = urlEncode(bookRfid);
  String encodedPatron = urlEncode(patronRfid);

  String url = "http://" + String(cameraIP) + "/capture?bookRfid=" + encodedBook + "&patronRfid=" + encodedPatron;

  Serial.println();
  Serial.println("[CAMERA] Triggering ESP32-CAM");
  Serial.print("[CAMERA] URL: ");
  Serial.println(url);

  HTTPClient http;
  http.setTimeout(15000);

  if (!http.begin(url)) {
    Serial.println("[CAMERA ERROR] HTTP begin failed");
    return false;
  }

  int responseCode = http.GET();
  Serial.print("[CAMERA] Response Code: ");
  Serial.println(responseCode);

  String response = http.getString();
  Serial.print("[CAMERA] Response: ");
  Serial.println(response);

  http.end();

  if (responseCode == 200) {
    Serial.println("[CAMERA SUCCESS] Capture completed");
    return true;
  }

  Serial.println("[CAMERA ERROR] Capture failed");
  return false;
}

void handlePatronScan(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    updateShelfDisplay("WiFi Error!", "Check Router");
    return;
  }

  updateShelfDisplay("Validating...", "Patron RFID");

  HTTPClient http;
  if (!http.begin(patronScanEndpoint)) {
    Serial.println("[HTTP ERROR] Could not connect to backend");
    updateShelfDisplay("Server Error", "Connection");
    delay(2000);
    return;
  }

  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["rfid_uid"] = uid;
  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("\n[HTTP OUT - Patron]");
  Serial.println(requestBody);

  int responseCode = http.POST(requestBody);
  Serial.print("[HTTP IN - Patron] Response Code: ");
  Serial.println(responseCode);

  if (responseCode == 200 || responseCode == 201) {
    String response = http.getString();
    Serial.println("[API Patron Response]");
    Serial.println(response);

    StaticJsonDocument<1024> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (error) {
      Serial.print("[JSON ERROR] ");
      Serial.println(error.c_str());
      updateShelfDisplay("Server Error", "Bad JSON");
      delay(2000);
      http.end();
      return;
    }

    const char* fullName = responseDoc["data"]["patron"]["fullName"] | "Patron";
    activeRequiresPhoto = responseDoc["data"]["requiresPhoto"] | false;
    activePatronRfid = uid;
    activePatronName = String(fullName);
    lastActivityTime = millis();

    Serial.println("\nPATRON SESSION");
    Serial.print("Patron RFID: "); Serial.println(activePatronRfid);
    Serial.print("Patron Name: "); Serial.println(activePatronName);
    Serial.print("Requires Photo: "); Serial.println(activeRequiresPhoto ? "YES" : "NO");

    updateShelfDisplay("Welcome!", activePatronName);
    delay(2000);

    if (activeRequiresPhoto) {
      updateShelfDisplay("Problematic", "Scan Book Tag");
    } else {
      updateShelfDisplay("Patron Linked", "Scan Book Tag");
    }
  } else {
    String response = http.getString();
    Serial.println("[API Patron Error]");
    Serial.println(response);

    activePatronRfid = "";
    activePatronName = "";
    activeRequiresPhoto = false;

    updateShelfDisplay("Access Denied!", "Invalid Patron");
    delay(2000);
    updateShelfIdleDisplay();
  }

  http.end();
}

void handleBookScan(String bookRfid) {
  if (WiFi.status() != WL_CONNECTED) {
    updateShelfDisplay("WiFi Error!", "Check Router");
    return;
  }

  if (bookRfid == activePatronRfid) {
    updateShelfDisplay("Patron Session", "Already Active");
    delay(1500);
    return;
  }

  updateShelfDisplay("Processing...", "Book RFID");

  HTTPClient http;
  if (!http.begin(bookScanEndpoint)) {
    Serial.println("[HTTP ERROR] Book endpoint unavailable");
    updateShelfDisplay("Server Error", "Connection");
    delay(2000);
    return;
  }

  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["bookRfid"]   = bookRfid;
  doc["patronRfid"] = activePatronRfid;
  
  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("\n[HTTP OUT - Book]");
  Serial.println(requestBody);

  int responseCode = http.POST(requestBody);
  Serial.print("[HTTP IN - Book] Response Code: ");
  Serial.println(responseCode);

  if (responseCode == 200 || responseCode == 201) {
    String response = http.getString();
    Serial.println("[API Book Response]");
    Serial.println(response);

    StaticJsonDocument<2048> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (error) {
      Serial.print("[JSON ERROR] ");
      Serial.println(error.c_str());
      updateShelfDisplay("Server Error", "Bad Response");
      delay(2000);
      http.end();
      return;
    }

    const char* action    = responseDoc["action"] | "Processed";
    const char* bookTitle = responseDoc["book"]["bookTitle"] | "Book";
    bool requiresPhoto    = activeRequiresPhoto;

    Serial.println("\n BOOK RESULT ");
    Serial.print("Action: "); Serial.println(action);
    Serial.print("Book: "); Serial.println(bookTitle);
    Serial.print("Patron: "); Serial.println(activePatronName);
    Serial.print("Requires Photo: "); Serial.println(requiresPhoto ? "YES" : "NO");

    if (!requiresPhoto) {
      updateShelfDisplay("Book Processed", "Success");
      delay(2000);
      updateShelfDisplay("Book:", String(bookTitle));
      delay(2500);
    } else {
      updateShelfDisplay("Photo Required", "Please Wait");
      delay(1000);

      Serial.println("\n[SYSTEM] Problematic transaction.");
      Serial.println("[SYSTEM] Photo is required.");
      Serial.println("[SYSTEM] Requesting camera capture...");

      bool cameraSuccess = triggerCameraCapture(bookRfid, activePatronRfid);

      if (cameraSuccess) {
        Serial.println("[SYSTEM] PHOTO CAPTURE SUCCESS");
        updateShelfDisplay("Photo Captured", "Transaction OK");
        delay(2500);
      } else {
        Serial.println("[SYSTEM] PHOTO CAPTURE FAILED");
        updateShelfDisplay("Camera Error", "Try Again");
        delay(2500);
      }
    }
  } else {
    String response = http.getString();
    Serial.println("\n[API Book Error]");
    Serial.println(response);

    updateShelfDisplay("Book Scan Error", "Check Server");
    delay(2000);
  }

  http.end();
}