// backend/src/utils/responseFormatter.ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const formatResponse = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  ...(data && { data })
});

export const formatErrorResponse = (message: string): ApiResponse<null> => ({
  success: false,
  message,
  data: null
});