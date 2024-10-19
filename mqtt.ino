#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHTPIN 4      // Pin nối với cảm biến DHT
#define DHTTYPE DHT11 // Chọn loại cảm biến (DHT11 hoặc DHT22)
#define LDR 34
// Định nghĩa các chân LED
const int led1 = 18; // GPIO 18 cho LED1
const int led2 = 19; // GPIO 19 cho LED2
const int led3 = 21; // GPIO 21 cho LED3
const int led4 = 22; // GPIO 22 cho LED4 (nhấp nháy khi sức gió > 60)

const char *ssid = "VIETTEL_6EM_5G";
const char *password = "machin3gir1";

const char *mqtt_server = "192.168.1.6"; // IP broker
const char *mqtt_user = "duc123";        // Username của MQTT
const char *mqtt_pass = "123";           // Password của MQTT

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

unsigned long previousMillis = 0;        // Biến để theo dõi thời gian cho nhấp nháy LED4
unsigned long previousMeasureMillis = 0; // Biến để theo dõi thời gian cho việc đo dữ liệu
const long blinkInterval = 1000;         // Nhấp nháy mỗi 1 giây
const long measureInterval = 5000;       // Đo dữ liệu mỗi 5 giây

bool ledState = false; // Trạng thái của LED4
bool windHigh = false; // Biến theo dõi sức gió lớn hơn 60

// Hàm kết nối WiFi
void setup_wifi()
{
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
}

// Hàm xử lý khi nhận dữ liệu từ MQTT
void callback(char *topic, byte *payload, unsigned int length)
{
    String message = "";
    for (int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }

    if (message.startsWith("all"))
    {
        int state = message.substring(4, 5).toInt();

        // Bật/tắt tất cả các đèn
        digitalWrite(led1, state);
        digitalWrite(led2, state);
        digitalWrite(led3, state);
        digitalWrite(led4, state); // Điều khiển LED4 theo lệnh "all"

        String ledStatus = "all:" + String(state);
        client.publish("home/device/status", ledStatus.c_str());
        Serial.println(ledStatus); // In ra thông báo trạng thái
    }
    else
    {
        int led = message.substring(0, 1).toInt();
        int state = message.substring(2, 3).toInt();

        // Điều khiển đèn đơn lẻ (bao gồm cả LED4)
        if (led == 1)
        {
            digitalWrite(led1, state);
        }
        else if (led == 2)
        {
            digitalWrite(led2, state);
        }
        else if (led == 3)
        {
            digitalWrite(led3, state);
        }
        else if (led == 4)
        {
            digitalWrite(led4, state);
        }

        // Pub lại thông báo khi đèn bật/tắt thành công
        String ledStatus = String(led) + ":" + String(state);
        Serial.println("Sending MQTT message: " + ledStatus);    // Debug thêm
        client.publish("home/device/status", ledStatus.c_str()); // Pub thông điệp cho LED4
        Serial.println(ledStatus);                               // In ra thông báo trạng thái
    }
}

// Hàm kết nối tới MQTT broker
void reconnect()
{
    while (!client.connected())
    {
        Serial.print("Attempting MQTT connection...");
        if (client.connect("ESP32Client", mqtt_user, mqtt_pass))
        { // Kết nối với username và password
            Serial.println("connected");
            client.subscribe("home/device/control"); // Đăng ký lắng nghe lệnh điều khiển LED
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void setup()
{
    // Cài đặt Serial, WiFi, MQTT và cảm biến
    Serial.begin(115200);
    setup_wifi();
    client.setServer(mqtt_server, 1884);
    client.setCallback(callback);

    // Thiết lập chân cho LED và cảm biến ánh sáng
    pinMode(led1, OUTPUT);
    pinMode(led2, OUTPUT);
    pinMode(led3, OUTPUT);
    pinMode(led4, OUTPUT); // Chân cho LED4
    pinMode(LDR, INPUT);   // Cảm biến ánh sáng (DO) là đầu vào

    // Khởi tạo cảm biến DHT
    dht.begin();
}

void loop()
{
    // Đảm bảo kết nối MQTT
    if (!client.connected())
    {
        reconnect();
    }
    client.loop();

    unsigned long currentMillis = millis(); // Lấy thời gian hiện tại

    // Nếu sức gió > 60, cho phép LED4 nhấp nháy
    if (windHigh && (currentMillis - previousMillis >= blinkInterval))
    {
        previousMillis = currentMillis; // Cập nhật thời gian nhấp nháy lần trước

        // Đảo trạng thái LED4
        if (ledState)
        {
            digitalWrite(led4, LOW);
        }
        else
        {
            digitalWrite(led4, HIGH);
        }
        ledState = !ledState; // Đảo trạng thái nhấp nháy
    }

    // Đo dữ liệu và gửi sau mỗi 5 giây
    if (currentMillis - previousMeasureMillis >= measureInterval)
    {
        previousMeasureMillis = currentMillis; // Cập nhật thời gian đo dữ liệu lần trước

        // Đọc giá trị từ cảm biến DHT
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();

        // Đọc giá trị từ cảm biến ánh sáng (0 hoặc 1)
        int lightSensorValue = analogRead(LDR);

        // Tạo giá trị sức gió ngẫu nhiên từ 0 đến 100
        int windSpeed = random(0, 101);

        // Kiểm tra nếu dữ liệu cảm biến hợp lệ
        if (!isnan(temperature) && !isnan(humidity))
        {
            // Tạo chuỗi dữ liệu để gửi qua MQTT
            String payload1 = String(temperature) + " " + String(humidity) + " " + String(lightSensorValue) + " " + String(windSpeed);
            String payload = "Temp: " + String(temperature) + " Humidity: " + String(humidity) + " Light: " + String(lightSensorValue) + " Wind Speed: " + String(windSpeed);

            // Gửi dữ liệu tới MQTT topic
            client.publish("home/sensor", payload1.c_str());

            Serial.println(payload);
        }

        // Điều kiện nhấp nháy đèn LED4 khi sức gió > 60
        if (windSpeed > 60)
        {
            windHigh = true; // Kích hoạt nhấp nháy
        }
        else
        {
            digitalWrite(led4, LOW); // Nếu sức gió <= 60, tắt đèn
            windHigh = false;        // Ngừng nhấp nháy
        }
    }
}
