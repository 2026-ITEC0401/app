import { useState } from "react";

import { Search } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { CompleteHeader } from "@/components/signup/complete-header";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { useAddressSearchMutation } from "@/hooks/use-address-search-mutation";
import { useUpdateEmergencyAddressMutation } from "@/hooks/use-update-emergency-address-mutation";
import { useHouseholdId } from "@/stores/session";
import { type AddressSearchItem } from "@/types/household";
import { resetToHome } from "@/utils/navigation";

/** 웹 h-15 */
const SEARCH_BOX_HEIGHT = 60;
const SEARCH_ICON_SIZE = 20;
/** 웹 max-h-96 */
const RESULTS_MAX_HEIGHT = 384;
/** 웹 h-14 w-14 */
const EMPTY_ICON_CIRCLE_SIZE = 56;
const EMPTY_ICON_SIZE = 24;
/** 웹 rounded-md (6px — 토큰에 없는 값) */
const TAG_RADIUS = 6;

/**
 * 집 주소 등록 (웹 원본 pages/HouseholdAddressPage.tsx).
 * §5.9 도로명주소 검색 → §5.8 긴급 주소 등록 (owner 전용).
 */
export default function HouseholdAddressScreen() {
  const householdId = useHouseholdId();
  const searchMutation = useAddressSearchMutation();
  const registerMutation = useUpdateEmergencyAddressMutation();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<AddressSearchItem[]>([]);
  const [selected, setSelected] = useState<AddressSearchItem | null>(null);
  const [detail, setDetail] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setSelected(null);
    setError(null);
    if (!householdId) return;
    try {
      const res = await searchMutation.mutateAsync({ householdId, keyword });
      setResults(res.items);
      setSearched(true);
    } catch (e) {
      setError(getApiErrorMessage(e, "주소를 검색하지 못했어요."));
      setResults([]);
      // 검색 실패는 "결과 없음"이 아니므로 1b 대신 에러만 노출
      setSearched(false);
    }
  };

  const handleRegister = async () => {
    if (!selected || !householdId) return;
    setError(null);
    try {
      await registerMutation.mutateAsync({
        householdId,
        body: {
          postal_code: selected.postal_code,
          road_address: selected.road_address,
          detail_address: detail,
          address_provider: "juso_go_kr",
          provider_reference: selected.provider_reference,
          detail_source: "manual",
        },
      });
      resetToHome();
    } catch (e) {
      setError(getApiErrorMessage(e, "주소 등록에 실패했어요."));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <CompleteHeader onSkip={() => resetToHome()} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="head02" color={Palette.gray[500]}>
          집 주소 등록
        </ThemedText>

        <View style={styles.searchBox}>
          <Search size={SEARCH_ICON_SIZE} color={Palette.gray[500]} />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder="도로명 또는 건물명"
            placeholderTextColor={Palette.gray[200]}
            accessibilityLabel="주소 검색"
            style={styles.searchInput}
          />
        </View>

        {selected ? (
          // 1c. 주소 선택 완료
          <View style={styles.section}>
            <ThemedText type="subtitle03" color={Palette.gray[500]}>
              선택한 주소
            </ThemedText>
            <View style={styles.selectedCard}>
              <AddressTagRow postalCode={selected.postal_code} />
              <ThemedText type="subtitle02" color={Palette.gray[500]}>
                {selected.road_address}
              </ThemedText>
              {selected.building_name ? (
                <ThemedText
                  type="body02"
                  color={Palette.gray[300]}
                  style={styles.building}
                >
                  {selected.building_name}
                </ThemedText>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setSelected(null)}
              style={styles.researchButton}
            >
              <ThemedText
                type="label04"
                color={Palette.gray[300]}
                style={styles.underline}
              >
                다시 검색하기
              </ThemedText>
            </Pressable>

            <TextField
              label="동 호수"
              placeholder="동 · 호수 입력 (선택)"
              value={detail}
              onChangeText={setDetail}
              maxLength={200}
            />

            <ThemedText type="body03" color={Palette.gray[300]}>
              행정안전부 도로명주소 검색 기준
            </ThemedText>
          </View>
        ) : searched && results.length === 0 ? (
          // 1b. 검색 결과 없음
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Search size={EMPTY_ICON_SIZE} color={Palette.gray[500]} />
            </View>
            <ThemedText type="subtitle01" color={Palette.gray[500]}>
              검색 결과가 없습니다
            </ThemedText>
            <ThemedText type="body01" color={Palette.gray[300]}>
              도로명과 건물번호를 다시 확인해 주세요.
            </ThemedText>
          </View>
        ) : results.length > 0 ? (
          // 1a. 검색 결과 목록
          <View style={styles.section}>
            <ThemedText type="body02" color={Palette.gray[300]}>
              검색 결과 {results.length}건
            </ThemedText>
            <ScrollView
              style={styles.results}
              contentContainerStyle={styles.resultsContent}
              nestedScrollEnabled
            >
              {results.map((item) => (
                <Pressable
                  key={item.postal_code + item.road_address}
                  accessibilityRole="button"
                  onPress={() => setSelected(item)}
                  style={({ pressed }) => [
                    styles.resultCard,
                    pressed && styles.resultCardPressed,
                  ]}
                >
                  <AddressTagRow postalCode={item.postal_code} large />
                  <ThemedText type="subtitle02" color={Palette.gray[500]}>
                    {item.road_address}
                  </ThemedText>
                  {item.building_name ? (
                    <ThemedText
                      type="body01"
                      color={Palette.gray[300]}
                      style={styles.building}
                    >
                      {item.building_name}
                    </ThemedText>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <View style={styles.notice}>
          <ThemedText type="body01" color={Palette.gray[500]}>
            건너뛰어도 계정은 유지되고,{"\n"}다시 열면 이 화면부터 시작합니다.
          </ThemedText>
        </View>
        {error ? (
          <ThemedText type="body01" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="이 주소로 등록"
          variant="dark"
          onPress={handleRegister}
          disabled={!selected}
          loading={registerMutation.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/** "도로명" 태그 + 우편번호 한 줄 */
function AddressTagRow({
  postalCode,
  large = false,
}: {
  postalCode: string;
  large?: boolean;
}) {
  return (
    <View style={styles.tagRow}>
      <View style={styles.tag}>
        <ThemedText type="label06" color={Palette.gray[500]}>
          도로명
        </ThemedText>
      </View>
      <ThemedText type={large ? "body01" : "body02"} color={Palette.gray[300]}>
        {postalCode}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    paddingBottom: Spacing.ten,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: SEARCH_BOX_HEIGHT,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: Palette.black,
    ...Typography.body01,
    includeFontPadding: false,
  },
  section: {
    gap: Spacing.three,
  },
  selectedCard: {
    borderRadius: Radius.large,
    borderWidth: 2,
    borderColor: Palette.main[200],
    backgroundColor: Palette.white,
    padding: Spacing.five,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  tag: {
    borderRadius: TAG_RADIUS,
    backgroundColor: Palette.main[200],
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  building: {
    marginTop: Spacing.one,
  },
  researchButton: {
    alignSelf: "flex-start",
  },
  underline: {
    textDecorationLine: "underline",
  },
  emptyBox: {
    alignItems: "center",
    gap: Spacing.one,
    borderRadius: Radius.large,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Palette.gray[200],
    backgroundColor: Palette.white,
    paddingVertical: Spacing.eight,
  },
  emptyIconCircle: {
    width: EMPTY_ICON_CIRCLE_SIZE,
    height: EMPTY_ICON_CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[100],
    marginBottom: Spacing.four,
  },
  results: {
    maxHeight: RESULTS_MAX_HEIGHT,
  },
  resultsContent: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  resultCard: {
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.white,
    padding: Spacing.four,
  },
  resultCardPressed: {
    backgroundColor: Palette.gray[100],
  },
  spacer: {
    flex: 1,
  },
  notice: {
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: Palette.main[200],
    backgroundColor: Palette.main[100],
    padding: Spacing.four,
  },
});
