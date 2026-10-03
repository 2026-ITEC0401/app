// 웹 원본 src/styles/tokens.css 의 @theme 색상과 1:1 대응한다.

const gray = {
  600: "#36393E",
  500: "#41444B",
  400: "#52575D",
  300: "#6B6B6B",
  200: "#B3B3B3",
  100: "#F3F3F3",
} as const;

const red = {
  300: "#BE3B3B",
  200: "#F04E4E",
  100: "#FBDBDB",
} as const;

const blue = {
  300: "#3569C1",
  200: "#4588F6",
  100: "#DAE8FE",
} as const;

const yellow = {
  300: "#C0910F",
  200: "#FFC31B",
  100: "#FDF1D1",
} as const;

const main = {
  200: "#FDDB3A",
  100: "#F6F4E6",
} as const;

const emergency = {
  400: "#641C1C",
  300: "#941A1A",
  200: "#A02727",
  100: "#C23030",
} as const;

export const Palette = {
  gray,
  red,
  blue,
  yellow,
  main,
  emergency,

  black: "#000000",
  white: "#FFFFFF",

  // Semantic
  success: "#37C55D",
  border: "#E9E9E9",

  background: {
    // 화면 바탕 (웹 페이지 컨테이너 bg-gray-100)
    base: gray[100],
    // 카드·입력란 등 떠 있는 면
    elevated: "#FFFFFF",
  },
} as const;
