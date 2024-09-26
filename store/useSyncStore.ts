import { create } from "zustand";
import { SyncStatus } from "@/types/sync";
import { getSyncStatus, updateSyncStatus } from "@/services/syncStatusService";

interface SyncStoreState {
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  fetchSyncStatus: () => Promise<void>;
  updateSyncStatus: (status: SyncStatus) => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  syncStatus: null,
  isLoading: true,
  isDialogOpen: false,

  setIsDialogOpen: (open: boolean) => {
    set({ isDialogOpen: open });
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
