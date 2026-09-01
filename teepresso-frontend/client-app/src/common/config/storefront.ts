/**
 * Global configuration for the Active Storefront Mode.
 * This determines which homepage experience is shown to the public.
 * 
 * Options:
 * - 'STANDARD': The normal T-shirt focused Teepresso homepage.
 * - 'FESTIVE': The custom Kurta focused campaign homepage for communities/groups.
 * 
 * In a future phase, this will be dynamically controlled via the Admin dashboard API.
 */
export const STOREFRONT_MODE: 'STANDARD' | 'FESTIVE' = 'STANDARD';
