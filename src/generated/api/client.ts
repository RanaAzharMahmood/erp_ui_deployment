import { Configuration, UsersApi, CategoriesApi, AuthApi } from './';

const getApiConfig = () => {
  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
  return new Configuration({
    basePath: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000',
    accessToken: token || undefined,
  });
};

// Create API instances with function to get fresh config
export const getUsersApi = () => new UsersApi(getApiConfig());
export const getCategoriesApi = () => new CategoriesApi(getApiConfig());
export const getAuthApi = () => new AuthApi(getApiConfig());

// Export default instances for backward compatibility
export const usersApi = getUsersApi();
export const categoriesApi = getCategoriesApi();
export const authApi = getAuthApi();