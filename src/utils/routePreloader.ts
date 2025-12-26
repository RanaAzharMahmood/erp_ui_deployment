/**
 * Route Preloader Utility
 * Preloads route components before navigation for instant page transitions
 */

type RouteLoader = () => Promise<any>;

const routeMap: Record<string, RouteLoader> = {
  '/companies/add': () => import('../pages/AddCompanyPage'),
  '/companies/update': () => import('../pages/UpdateCompanyPage'),
  '/customer/add': () => import('../pages/AddCustomerPage'),
  '/customer/update': () => import('../pages/UpdateCustomerPage'),
  '/vendor/add': () => import('../pages/AddVendorPage'),
  '/vendor/update': () => import('../pages/UpdateVendorPage'),
  '/tax/add': () => import('../pages/AddTaxPage'),
  '/tax/update': () => import('../pages/UpdateTaxPage'),
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
