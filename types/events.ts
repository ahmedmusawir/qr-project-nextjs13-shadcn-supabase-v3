export interface EventsResponse {
  events: GHLEvent[];
  pagination: Pagination;
}

export interface GHLEvent {
  _id: string;
  name: string;
  availableInStore: boolean;
  createdAt: string;
  image: string;
  collectionIds: string[];
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
