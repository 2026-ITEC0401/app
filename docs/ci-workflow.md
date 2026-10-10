# 품질 자동화 — Git Hooks · CI

코드 품질을 강제하는 자동화 파이프라인 문서입니다. **커밋 → 푸시(원격) → PR** 순서로 점점 넓게 검사합니다.

> 어떤 규칙을 강제하는지(Prettier/ESLint 설정 자체)는 [code-style.md](./code-style.md)를 참고하세요. 이 문서는 그 규칙이 **언제/어디서 실행되는지**를 다룹니다.

| 단계       | 시점      | 검사                    | 막히면            |
| ---------- | --------- | ----------------------- | ----------------- |
| pre-commit | 로컬 커밋 | 스테이지 파일 포맷·lint | 커밋 차단         |
| CI         | push / PR | 전체 포맷·lint·타입     | 체크 실패(빨간불) |

---

## 1. pre-commit (husky + lint-staged) — 로컬

| 항목    | 값                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| 도구    | `husky` + `lint-staged`                                                                                     |
| 훅 파일 | `.husky/pre-commit` → `npx lint-staged`                                                                     |
| 대상    | **스테이지된 파일만**                                                                                       |
| 동작    | `*.{ts,tsx,js,jsx}` → `eslint --fix` + `prettier --write` / `*.{json,md,css,yml,yaml}` → `prettier --write` |

- 포맷만 어긋나면 자동 수정 후 통과, **lint 에러(미사용 변수 등)가 있으면 커밋이 차단**됩니다.
- `.husky/_/`(husky 내부)는 자동 gitignore. 커밋되는 건 `.husky/pre-commit`·`.husky/post-checkout`뿐.
- 훅은 `npm install` 시 `prepare: husky` 스크립트로 자동 설치됩니다.
- lint-staged 설정은 `package.json`의 `lint-staged` 키에 있습니다.
- `post-checkout`은 Windows에서 브랜치 전환 시 Metro 캐시를 비웁니다(watchman 부재로 인한 stale 라우트 방지).

---

## 2. CI (GitHub Actions) — 원격

| 항목   | 값                                                 |
| ------ | -------------------------------------------------- |
| 파일   | `.github/workflows/ci.yml`                         |
| 트리거 | `main`/`develop` push, 모든 PR                     |
| 검사   | `prettier --check .` → `eslint .` → `tsc --noEmit` |

- `expo lint` 대신 **raw 도구(eslint/tsc/prettier)를 직접 호출**합니다.
  `expo lint`는 `app.config.ts`를 평가하므로 `.env` 값에 의존할 수 있는데,
  CI엔 `.env`가 없으므로 secret 없이 통과시키기 위함.
- 네이티브 빌드는 무겁고 secret이 필요해서 CI에서 돌리지 않습니다. 배포 빌드는 아래 EAS Build 를 **수동**으로 돌립니다.
- 연속 푸시 시 이전 실행은 자동 취소(concurrency)해 러너를 아낍니다.

---

## EAS Build (수동, Android APK)

| 항목 | 값                                                                       |
| ---- | ------------------------------------------------------------------------ |
| 설정 | `eas.json` (development · preview · production 프로필, 전부 APK)         |
| 계정 | `app.config.ts` 의 `owner` 조직, 프로젝트 ID는 `extra.eas.projectId`     |
| 버전 | `appVersionSource: "local"` — `app.config.ts` 의 `version`·`versionCode` |
| 서명 | Android 키스토어는 EAS 가 생성·보관 (첫 빌드 때 생성 여부를 묻는다)      |

원스토어 배포라 AAB 가 아닌 **APK** 로만 빌드합니다. `production` 프로필은 EAS 의 `production` 환경변수를 씁니다.

```bash
npx eas-cli login                        # Expo 계정 로그인 (최초 1회)
npx eas-cli env:set --scope project --environment production --name EXPO_PUBLIC_API_BASE_URL --value <API 주소> --visibility plaintext
npx eas-cli env:set --scope project --environment production --name EXPO_PUBLIC_WS_BASE_URL --value <WS 주소> --visibility plaintext
npx eas-cli build -p android --profile preview      # 내부 테스트용 APK
npx eas-cli build -p android --profile production   # 스토어 제출용 APK
```

- `EXPO_PUBLIC_*` 값은 `.env` 가 아니라 **EAS 환경변수**에서 읽습니다. 로컬 `.env` 는 커밋되지 않아 클라우드 빌드에 포함되지 않기 때문입니다. (`eas env:list --environment production` 으로 확인)
- 반드시 **`--scope project`** 로 등록합니다. 같은 Expo 계정(organization)에 다른 앱이 계정 범위(SHARED)로 올려 둔 같은 이름의 변수가 있을 수 있는데, 프로젝트 범위 변수가 이를 덮어씁니다. 계정 범위 변수는 다른 앱 것이므로 수정·삭제하지 않습니다.
- 다른 환경(preview · development)으로 빌드하려면 그 환경에도 같은 변수를 프로젝트 범위로 추가해야 합니다.
- 스토어 업로드마다 `android.versionCode` 를 1씩 올립니다 (같은 값 재업로드 불가). 릴리즈 흐름은 [convention.md §6](./convention.md#6-릴리즈-develop--main) 참고.

---

## 참고

- 코드 스타일 규칙(Prettier/ESLint): [code-style.md](./code-style.md)
- 브랜치/커밋/PR 규칙: [convention.md](./convention.md)
