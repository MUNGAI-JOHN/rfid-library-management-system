#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

const char* ssid =
  "raspberrypi";

const char* password =
  "raspberrypi";


const char* backendHost =
  "192.168.137.1";

const int backendPort =
  5121;

const char* uploadPath =
  "/api/smartshelf/capture";


#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1

#define XCLK_GPIO_NUM      0

#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM        35
#define Y8_GPIO_NUM        34
#define Y7_GPIO_NUM        39
#define Y6_GPIO_NUM        36

#define Y5_GPIO_NUM        21
#define Y4_GPIO_NUM        19
#define Y3_GPIO_NUM        18
#define Y2_GPIO_NUM         5

#define VSYNC_GPIO_NUM     25
#define HREF_GPIO_NUM      23
#define PCLK_GPIO_NUM      22


WebServer server(80);


bool setupCamera() {

  camera_config_t config;

  config.ledc_channel =
    LEDC_CHANNEL_0;

  config.ledc_timer =
    LEDC_TIMER_0;

  config.pin_d0 =
    Y2_GPIO_NUM;

  config.pin_d1 =
    Y3_GPIO_NUM;

  config.pin_d2 =
    Y4_GPIO_NUM;

  config.pin_d3 =
    Y5_GPIO_NUM;

  config.pin_d4 =
    Y6_GPIO_NUM;

  config.pin_d5 =
    Y7_GPIO_NUM;

  config.pin_d6 =
    Y8_GPIO_NUM;

  config.pin_d7 =
    Y9_GPIO_NUM;

  config.pin_xclk =
    XCLK_GPIO_NUM;

  config.pin_pclk =
    PCLK_GPIO_NUM;

  config.pin_vsync =
    VSYNC_GPIO_NUM;

  config.pin_href =
    HREF_GPIO_NUM;

  config.pin_sccb_sda =
    SIOD_GPIO_NUM;

  config.pin_sccb_scl =
    SIOC_GPIO_NUM;

  config.pin_pwdn =
    PWDN_GPIO_NUM;

  config.pin_reset =
    RESET_GPIO_NUM;

  config.xclk_freq_hz =
    20000000;

  config.pixel_format =
    PIXFORMAT_JPEG;

  // ---------------------------------------------
  // NO PSRAM SAFE CONFIGURATION
  // ---------------------------------------------

  config.frame_size =
    FRAMESIZE_QVGA;

  config.jpeg_quality =
    12;

  config.fb_location =
    CAMERA_FB_IN_DRAM;

  config.fb_count =
    1;

  // ---------------------------------------------
  // INITIALIZE CAMERA
  // ---------------------------------------------

  esp_err_t err =
    esp_camera_init(
      &config
    );

  if (
    err != ESP_OK
  ) {

    Serial.printf(
      "[CAM FATAL] Camera init failed: 0x%x\n",
      err
    );

    return false;
  }

  Serial.println(
    "[CAM] Camera initialized successfully"
  );

  return true;
}

// =====================================================
// UPLOAD IMAGE TO BACKEND
// =====================================================

