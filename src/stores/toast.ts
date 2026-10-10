import { create } from "zustand";

/**
 * 화면 하단에 잠깐 떴다 사라지는 안내(토스트) 상태.
 *
 * C 레퍼런스는 Android 전용 ToastAndroid 를 썼지만, iOS 에서도 같은 모양으로 보이도록
 * 앱 안에서 직접 그린다 (components/ui/toast.tsx). 어느 화면에서든 showToast() 만 부르면 된다.
 * 연속 호출은 마지막 문구로 교체되고, id 로 같은 문구를 다시 띄워도 구분한다.
 */
interface ToastState {
  id: number;
  message: string | null;
}

export const useToastStore = create<ToastState>(() => ({
  id: 0,
  message: null,
}));

export function showToast(message: string): void {
  useToastStore.setState((state) => ({ id: state.id + 1, message }));
}

export function hideToast(): void {
  useToastStore.setState({ message: null });
}
