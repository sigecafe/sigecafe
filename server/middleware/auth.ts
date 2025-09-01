import { getServerSession } from '#auth'
import { defineEventHandler, createError, getRequestURL } from 'h3'
import { hasPermission } from '../utils/permissions'
import type { Usuario } from '@prisma/client'

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
    '/api/auth',
    '/_nuxt',
    '/favicon',
    '/__nuxt_error',
    '/auth',
    '/api/_nuxt_icon',
    '/api/navigation',
    '/api/coffee-prices',
    '/200.html',
    '/404.html',
    '/500.html',
] as const

// Define static asset extensions that should be public
const PUBLIC_ASSET_EXTENSIONS = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
] as const

/**
 * Checks if a path is public and doesn't require authentication
 */
function isPublicPath(path: string): boolean {
    // Check if path starts with any public pattern
    if (PUBLIC_PATHS.some(pattern => path.startsWith(pattern))) {
        return true
    }

    // Check if path ends with any public asset extension
    if (PUBLIC_ASSET_EXTENSIONS.some(ext => path.endsWith(ext))) {
        return true
    }

    return false
}

/**
 * Checks if a path is a page route that requires permission checking
 */
function isPageRoute(path: string): boolean {
    // Root path doesn't need permission check
    if (path === '/') {
        return false
    }

    // Remove leading slash and split into segments
    const segments = path.replace(/^\//, '').split('/')

    // If last segment contains a dot, it's likely a file/asset
    if (segments[segments.length - 1].includes('.')) {
        return false
    }

    return true
}

/**
 * Main authentication middleware
 */
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event).pathname;

    // Skip authentication for public paths
    if (isPublicPath(url)) {
        return;
    }

    // Check for authenticated session
    const session = await getServerSession(event);
    if (!session || !session.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized - Authentication required'
        });
    }

    // Check permissions for page routes
    if (isPageRoute(url)) {
        const routePath = '/' + url.split('/').slice(1).join('/');
        const userType = (session.user as any).type;

        if (!userType || !hasPermission(routePath, userType)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Acesso não autorizado'
            });
        }
    }
});