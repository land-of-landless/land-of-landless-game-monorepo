import { create } from "zustand";

interface BillboardStore {
  isInBillboardVicinity: boolean;
  setIsInBillboardVicinity: (inVicinity: boolean) => void;
}

export const useBillboardStore = create<BillboardStore>((set) => ({
  isInBillboardVicinity: false,
  setIsInBillboardVicinity: (inVicinity) =>
    set({ isInBillboardVicinity: inVicinity }),
}));
