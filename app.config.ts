import type { ConfigContext, ExpoConfig } from "expo/config";

// 스플래시 배경색을 JS 쪽 디자인 토큰과 한 소스로 묶는다.
// (@/ alias는 Metro 전용이라 설정 파일에서는 상대경로로 가져와야 한다)
import { Palette } from "./src/constants/palette.ts";

/**
 * 네이티브(android/, ios/) 설정의 유일한 소스 오브 트루스.
 *
 * android/ 폴더는 .gitignore 처리돼 있고 `expo prebuild`가 매번 새로 생성한다.
 * 즉 AndroidManifest.xml이나 build.gradle을 직접 고쳐도 --clean 한 번이면 전부 날아간다.
 * 네이티브 쪽에 뭔가 넣어야 하면 반드시 이 파일의 plugins 배열을 통해서 넣을 것.
 *
 * Expo CLI는 expo 명령 실행 시 .env를 자동으로 읽어 process.env에 넣어준다.
 * 단, EXPO_PUBLIC_ 접두사가 붙은 값만 JS 번들에 포함된다.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // EAS 프로젝트가 속한 Expo 계정(팀 organization). eas build/submit 가 이 계정으로 연결된다.
  owner: "nyoengs-team",
  name: "Hearo",
  slug: "hearo",
  // 사용자에게 보이는 표기. package.json 의 version 과 같이 올린다 (docs/convention.md §6-2)
  version: "1.0.0",
  orientation: "portrait",
  // 스토어·iOS 용 정사각형 아이콘 (1024×1024, 배경 gray[500] 포함)
  icon: "./assets/images/icon.png",
  scheme: "hearo",
  // [라이트 모드 고정] 디자인 토큰이 라이트 한 벌뿐이라 다크 팔레트를 만들지 않는다.
  // "automatic"으로 두면 OS가 다크일 때 네이티브 헤더/탭바만 검게 변해서
  // 라이트로 그린 화면과 색이 어긋난다.
  userInterfaceStyle: "light",

  // SDK 57 / RN 0.86은 New Architecture(Fabric)만 지원한다. newArchEnabled 키는 제거됐다.

  android: {
    // 스토어 등록 후에는 바꿀 수 없다.
    package: "com.hearo.app",
    // 스토어 업로드마다 1씩 올린다 (같은 값으로 재업로드 불가). eas.json 의 appVersionSource 가
    // "local" 이라 여기 적힌 값이 그대로 빌드에 들어간다.
    versionCode: 1,
    // 안드로이드는 이 아이콘을 제조사별 마스크(원·스퀘어클 등)로 잘라내므로
    // 심볼만 투명 배경 위에 안전 영역(가운데 약 62%) 안으로 넣은 전경 이미지를 따로 쓴다.
    // icon-foreground.png 는 디자인 원본(심볼 PNG)에서 PIL 로 생성 — 심볼이 바뀌면 다시 만든다.
    adaptiveIcon: {
      backgroundColor: Palette.gray[500],
      foregroundImage: "./assets/images/icon-foreground.png",
    },
    predictiveBackGestureEnabled: false,
  },
  ios: {
    // iOS 빌드는 현재 범위 밖. 패키지명과 맞춰만 둔다.
    bundleIdentifier: "com.hearo.app",
  },
  plugins: [
    "expo-router",
    // 토큰·가구 식별자·로컬 설정 저장소. `npx expo install` 은 동적 설정(app.config.ts)에
    // 자동으로 못 쓰고 "Cannot automatically write to dynamic config" 경고만 내므로 직접 적는다.
    "expo-secure-store",
    // Pretendard를 빌드 타임에 네이티브로 임베드한다.
    // useFonts() 런타임 로딩과 달리 첫 프레임부터 적용돼서 폰트가 깜빡이지 않는다.
    //
    // [주의] 굵기별로 파일을 따로 등록한다. 안드로이드는 fontWeight으로
    // 굵기 파일을 골라주지 않고, 패밀리 이름이 곧 "파일명"이다.
    // 즉 여기 파일명이 constants/typography.ts의 FontFamily 값과 정확히 같아야 한다.
    // 파일을 추가/교체하면 JS 리로드로는 반영 안 된다 → npx expo run:android
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Pretendard-Regular.ttf",
          "./assets/fonts/Pretendard-Bold.ttf",
          "./assets/fonts/Pretendard-ExtraBold.ttf",
        ],
      },
    ],
    [
      "expo-splash-screen",
      {
        // 시작 화면((auth)/start.tsx)과 같은 배경·로고·폭으로 맞춰 스플래시 → 시작 화면이
        // 끊김 없이 이어지게 한다. 로그인 상태면 게이트가 홈으로 보내므로 그때만 전환이 보인다.
        backgroundColor: Palette.gray[400],
        image: "./assets/images/logo.png",
        imageWidth: 294,
      },
    ],
  ],
  // EAS 프로젝트 식별자. `eas init` 이 발급하며, 동적 config 라 자동 기입이 안 돼 수동으로 넣는다.
  // 이 값이 있어야 eas build 가 이 프로젝트로 연결된다.
  extra: {
    eas: {
      projectId: "190fe640-2dd1-4f41-ab76-9d05fd8a5317",
    },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
