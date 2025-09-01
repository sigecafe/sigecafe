import { PermissionRepository } from '../repositories/PermissionRepository';
import type { Permission, UsuarioType } from '@prisma/client';

class PermissionService {
  private static instance: PermissionService;
  private repository: PermissionRepository;
  private cache: Map<string, Permission[]>;
  private lastCacheTime: number;
  private readonly CACHE_DURATION = 1000;

  private constructor() {
    this.repository = new PermissionRepository();
    this.cache = new Map();
    this.lastCacheTime = 0;
  }

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  async getPermissions(): Promise<Permission[]> {
    const now = Date.now();
    if (this.cache.has('all') && now - this.lastCacheTime < this.CACHE_DURATION) {
      return this.cache.get('all')!;
    }

    const permissions = await this.repository.findAll();
    this.cache.set('all', permissions);
    this.lastCacheTime = now;
    return permissions;
  }

  async hasPermission(path: string, usuarioType: UsuarioType): Promise<boolean> {
    const permissions = await this.getPermissions();
    const route = permissions.find((r) => r.path === path);
    return route ? route.usuarioType.includes(usuarioType) : false;
  }

  clearCache(): void {
    this.cache.clear();
    this.lastCacheTime = 0;
  }
}

// Export singleton instance methods
export const getPermissions = () => PermissionService.getInstance().getPermissions();
export const hasPermission = (path: string, usuarioType: UsuarioType) =>
  PermissionService.getInstance().hasPermission(path, usuarioType);
export const clearPermissionCache = () => PermissionService.getInstance().clearCache();