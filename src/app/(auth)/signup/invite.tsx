import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import { StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { CompleteHeader } from "@/components/signup/complete-header";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { linkPreviewQueryOptions } from "@/hooks/use-link-preview-query";
import { resetToHome } from "@/utils/navigation";

const CODE_LENGTH = 6;
const CODE_SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => i);
/** 웹 h-15 */
const CODE_BOX_HEIGHT = 60;
const CODE_BOX_BORDER_WIDTH = 2;
const INFO_ICON_SIZE = 16;

/**
 * 가족 초대 코드 입력 (웹 원본 pages/InviteCodePage.tsx).
 * POST /households/link/preview 로 연동 가능 여부를 확인하고, 결과는 쿼리 캐시에 남겨
 * 가구 연동 화면이 코드만 받아 같은 캐시를 읽게 한다 (웹의 location.state 대체).
 */
export default function InviteCodeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFindHousehold = async () => {
    setError(null);
    setLoading(true);
    try {
      const preview = await queryClient.fetchQuery(
        linkPreviewQueryOptions(code),
      );
      if (!preview.linkable) {
        setError("연동할 수 없는 코드예요. 다시 확인해 주세요.");
        return;
      }
      router.push({ pathname: "/signup/link", params: { inviteCode: code } });
    } catch (e) {
      setError(getApiErrorMessage(e, "알 수 없는 오류가 발생했어요."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <CompleteHeader onSkip={() => resetToHome()} />

      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <ThemedText type="head02" color={Palette.gray[500]}>
            가족 초대 코드 입력
          </ThemedText>
          <ThemedText type="body01" color={Palette.gray[300]}>
            대상자 가구에서 발급된{"\n"}6자리 코드를 입력해 주세요.
          </ThemedText>
        </View>

        {/* 실제 입력은 투명한 TextInput 이 받고, 아래 6칸은 표시만 한다 (웹과 같은 기법) */}
        <View>
          <View style={styles.codeRow}>
            {CODE_SLOTS.map((i) => (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  {
                    borderColor:
                      i === code.length ? Palette.main[200] : Palette.border,
                  },
                ]}
              >
                <ThemedText type="head03" color={Palette.gray[500]}>
                  {code[i] ?? "–"}
                </ThemedText>
              </View>
            ))}
          </View>
          <TextInput
            value={code}
            onChangeText={(text) =>
              setCode(text.toUpperCase().slice(0, CODE_LENGTH))
            }
            maxLength={CODE_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="초대 코드"
            style={styles.hiddenInput}
          />
        </View>

        <View style={styles.infoRow}>
          <Info size={INFO_ICON_SIZE} color={Palette.gray[300]} />
          <ThemedText type="body02" color={Palette.gray[300]}>
            코드는 설정 › 가족 관리에서 발급할 수 있어요.
          </ThemedText>
        </View>

        <View style={styles.spacer} />

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="가구 찾기"
          variant="dark"
          onPress={handleFindHousehold}
          disabled={code.length !== CODE_LENGTH}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    paddingBottom: Spacing.ten,
  },
  content: {
    flex: 1,
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  titleBlock: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  codeRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  codeBox: {
    flex: 1,
    height: CODE_BOX_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.medium,
    borderWidth: CODE_BOX_BORDER_WIDTH,
    backgroundColor: Palette.white,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  spacer: {
    flex: 1,
  },
});
