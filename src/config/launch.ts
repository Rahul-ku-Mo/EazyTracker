// Launch Configuration
// Set this to false to lock the application and show "Coming Soon" page for all routes except landing and pricing
export const IS_LAUNCHED = true;

// Routes that are always accessible even when locked
export const ALWAYS_ACCESSIBLE_ROUTES = [
  "/",           // Landing page
  "/pricing",    // Pricing page
  "/coming-soon" // Coming soon page itself
];

// Check if a route should be accessible when locked
export const isRouteAccessible = (pathname: string): boolean => {
  if (IS_LAUNCHED) {
    return true; // All routes accessible when launched
  }
  
  return ALWAYS_ACCESSIBLE_ROUTES.some(route => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}; 