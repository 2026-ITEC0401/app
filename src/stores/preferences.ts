import * as SecureStore from "expo-secure-store";

/**
 * 앱 로컬 설정 (웹 원본 lib/preferences.ts). 백엔드에 저장하지 않는 값만 여기서 다룬다.
 * 명세 회신 2번: 알림음 ON/OFF 는 서버 저장 없이 기기 로컬(토큰과 같은 저장소)에 영속한다.
 */
const ALARM_SOUND_KEY = "hearo.alarmSoundEnabled";

/** 기본값 ON. 사용자가 명시적으로 끈 경우("false")에만 OFF. 읽기 실패도 ON 으로 본다. */
export async function getAlarmSoundEnabled(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(ALARM_SOUND_KEY)) !== "false";
  } catch (error) {
    console.warn("알림음 설정을 읽지 못했습니다.", error);
    return true;
  }
}

export async function setAlarmSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(ALARM_SOUND_KEY, String(enabled));
  } catch (error) {
    console.warn("알림음 설정을 저장하지 못했습니다.", error);
  }
}
