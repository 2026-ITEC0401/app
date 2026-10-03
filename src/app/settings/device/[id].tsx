import { useLocalSearchParams } from "expo-router";

import { ScreenStub } from "@/components/screen-stub";

/** TODO: 웹 pages/DeviceSettingPage.tsx 레이아웃 이식 */
export default function DeviceSettingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenStub
      headerTitle="상세 보기"
      name="기기 상세"
      detail={`settings/device/${id}`}
    />
  );
}
