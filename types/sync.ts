export interface SyncStatus {
  syncInProgress: boolean;
  startTime: string; // ISO string format for date-time
  endTime: string | null; // Nullable as it could be null if sync is in progress
  totalOrders: number;
  syncedOrders: number;
  status: "Ready" | "Syncing" | "Complete" | "Failed" | "Delay"; // Could be other statuses as well
  delay_in_sec: number;
}