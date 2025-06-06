export interface RateLimitStore { 
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

