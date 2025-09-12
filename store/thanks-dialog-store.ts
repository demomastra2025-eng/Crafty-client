import { create } from "zustand";

interface ThanksDialogStore {
  open: boolean;
  toggleOpen: () => void;
}

export const useThanksDialogStore = create<ThanksDialogStore>((set) => ({
  open: false,
  toggleOpen: () => set((state) => ({ open: !state.open }))
}));
