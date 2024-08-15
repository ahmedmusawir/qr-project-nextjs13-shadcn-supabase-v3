export interface Orders {
  orders: Order[];
  pagination: Pagination;
}

export interface Order {
  order_id: string;
  location_id: string;
  total_paid: number;
  payment_status: string;
  payment_currency: string;
  order_status: string;
  contact_id: string;
  contact_firstname: string;
  contact_lastname: string;
  contact_email: string;
  contact_phone: string;
  date_added: string;
  event_id: string;
  event_name: string;
  event_image: string;
  event_ticket_price: number;
  event_ticket_type: string;
  event_ticket_currency: string;
  event_available_qty: number;
  event_ticket_qty: number;
  inserted_at: string;
  updated_at: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
