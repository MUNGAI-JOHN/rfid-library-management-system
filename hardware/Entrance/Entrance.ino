#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ==================== WI-FI CONFIGURATION ====================
const char* ssid     = "raspberrypi";       // Your Wi-Fi Name
const char* password = "raspberrypi";   // Your Wi-Fi Password

// Replace with your laptop's Local IPv4 Address and Backend Port
const char* serverEndpoint = "http://192.168.2.221:3000/api/auth/login";

// ==================== PIN DEFINITIONS ====================
#define RST_PIN         16    // Reset Pin for RFID
#define SS_PIN          5     // Chip Select (SDA) for Entrance RFID Reader
#define SERVO_PIN       13    // Signal pin for Entrance Gate Servo Motor

// Initialize Components
MFRC522 rfid(SS_PIN, RST_PIN);
Servo entranceGate;
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C Address 0x27, 16 Columns, 2 Rows

void setup() {
  Serial.begin(115200);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Library System");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize SPI & RFID Reader
  SPI.begin();
  rfid.PCD_Init();

  // Initialize Servo Gate
  ESP32PWM::allocateTimer(0);
  entranceGate.setPeriodHertz(50);
  entranceGate.attach(SERVO_PIN, 500, 2400);
  entranceGate.write(0); // Ensure gate is closed initially (0 degrees)

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Entrance Ready");
  lcd.setCursor(0, 1);
  lcd.print("Scan ID Card...");
}

void loop() {
  // Check if a new card is presented to Reader
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // 1. Convert Card UID to HEX String
  String cardUID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) cardUID += "0";
    cardUID += String(rfid.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();

  Serial.print("Card Scanned: ");
  Serial.println(cardUID);

  // Display Status on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Verifying Card..");

  // 2. Send HTTP POST to Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON Payload
    StaticJsonDocument<128> doc;
    doc["rfid"] = cardUID;
    String requestBody;
    serializeJson(doc, requestBody);

    // Execute POST Request
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);

      // Parse JSON Response from Node.js
      StaticJsonDocument<256> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);

      if (!error && responseDoc["success"] == true) {
        String msg = responseDoc["message"] | "Access Granted";
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Access Granted!");
        lcd.setCursor(0, 1);
        lcd.print(msg.substring(0, 16));

        // Open Entrance Gate Servo
        openGate();
      } else {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Access Denied!");
        lcd.setCursor(0, 1);
        lcd.print("Invalid Card");
        delay(2000);
      }
    } else {
      Serial.print("Error on HTTP Request: ");
      Serial.println(httpResponseCode);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Server Error");
      delay(2000);
    }

    http.end(); // Free network resources
  } else {
    Serial.println("WiFi Disconnected!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Error!");
    delay(2000);
  }

  // Reset LCD display state for next user
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Entrance Ready");
  lcd.setCursor(0, 1);
  lcd.print("Scan ID Card...");

  // Halt RFID reader to prevent continuous reading
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Function to open, hold, and close servo gate
void openGate() {
  entranceGate.write(90); // Open gate (rotate to 90 degrees)
  delay(3000);            // Hold open for 3 seconds for patron to step through
  entranceGate.write(0);  // Close gate back to original position
}