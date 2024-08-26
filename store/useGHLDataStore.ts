import { GHLEvent } from "@/types/events";
import { GHLCustomField } from "@/types/fields";
import { create } from "zustand";

interface AdminState {
  events: GHLEvent[];
  fields: GHLCustomField[];
  setEvents: (events: GHLEvent[]) => void;
  setFields: (fields: GHLCustomField[]) => void;
}

export const useGHLDataStore = create<AdminState>((set) => ({
  events: [],
  fields: [],
  setEvents: (events) => set({ events }),
  setFields: (fields) => set({ fields }),
}));