bool uploadImageToBackend(
  camera_fb_t* fb,
  String bookRfid,
  String patronRfid
) {

  Serial.println();
  Serial.println(
    "[UPLOAD] Connecting to backend..."
  );

  WiFiClient client;

  if (
    !client.connect(
      backendHost,
      backendPort
    )
  ) {

    Serial.println(
      "[UPLOAD ERROR] Backend connection failed"
    );

    return false;
  }

  // ---------------------------------------------
  // MULTIPART BOUNDARY
  // ---------------------------------------------

  String boundary =
    "----ESP32CAMBoundary";

  // ---------------------------------------------
  // MULTIPART HEADER
  // ---------------------------------------------

  String head = "";

  head +=
    "--" +
    boundary +
    "\r\n";

  head +=
    "Content-Disposition: form-data; name=\"bookRfid\"\r\n\r\n";

  head +=
    bookRfid +
    "\r\n";

  // ---------------------------------------------
  // PATRON RFID
  // ---------------------------------------------

  if (
    patronRfid.length() > 0
  ) {

    head +=
      "--" +
      boundary +
      "\r\n";

    head +=
      "Content-Disposition: form-data; name=\"patronRfid\"\r\n\r\n";

    head +=
      patronRfid +
      "\r\n";
  }

  // ---------------------------------------------
  // IMAGE FIELD
  // ---------------------------------------------

  head +=
    "--" +
    boundary +
    "\r\n";

  head +=
    "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n";

  head +=
    "Content-Type: image/jpeg\r\n\r\n";

  // ---------------------------------------------
  // MULTIPART END
  // ---------------------------------------------

  String tail =
    "\r\n--" +
    boundary +
    "--\r\n";

  // ---------------------------------------------
  // CONTENT LENGTH
  // ---------------------------------------------

  uint32_t totalLength =
    head.length() +
    fb->len +
    tail.length();

  Serial.print(
    "[UPLOAD] Image size: "
  );

  Serial.print(
    fb->len
  );

  Serial.println(
    " bytes"
  );

  Serial.print(
    "[UPLOAD] Total HTTP body: "
  );

  Serial.print(
    totalLength
  );

  Serial.println(
    " bytes"
  );

  // ---------------------------------------------
  // HTTP HEADERS
  // ---------------------------------------------

  client.printf(
    "POST %s HTTP/1.1\r\n",
    uploadPath
  );

  client.printf(
    "Host: %s:%d\r\n",
    backendHost,
    backendPort
  );

  client.printf(
    "Content-Type: multipart/form-data; boundary=%s\r\n",
    boundary.c_str()
  );

  client.printf(
    "Content-Length: %u\r\n",
    totalLength
  );

  client.println(
    "Connection: close"
  );

  client.println();

  // ---------------------------------------------
  // SEND MULTIPART HEADER
  // ---------------------------------------------

  client.print(
    head
  );

  // ---------------------------------------------
  // SEND IMAGE
  // ---------------------------------------------

  size_t imageLength =
    fb->len;

  size_t sent =
    0;

  const size_t CHUNK_SIZE =
    1024;

  while (
    sent < imageLength
  ) {

    size_t remaining =
      imageLength - sent;

    size_t chunk =
      remaining > CHUNK_SIZE
      ? CHUNK_SIZE
      : remaining;

    size_t written =
      client.write(
        fb->buf + sent,
        chunk
      );

    if (
      written == 0
    ) {

      Serial.println(
        "[UPLOAD ERROR] Image write failed"
      );

      client.stop();

      return false;
    }

    sent += written;

    delay(1);
  }

  // ---------------------------------------------
  // SEND MULTIPART TAIL
  // ---------------------------------------------

  client.print(
    tail
  );

  Serial.println(
    "[UPLOAD] Image transmitted"
  );

  // ---------------------------------------------
  // WAIT FOR RESPONSE
  // ---------------------------------------------

  unsigned long startTime =
    millis();

  while (
    !client.available() &&
    millis() - startTime < 10000
  ) {

    delay(10);
  }

  if (
    !client.available()
  ) {

    Serial.println(
      "[UPLOAD ERROR] Backend timeout"
    );

    client.stop();

    return false;
  }

  // ---------------------------------------------
  // READ HTTP STATUS LINE
  // ---------------------------------------------

  String statusLine =
    client.readStringUntil('\n');

  statusLine.trim();

  Serial.print(
    "[UPLOAD] Backend response: "
  );

  Serial.println(
    statusLine
  );

  bool success =
    statusLine.indexOf(
      "200"
    ) >= 0
    ||
    statusLine.indexOf(
      "201"
    ) >= 0;

  // ---------------------------------------------
  // READ REMAINING RESPONSE
  // ---------------------------------------------

  unsigned long responseStart =
    millis();

  while (
    client.connected() &&
    millis() - responseStart < 3000
  ) {

    while (
      client.available()
    ) {

      String line =
        client.readStringUntil('\n');

      Serial.println(
        "[BACKEND] " + line
      );
    }
  }

  client.stop();

  return success;
}

