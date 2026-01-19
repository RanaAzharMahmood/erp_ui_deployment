/**
 * Route Preloader Utility
 * Preloads route components before navigation for instant page transitions
 */

type RouteLoader = () => Promise<any>;

const routeMap: Record<string, RouteLoader> = {
  '/dashboard': () => import('../pages/dashboard/DashboardPage'),
  '/companies/add': () => import('../pages/master-data/companies/AddCompanyPage'),
  '/companies/update': () => import('../pages/master-data/companies/UpdateCompanyPage'),
  '/customer/add': () => import('../pages/master-data/customers/AddCustomerPage'),
  '/customer/update': () => import('../pages/master-data/customers/UpdateCustomerPage'),
  '/vendor/add': () => import('../pages/master-data/vendors/AddVendorPage'),
  '/vendor/update': () => import('../pages/master-data/vendors/UpdateVendorPage'),
  '/tax/add': () => import('../pages/master-data/taxes/AddTaxPage'),
  '/tax/update': () => import('../pages/master-data/taxes/UpdateTaxPage'),
  '/users/add': () => import('../pages/master-data/users/AddUserPage'),
  '/users/edit': () => import('../pages/master-data/users/UpdateUserPage'),
  '/inventory/add': () => import('../pages/master-data/items/AddItemPage'),
  '/inventory/update': () => import('../pages/master-data/items/UpdateItemPage'),
  '/categories/add': () => import('../pages/master-data/categories/AddCategoryPage'),
  '/categories/update': () => import('../pages/master-data/categories/UpdateCategoryPage'),
};

/**
 * Preload a route component
 * @param routePath - The route path to preload
 */
export const preloadRoute = (routePath: string): void => {
  const loader = routeMap[routePath];
  if (loader) {
    loader().catch((error) => {
      console.warn(`Failed to preload route ${routePath}:`, error);
    });
  }
};

/**
 * Preload multiple routes at once
 * @param routePaths - Array of route paths to preload
 */
export const preloadRoutes = (routePaths: string[]): void => {
  routePaths.forEach((path) => preloadRoute(path));
};

/**
 * Preload all routes (use sparingly, typically on idle)
 */
export const preloadAllRoutes = (): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Object.values(routeMap).forEach((loader) => {
        loader().catch(() => {
          // Silent fail for background preloading
        });
      });
    });
  }
};
