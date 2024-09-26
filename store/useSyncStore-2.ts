import { create } from "zustand";
import { SyncStatus } from "@/types/sync";
import { getSyncStatus, updateSyncStatus } from "@/services/syncStatusService";

interface SyncStoreState {
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  isDialogOpen: boolean;
  delaySeconds: number; // Track the countdown seconds
  isCountdownActive: boolean; // Track if countdown is active
  setDelaySeconds: (seconds: number) => void;
  setIsCountdownActive: (active: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  fetchSyncStatus: () => Promise<void>;
  updateSyncStatus: (status: SyncStatus) => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  syncStatus: null,
  isLoading: true,
  isDialogOpen: false,
  delaySeconds: 60, // Default delay in seconds
  isCountdownActive: false, // Countdown is not active by default

  setIsDialogOpen: (open: boolean) => {
    set({ isDialogOpen: open });
  },

  setDelaySeconds: (seconds: number) => {
    set({ delaySeconds: seconds });
  },

  setIsCountdownActive: (active: boolean) => {
    set({ isCountdownActive: active });
  },

  // Fetches sync status from the JSON file
  fetchSyncStatus: async () => {
    set({ isLoading: true });
    const status = await getSyncStatus();
    set({ syncStatus: status, isLoading: false });
  },

  // Updates the sync status and writes to the JSON file
  updateSyncStatus: async (status: SyncStatus) => {
    await updateSyncStatus(status);
    set({ syncStatus: status });
  },
}));