// =====================================================
// CAPTURE REQUEST
// =====================================================

void handleCaptureRequest() {

  Serial.println();
  Serial.println(
    "========================================="
  );

  Serial.println(
    "[CAM] Capture request received"
  );

  // ---------------------------------------------
  // CHECK BOOK RFID
  // ---------------------------------------------

  if (
    !server.hasArg(
      "bookRfid"
    )
  ) {

    Serial.println(
      "[CAM ERROR] Missing bookRfid"
    );

    server.send(
      400,
      "text/plain",
      "Missing bookRfid parameter"
    );

    return;
  }

  // ---------------------------------------------
  // READ PARAMETERS
  // ---------------------------------------------

  String bookRfid =
    server.arg(
      "bookRfid"
    );

  String patronRfid =
    "";

  if (
    server.hasArg(
      "patronRfid"
    )
  ) {

    patronRfid =
      server.arg(
        "patronRfid"
      );
  }

  Serial.print(
    "[CAM] Book RFID: "
  );

  Serial.println(
    bookRfid
  );

  Serial.print(
    "[CAM] Patron RFID: "
  );

  Serial.println(
    patronRfid
  );

  // ---------------------------------------------
  // GET CAMERA FRAME
  // ---------------------------------------------

  Serial.println(
    "[CAM] Capturing image..."
  );

  camera_fb_t* fb =
    esp_camera_fb_get();

  if (
    !fb
  ) {

    Serial.println(
      "[CAM ERROR] Camera capture failed"
    );

    server.send(
      500,
      "text/plain",
      "Camera Frame Capture Failed"
    );

    return;
  }

  Serial.print(
    "[CAM] Frame captured: "
  );

  Serial.print(
    fb->len
  );

  Serial.println(
    " bytes"
  );

  // ---------------------------------------------
  // UPLOAD
  // ---------------------------------------------

  bool uploadSuccess =
    uploadImageToBackend(
      fb,
      bookRfid,
      patronRfid
    );

  // ---------------------------------------------
  // RETURN CAMERA FRAME
  // ---------------------------------------------

  esp_camera_fb_return(
    fb
  );

  // ---------------------------------------------
  // RESPONSE
  // ---------------------------------------------

  if (
    uploadSuccess
  ) {

    Serial.println(
      "[CAM SUCCESS] Image uploaded successfully"
    );

    server.send(
      200,
      "application/json",
      "{\"success\":true,\"message\":\"Image uploaded successfully\"}"
    );

  } else {

    Serial.println(
      "[CAM ERROR] Image upload failed"
    );

    server.send(
      502,
      "application/json",
      "{\"success\":false,\"message\":\"Backend upload failed\"}"
    );
  }

  Serial.println(
    "========================================="
  );
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(
    115200
  );

  delay(1000);

  Serial.println();
  Serial.println(
    "========================================="
  );

  Serial.println(
    "        SMART SHELF ESP32-CAM"
  );

  Serial.println(
    "========================================="
  );

  // ---------------------------------------------
  // CAMERA
  // ---------------------------------------------

  if (
    !setupCamera()
  ) {

    Serial.println(
      "[FATAL] Camera initialization failed"
    );

    while (true) {

      delay(1000);
    }
  }

  // ---------------------------------------------
  // WIFI
  // ---------------------------------------------

  WiFi.begin(
    ssid,
    password
  );

  Serial.print(
    "[WIFI] Connecting"
  );

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println(
    "[WIFI] Connected!"
  );

  Serial.print(
    "[CAM] Local IP Address: "
  );

  Serial.println(
    WiFi.localIP()
  );

  // ---------------------------------------------
  // WEB SERVER
  // ---------------------------------------------

  server.on(
    "/capture",
    HTTP_GET,
    handleCaptureRequest
  );

  server.begin();

  Serial.println(
    "[CAM] Web server started"
  );

  Serial.println(
    "[CAM] Waiting for capture requests..."
  );
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  server.handleClient();
}