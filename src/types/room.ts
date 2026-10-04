export type RoomLabel = "거실" | "안방" | "화장실" | "현관";

// 명세 §6 고정 기기 ID
// rpi-001  거실
// esp32_1  안방
// esp32_2  현관
// esp32_3  화장실
export type DeviceId = "rpi-001" | "esp32_1" | "esp32_2" | "esp32_3";

// 명세 §6.1 기기 상태
// connected         : MQTT 연결 정상
// disabled_by_owner : owner가 MQTT 연결을 끔
// pending           : 최신 설정 반영 대기
// offline           : 네트워크 offline 또는 heartbeat 45초 초과
// error             : 요청 후 제한 시간 안에 최신 설정 미반영
export type DeviceUiStatus =
  "connected" | "disabled_by_owner" | "pending" | "offline" | "error";

export type DeviceNetworkStatus = "online" | "offline";

// 기기 종류. alert_node = ESP32(알림 노드, LED 있음), hub = Raspberry Pi(허브)
export type DeviceType = "alert_node" | "hub";

// 명세 §6.1 GET /households/{id}/devices
export interface RoomDevice {
  device_id: DeviceId;
  location: RoomLabel;
  // MQTT 연결 상태 (명세 desired_mqtt_connected). 추후 실제 reported 값에 물리면 됨
  desired_mqtt_connected: boolean; // 사용자가 키고 끄는 값
  ui_status: DeviceUiStatus; // 실제 기기의 상태
  device_type: DeviceType;
  // LED 알림 설정 지원 여부. ESP32(alert_node)만 true — false 면 LED 스위치를 그리지 않는다.
  // 미지원 기기에 PATCH settings 를 보내면 409 DEVICE_LED_CONTROL_UNSUPPORTED.
  led_alert_control_supported: boolean;
  led_alert_enabled: boolean;
  // 아래는 §6.1 조회 응답 부가 필드 (표시/디버깅용, 없을 수 있음)
  reported_mqtt_connected?: boolean;
  network_status?: DeviceNetworkStatus;
  last_seen_at?: string;
  config_version?: number;
}
