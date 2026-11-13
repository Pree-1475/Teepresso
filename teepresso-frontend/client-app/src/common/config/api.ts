export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:5001/api/v1' : 'https://teepresso-2426456693.asia-south1.run.app/api/v1');
