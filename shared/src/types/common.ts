// ✅ TYPES COMMUNS
import { StandardApiResponse } from './api';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> extends StandardApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ FILTRES
export interface FilterParams {
  type?: string;
  generation?: number;
  search?: string;
} 