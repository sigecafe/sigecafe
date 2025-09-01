import { defineEventHandler } from 'h3';
import { getServerSession } from '#auth';
import { getPermissions } from '../utils/permissions';
import { UsuarioType } from '@prisma/client';
import type { PermissionDTO } from '~/types/api';

export default defineEventHandler(async (event): Promise<PermissionDTO[]> => {
  const session = await getServerSession(event);

  if (!session?.user) {
    return [];
  }

  // Get user type safely
  const user = session.user as any;
  const userType = user.type as UsuarioType;

  if (!userType) {
    console.error('User type not found in session');
    return [];
  }

  const permissions = await getPermissions();

  const allPagesWithShowInAndTitle = permissions.filter(page => page.menuType && page.title);

  const filteredLinks: PermissionDTO[] = allPagesWithShowInAndTitle
    .filter(route => route.usuarioType.includes(userType))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    .map(route => ({
      id: route.id,
      path: route.path,
      title: route.title,
      icon: route.icon,
      menuType: route.menuType,
      usuarioType: route.usuarioType,
      description: route.description,
    }));

  const dashboardIndex = filteredLinks.findIndex(p => p.path === "/app");
  if (dashboardIndex !== -1) {
    const removed = filteredLinks.splice(dashboardIndex, 1);
    const dashboardPage = removed[0]!;
    filteredLinks.unshift(dashboardPage);
  }

  return filteredLinks;
});
