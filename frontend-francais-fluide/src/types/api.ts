// src/types/api.ts

// Common API response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination inputs for list endpoints
export interface PaginationParams {
  page?: number; // 1-based
  pageSize?: number; // default provided by endpoint
  cursor?: string; // alternative to page/pageSize
}

// Paginated response shape
export interface PaginatedResponse<T> {
  items: T[];
  total?: number; // optional when using cursor-based pagination
  nextCursor?: string | null;
}

// Standard API error payload
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

