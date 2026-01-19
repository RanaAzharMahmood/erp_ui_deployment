import { Configuration, UsersApi, CategoriesApi, AuthApi, CompaniesApi } from './';

// Custom fetch wrapper that adds Authorization header
const fetchWithAuth: typeof fetch = (url: string | Request | URL, init?: RequestInit) => {
  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');

  // Add Authorization header if token exists
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const updatedInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(url, updatedInit);
};

const getApiConfig = () => {
  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
  return new Configuration({
    basePath: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000',
    accessToken: token || undefined,
  });
};

// Create API instances with function to get fresh config and custom fetch
export const getUsersApi = () => new UsersApi(getApiConfig(), undefined, fetchWithAuth as any);
export const getCategoriesApi = () => new CategoriesApi(getApiConfig(), undefined, fetchWithAuth as any);
export const getAuthApi = () => new AuthApi(getApiConfig(), undefined, fetch); // Don't add token for auth endpoint
export const getCompaniesApi = () => new CompaniesApi(getApiConfig(), undefined, fetchWithAuth as any);

// Export default instances for backward compatibility
export const usersApi = getUsersApi();
export const categoriesApi = getCategoriesApi();
export const authApi = getAuthApi();
export const companiesApi = getCompaniesApi();