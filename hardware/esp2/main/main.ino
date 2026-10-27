#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>

//Wi-Fi Credentials
const char* ssid     = "raspberrypi";
const char* password = "raspberrypi";

//API Endpoints
const char* exitScanEndpoint   = "http://192.168.137.1:5121/api/exit/scan";
const char* borrowEndpoint     = "http://192.168.137.1:5121/api/borrowing/borrow";

// Hardware Pins
// Exit Station Hardware
#define SS_EXIT_PIN    17   
#define RST_EXIT_PIN   16   
#define BTN_MODE_PIN   35   
#define BUZZER_PIN     13  
#define SERVO_PIN      33   
#define LED_GREEN      25   
#define LED_RED        12  

// Smart Shelf / Borrowing Hardware
#define SS_SHELF_PIN    4   
#define RST_SHELF_PIN   5   
#define BTN_NEXT_PIN   39   
#define BTN_SEL_PIN    36   

//Hardware Objects
MFRC522 rfidExit(SS_EXIT_PIN, RST_EXIT_PIN);
MFRC522 rfidShelf(SS_SHELF_PIN, RST_SHELF_PIN);

LiquidCrystal_I2C lcdExit(0x27, 16, 2);    // Exit Display
LiquidCrystal_I2C lcdShelf(0x26, 16, 2);  // Smart Shelf Display

Servo gateServo;

// Shared Helper Functions
void soundBuzzer(int durationMs) {
  digitalWrite(BUZZER_PIN, LOW);  // ON
  delay(durationMs);
  digitalWrite(BUZZER_PIN, HIGH); // OFF
}

void setLEDs(bool greenState, bool redState) {
  digitalWrite(LED_GREEN, greenState ? HIGH : LOW);
  digitalWrite(LED_RED, redState ? HIGH : LOW);
}

void openGate() {
  setLEDs(true, false);
  soundBuzzer(150);
  delay(100);
  soundBuzzer(150);

  gateServo.write(0); // Open gate
  delay(3000);         // Hold open for 3 seconds
  gateServo.write(130);  // Close gate
  
  setLEDs(false, false);
}

void triggerErrorSignal() {
  setLEDs(false, true);
  soundBuzzer(600);
  delay(1500);
  setLEDs(false, false);
}

String readTagUID(MFRC522 &reader) {
  if (!reader.PICC_IsNewCardPresent() || !reader.PICC_ReadCardSerial()) {
    return "";
  }
  
  String uidStr = "";
  for (byte i = 0; i < reader.uid.size; i++) {
    if (reader.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(reader.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  
  reader.PICC_HaltA();
  reader.PCD_StopCrypto1();
  return uidStr;
}

// Main Setup & Loop
void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH); 

  Serial.begin(115200);

  // Pin modes
  pinMode(BTN_MODE_PIN, INPUT);
  pinMode(BTN_NEXT_PIN, INPUT);
  pinMode(BTN_SEL_PIN, INPUT);
  
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH); // Keep buzzer OFF
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  setLEDs(false, false);

  gateServo.attach(SERVO_PIN);
  gateServo.write(130); // Locked angle

  // Initialize I2C Bus & LCDs
  Wire.begin();
  lcdExit.init();
  lcdExit.backlight();
  lcdShelf.init();
  lcdShelf.backlight();

  lcdExit.setCursor(0, 0); lcdExit.print("Exit Station");
  lcdExit.setCursor(0, 1); lcdExit.print("Connecting WiFi");
  lcdShelf.setCursor(0, 0); lcdShelf.print("Smart Shelf Station");
  lcdShelf.setCursor(0, 1); lcdShelf.print("Connecting WiFi");

  // Connect Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[SYSTEM] WiFi Connected!");

  // Initialize SPI & both RFID Readers
  SPI.begin();
  rfidExit.PCD_Init();
  rfidShelf.PCD_Init();

  setupExitStation();
  setupBorrowStation();
}

void loop() {
  loopExitStation();
  loopBorrowStation();
}