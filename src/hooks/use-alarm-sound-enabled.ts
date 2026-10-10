import { useCallback, useState } from "react";

import { useFocusEffect } from "expo-router";

import {
  getAlarmSoundEnabled,
  setAlarmSoundEnabled,
} from "@/stores/preferences";

/**
 * 알림음 ON/OFF (기기 로컬 설정). 저장소 읽기가 비동기라 처음엔 null(미확정)이다.
 * 바꾸면 화면에 즉시 반영하고 저장은 뒤에서 한다.
 *
 * 탭 화면(설정)은 마운트가 유지되므로 마운트 시 한 번이 아니라 포커스될 때마다 다시 읽는다 —
 * 알림 설정 화면에서 바꾸고 돌아왔을 때 요약 라벨이 바로 맞도록.
 */
export function useAlarmSoundEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getAlarmSoundEnabled().then((value) => {
        if (!cancelled) setEnabled(value);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const update = (next: boolean) => {
    setEnabled(next);
    void setAlarmSoundEnabled(next);
  };

  return { enabled, setEnabled: update };
}
