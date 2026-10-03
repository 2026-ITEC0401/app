import { useEffect, useState } from "react";

import {
  getAlarmSoundEnabled,
  setAlarmSoundEnabled,
} from "@/stores/preferences";

/**
 * 알림음 ON/OFF (기기 로컬 설정). 저장소 읽기가 비동기라 처음엔 null(미확정)이다.
 * 바꾸면 화면에 즉시 반영하고 저장은 뒤에서 한다.
 */
export function useAlarmSoundEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAlarmSoundEnabled().then((value) => {
      if (!cancelled) setEnabled(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (next: boolean) => {
    setEnabled(next);
    void setAlarmSoundEnabled(next);
  };

  return { enabled, setEnabled: update };
}
