export interface ApiError {
  code: string;
  message: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiListParams {
  page?: number;
  limit?: number;
  search?: string;
}
