#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ==================== WI-FI & BACKEND CONFIGURATION ====================
const char* ssid     = "raspberrypi";       // Your Wi-Fi Name
const char* password = "raspberrypi";   // Your Wi-Fi Password

// Replace 192.168.1.50 with your laptop's Local IPv4 Address
const char* serverEndpoint = "http://192.168.1.50:3000/api/exit/verify";

// ==================== PIN DEFINITIONS ====================
#define RST_PIN         16    // Reset Pin for RFID
#define SS_PIN          5     // Chip Select (SDA) for Exit RFID Reader
#define SERVO_PIN       13    // Gate Servo Motor Signal
#define BUZZER_PIN      12    // Security Alarm Buzzer
#define GREEN_LED_PIN   27    // Access Granted LED
#define RED_LED_PIN     14    // Alarm / Access Denied LED

// Initialize Hardware Modules
MFRC522 rfid(SS_PIN, RST_PIN);
Servo exitGate;
LiquidCrystal_I2C lcd(0x27, 16, 2);

// State Machine Variables
String patronCardUID = "";
String bookTagUID = "";
enum ExitState { WAITING_FOR_PATRON, WAITING_FOR_BOOK };
ExitState currentState = WAITING_FOR_PATRON;

// Helper function declarations
String getScannedUID();
void verifyExitWithBackend(String patron, String book);
void resetToDefaultState();

void setup() {
  Serial.begin(115200);

  // Initialize Indicator Pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);

  // Initialize LCD Screen
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  // Connect to Local Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Initialize SPI & RFID Reader
  SPI.begin();
  rfid.PCD_Init();

  // Initialize Servo Motor
  ESP32PWM::allocateTimer(0);
  exitGate.setPeriodHertz(50);
  exitGate.attach(SERVO_PIN, 500, 2400);
  exitGate.write(0); // Ensure gate is locked initially (0 deg)

  resetToDefaultState();
}

void loop() {
  // Check if a card or tag is presented to the reader
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String scannedUID = getScannedUID();

  // STEP 1: Scan Patron ID
  if (currentState == WAITING_FOR_PATRON) {
    patronCardUID = scannedUID;
    currentState = WAITING_FOR_BOOK;

    Serial.print("Patron Card Scanned: ");
    Serial.println(patronCardUID);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Patron Verified!");
    lcd.setCursor(0, 1);
    lcd.print("Scan Book Tag...");

    digitalWrite(GREEN_LED_PIN, HIGH);
    delay(800);
    digitalWrite(GREEN_LED_PIN, LOW);

  // STEP 2: Scan Book Tag & Verify Exit
  } else if (currentState == WAITING_FOR_BOOK) {
    bookTagUID = scannedUID;

    Serial.print("Book Tag Scanned: ");
    Serial.println(bookTagUID);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Verifying Exit..");

    verifyExitWithBackend(patronCardUID, bookTagUID);
    resetToDefaultState();
  }

  // Stop current RFID read cycle
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Function to convert scanned raw bytes into a HEX string
String getScannedUID() {
  String uidStr = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(rfid.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  return uidStr;
}

// Function to HTTP POST payload to Laptop Backend
void verifyExitWithBackend(String patron, String book) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON Payload
    StaticJsonDocument<128> doc;
    doc["patronRfid"] = patron;
    doc["bookRfid"] = book;
    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);

      StaticJsonDocument<256> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);

      if (!error) {
        bool grantExit = responseDoc["grantExit"] | false;
        String msg = responseDoc["message"] | "Error";

        if (grantExit) {
          // --- ACCESS GRANTED SEQUENCE ---
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Exit Cleared!");
          lcd.setCursor(0, 1);
          lcd.print("Have a nice day!");

          digitalWrite(GREEN_LED_PIN, HIGH);
          exitGate.write(90); // Open Servo Gate
          delay(3500);        // Hold open for patron to pass
          exitGate.write(0);  // Close Servo Gate
          digitalWrite(GREEN_LED_PIN, LOW);

        } else {
          // --- ACCESS DENIED / ALARM SEQUENCE ---
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("ALARM TRIGGERED!");
          lcd.setCursor(0, 1);
          lcd.print(msg.substring(0, 16));

          digitalWrite(RED_LED_PIN, HIGH);
          
          // Sound alarm buzzer 3 times
          for (int i = 0; i < 3; i++) {
            digitalWrite(BUZZER_PIN, HIGH);
            delay(200);
            digitalWrite(BUZZER_PIN, LOW);
            delay(200);
          }
          delay(2000);
          digitalWrite(RED_LED_PIN, LOW);
        }
      }
    } else {
      Serial.print("Error sending POST: ");
      Serial.println(httpResponseCode);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Server Error!");
      delay(2000);
    }
    http.end();
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Error!");
    delay(2000);
  }
}

// Resets variables and display for the next patron
void resetToDefaultState() {
  patronCardUID = "";
  bookTagUID = "";
  currentState = WAITING_FOR_PATRON;

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Exit Station");
  lcd.setCursor(0, 1);
  lcd.print("Scan Patron ID..");
}