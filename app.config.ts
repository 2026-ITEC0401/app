import type { ConfigContext, ExpoConfig } from "expo/config";

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
  // TODO: 스토어 등록 시 앱 이름·slug·scheme 확정
  name: "Hearo",
  slug: "hearo",
  version: "0.1.0",
  orientation: "portrait",
  // TODO: 앱 아이콘(./assets/images/icon.png) 준비 후 `icon` 추가
  scheme: "hearo",
  // [라이트 모드 고정] 디자인 토큰이 라이트 한 벌뿐이라 다크 팔레트를 만들지 않는다.
  // "automatic"으로 두면 OS가 다크일 때 네이티브 헤더/탭바만 검게 변해서
  // 라이트로 그린 화면과 색이 어긋난다.
  userInterfaceStyle: "light",

  // SDK 57 / RN 0.86은 New Architecture(Fabric)만 지원한다. newArchEnabled 키는 제거됐다.

  android: {
    // TODO: 스토어 등록 시 실제 패키지명으로 교체
    package: "com.example.hearo",
    versionCode: 1,
    predictiveBackGestureEnabled: false,
  },
  ios: {
    // TODO: 스토어 등록 시 실제 번들 ID로 교체
    bundleIdentifier: "com.example.hearo",
  },
  plugins: [
    "expo-router",
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
        // TODO(2단계): 디자인 토큰(Palette) 생성 후 토큰 값으로 교체
        backgroundColor: "#FFFFFF",
        // 플러그인은 image를 생략해도 drawable/splashscreen_logo를 참조해서
        // 파일이 없으면 Android 리소스 링크가 실패한다. 실제 로고가 나오기 전까지
        // 투명 placeholder를 둔다.
        // TODO: 디자인 확정 후 실제 스플래시 로고로 교체
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
