import { useMutation } from "@tanstack/react-query";

import { searchRoadAddress } from "@/api/household";

type AddressSearchVariables = {
  householdId: string;
  keyword: string;
};

// §5.9 도로명주소 검색 (owner 전용). 사용자가 누를 때마다 호출하므로 쿼리가 아닌 mutation 으로 둔다.
export function useAddressSearchMutation() {
  return useMutation({
    mutationFn: ({ householdId, keyword }: AddressSearchVariables) =>
      searchRoadAddress(householdId, keyword),
  });
}
