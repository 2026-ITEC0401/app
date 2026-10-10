// 설정 탭 하단 데이터 출처 표기 (C 레퍼런스 constants/attribution.ts 구조).
//
// 외부 데이터·API 를 쓰는 기능마다 출처를 적는다. 현재는 긴급 주소 등록의 도로명주소 검색
// (명세 §5.9, address_provider "juso_go_kr") 하나뿐이다. 새 외부 데이터가 붙으면 여기에 추가한다.

export const DATA_SOURCE_TITLE = "데이터 출처";

export const DATA_SOURCES = [
  {
    label: "주소 검색",
    source: "행정안전부 도로명주소 안내시스템(juso.go.kr)",
  },
] as const;
