import type { RoomDevice } from "@/types/room";

// 화면 골격용 더미 데이터 (명세 §6.1). API 연동 시 이 파일만 지우면 된다.
export const MOCK_DEVICES: RoomDevice[] = [
  {
    device_id: "rpi-001",
    location: "거실",
    desired_mqtt_connected: true,
    ui_status: "connected",
    led_alert_enabled: true,
    network_status: "online",
  },
  {
    device_id: "esp32_1",
    location: "안방",
    desired_mqtt_connected: true,
    ui_status: "connected",
    led_alert_enabled: true,
    network_status: "online",
  },
  {
    device_id: "esp32_3",
    location: "화장실",
    desired_mqtt_connected: true,
    ui_status: "offline",
    led_alert_enabled: false,
    network_status: "offline",
  },
  {
    device_id: "esp32_2",
    location: "현관",
    desired_mqtt_connected: true,
    ui_status: "connected",
    led_alert_enabled: true,
    network_status: "online",
  },
];
