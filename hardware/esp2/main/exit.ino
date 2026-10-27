// Exit Station Logic

enum ExitMode { EXIT_NO_BOOK, EXIT_WITH_BOOK };
ExitMode currentExitMode = EXIT_NO_BOOK;

enum ExitStep { STEP_EXIT_PATRON, STEP_EXIT_BOOK };
ExitStep currentExitStep = STEP_EXIT_PATRON;

String exitPatronRfid = "";
String exitBookRfid   = "";

unsigned long lastExitDebounce = 0;
const unsigned long exitDebounceDelay = 250;

void updateExitLCD(String line1, String line2) {
  lcdExit.clear();
  lcdExit.setCursor(0, 0);
  lcdExit.print(line1.substring(0, 16));
  lcdExit.setCursor(0, 1);
  lcdExit.print(line2.substring(0, 16));
}

void updateExitDisplayMode() {
  if (currentExitMode == EXIT_NO_BOOK) {
    updateExitLCD("MODE: with No Book", "Scan Patron Card");
  } else {
    if (currentExitStep == STEP_EXIT_PATRON) {
      updateExitLCD("MODE: With Book", "1.Scan Patron");
    } else {
      updateExitLCD("MODE: With Book", "2.Scan Book Tag");
    }
  }
}

void resetExitSession() {
  exitPatronRfid = "";
  exitBookRfid = "";
  currentExitStep = STEP_EXIT_PATRON;
  updateExitDisplayMode();
}

void sendExitScan() {
  updateExitLCD("Validating Exit", "Please Wait...");

  if (WiFi.status() != WL_CONNECTED) {
    updateExitLCD("WiFi Error!", "Disconnected");
    triggerErrorSignal();
    resetExitSession();
    return;
  }

  HTTPClient http;
  http.begin(exitScanEndpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["patronRfid"] = exitPatronRfid;
  if (currentExitMode == EXIT_WITH_BOOK && exitBookRfid.length() > 0) {
    doc["bookRfid"] = exitBookRfid;
  }

  String requestBody;
  serializeJson(doc, requestBody);
  Serial.println("\n[EXIT OUT] " + requestBody);

  int httpCode = http.POST(requestBody);
  Serial.printf("[EXIT IN] Status: %d\n", httpCode);

  if (httpCode == 200 || httpCode == 201) {
    updateExitLCD("Exit Granted!", "Opening Gate...");
    openGate();
  } else {
    updateExitLCD("Exit Denied!", "Check Server");
    triggerErrorSignal();
  }

  http.end();
  resetExitSession();
}

void setupExitStation() {
  resetExitSession();
}

void loopExitStation() {
  // Mode Button Toggle
  if (digitalRead(BTN_MODE_PIN) == LOW && (millis() - lastExitDebounce > exitDebounceDelay)) {
    lastExitDebounce = millis();
    soundBuzzer(80);

    currentExitMode = (currentExitMode == EXIT_NO_BOOK) ? EXIT_WITH_BOOK : EXIT_NO_BOOK;
    resetExitSession();
  }

  // Poll Exit RFID Reader
  String exitTag = readTagUID(rfidExit);
  if (exitTag != "") {
    soundBuzzer(100);

    if (currentExitMode == EXIT_NO_BOOK) {
      exitPatronRfid = exitTag;
      Serial.println("[EXIT RFID] Patron Scanned (No Book): " + exitPatronRfid);
      sendExitScan();
    } 
    else if (currentExitMode == EXIT_WITH_BOOK) {
      if (currentExitStep == STEP_EXIT_PATRON) {
        exitPatronRfid = exitTag;
        Serial.println("[EXIT RFID] Step 1 Patron: " + exitPatronRfid);
        currentExitStep = STEP_EXIT_BOOK;
        updateExitDisplayMode();
      } 
      else if (currentExitStep == STEP_EXIT_BOOK) {
        if (exitTag == exitPatronRfid) {
          updateExitLCD("Invalid Tag!", "Scan Book Tag");
          triggerErrorSignal();
          updateExitDisplayMode();
          return;
        }
        exitBookRfid = exitTag;
        Serial.println("[EXIT RFID] Step 2 Book: " + exitBookRfid);
        sendExitScan();
      }
    }
  }
}