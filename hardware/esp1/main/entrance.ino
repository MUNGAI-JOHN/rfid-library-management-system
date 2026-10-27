//Entrance Display & Logic Functions

void updateEntranceDisplay(String line1, String line2) {
  if (line1.length() > 16) line1 = line1.substring(0, 16);
  if (line2.length() > 16) line2 = line2.substring(0, 16);

  lcdEntrance.clear();
  lcdEntrance.setCursor(0, 0);
  lcdEntrance.print(line1);
  lcdEntrance.setCursor(0, 1);
  lcdEntrance.print(line2);

  Serial.println("\n [ENTRANCE STATION]");
  Serial.print("| "); Serial.print(line1);
  for (int i = line1.length(); i < 16; i++) Serial.print(" ");
  Serial.println(" |");
  Serial.print("| "); Serial.print(line2);
  for (int i = line2.length(); i < 16; i++) Serial.print(" ");
  Serial.println(" |");
}

void sendEntranceScan(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    updateEntranceDisplay("WiFi Error!", "Check Router");
    return;
  }

  HTTPClient http;
  http.begin(entranceApiEndpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["patronRfid"] = uid;
  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("[Entrance API Raw]: ");
    Serial.println(response);

    StaticJsonDocument<512> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (!error) {
      bool alreadyInside = responseDoc["alreadyInside"] | false;
      const char* fullName = responseDoc["data"]["patron"]["fullName"] | "Patron";

      if (alreadyInside) {
        updateEntranceDisplay("Access Denied!", "Already Inside");
        digitalWrite(LED_RED, HIGH); 
        delay(2500);         
        digitalWrite(LED_RED, LOW);
      } else {
        updateEntranceDisplay("Welcome!", String(fullName));
        digitalWrite(LED_GREEN, HIGH);
        gateServo.write(0); 
        delay(3000);         
        gateServo.write(130);  
        digitalWrite(LED_GREEN, LOW);
      }
    }
  } else {
    updateEntranceDisplay("Access Denied!", "Invalid Patron");
    Serial.printf("[HTTP Error Code]: %d\n", httpResponseCode);
    digitalWrite(LED_RED, HIGH);
    delay(2500); 
    digitalWrite(LED_RED, LOW);
  }

  http.end();
  updateEntranceDisplay("Library Entrance", "Scan ID Card...");
}