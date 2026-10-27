#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>

// Wi-Fi Configuration
const char* ssid     = "raspberrypi";
const char* password = "raspberrypi";

// Backend API Endpoints
const char* entranceApiEndpoint   = "http://192.168.137.1:5121/api/entrance/scan";
const char* patronScanEndpoint    = "http://192.168.137.1:5121/api/smartshelf/patron-scan";
const char* bookScanEndpoint      = "http://192.168.137.1:5121/api/smartshelf/book-scan";

//ESP32-CAM Configuration
const char* cameraIP = "192.168.137.92";

// Pin Definitions
// Entrance RFID Reader
#define SS_ENTRANCE_PIN   17
#define RST_ENTRANCE_PIN  16

// Smart Shelf RFID Reader
#define SS_SHELF_PIN      4
#define RST_SHELF_PIN     5

// Entrance Peripherals
#define LED_GREEN         25
#define SERVO_PIN         33
#define LED_RED           12

// Hardware Object
MFRC522 rfidEntrance(SS_ENTRANCE_PIN, RST_ENTRANCE_PIN);
MFRC522 rfidShelf(SS_SHELF_PIN, RST_SHELF_PIN);

LiquidCrystal_I2C lcdEntrance(0x27, 16, 2);
LiquidCrystal_I2C lcdShelf(0x26, 16, 2);

Servo gateServo;

//Smart Shelf Session State
String activePatronRfid = "";
String activePatronName = "";
bool activeRequiresPhoto = false;
unsigned long lastActivityTime = 0;
const unsigned long SESSION_TIMEOUT = 10000; // 10 seconds inactivity reset

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize Entrance Outputs
  pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_GREEN, LOW);
  
  pinMode(LED_RED, OUTPUT);
  digitalWrite(LED_RED, LOW);

  gateServo.attach(SERVO_PIN);
  gateServo.write(130);

  // Initialize Wire (I2C) and LCD Screens
  Wire.begin(); 
  
  lcdEntrance.init();
  lcdEntrance.backlight();

  lcdShelf.init();
  lcdShelf.backlight();

  updateEntranceDisplay("Library Entrance", "Connecting WiFi");
  updateShelfDisplay("Smart Shelf", "Connecting WiFi");

  // Connect to Local Wi-Fi Network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[SYSTEM] WiFi Connected!");

  // Initialize SPI bus and both RFID Readers
  SPI.begin();
  rfidEntrance.PCD_Init();
  rfidShelf.PCD_Init();

  // Display Ready Screens
  updateEntranceDisplay("Library Entrance", "Scan ID Card...");
  updateShelfIdleDisplay();

  Serial.println("\n--- Combined ESP32 Stations Fully Ready ---");
}

void loop() {
  // 1. Smart Shelf Session Timeout Check
  if (activePatronRfid != "" && (millis() - lastActivityTime > SESSION_TIMEOUT)) {
    activePatronRfid = "";
    activePatronName = "";
    activeRequiresPhoto = false;
    Serial.println("\n[SYSTEM] Smart Shelf Session Timed Out - Resetting Station");
    updateShelfIdleDisplay();
  }

  // 2. Poll Entrance RFID Reader
  if (rfidEntrance.PICC_IsNewCardPresent() && rfidEntrance.PICC_ReadCardSerial()) {
    String scannedUid = "";
    for (byte i = 0; i < rfidEntrance.uid.size; i++) {
      if (rfidEntrance.uid.uidByte[i] < 0x10) scannedUid += "0";
      scannedUid += String(rfidEntrance.uid.uidByte[i], HEX);
    }
    scannedUid.toUpperCase();

    Serial.print("\n[+] Entrance Scanned UID: ");
    Serial.println(scannedUid);

    updateEntranceDisplay("Validating Card", "Please wait...");
    sendEntranceScan(scannedUid);

    rfidEntrance.PICC_HaltA();
    rfidEntrance.PCD_StopCrypto1();
    delay(1000);
  }

  // 3. Poll Smart Shelf RFID Reader
  if (rfidShelf.PICC_IsNewCardPresent() && rfidShelf.PICC_ReadCardSerial()) {
    String scannedUid = "";
    for (byte i = 0; i < rfidShelf.uid.size; i++) {
      if (rfidShelf.uid.uidByte[i] < 0x10) scannedUid += "0";
      scannedUid += String(rfidShelf.uid.uidByte[i], HEX);
    }
    scannedUid.toUpperCase();

    Serial.print("\n[+] Smart Shelf Scanned UID: ");
    Serial.println(scannedUid);

    lastActivityTime = millis();

    if (activePatronRfid == "") {
      handlePatronScan(scannedUid);
    } else {
      handleBookScan(scannedUid);
    }

    rfidShelf.PICC_HaltA();
    rfidShelf.PCD_StopCrypto1();
    delay(1500);

    updateShelfIdleDisplay();
  }
}