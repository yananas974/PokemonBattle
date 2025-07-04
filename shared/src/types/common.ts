// ✅ TYPES COMMUNS
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ ERREURS
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

// ✅ FILTRES
export interface FilterParams {
  type?: string;
  generation?: number;
  search?: string;
} 