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

  // Filtrar e mapear as rotas
  let filteredLinks: PermissionDTO[] = allPagesWithShowInAndTitle
    .filter(route => route.usuarioType.includes(userType))
    .map(route => ({
      id: route.id,
      path: route.path,
      title: route.title,
      icon: route.icon,
      menuType: route.menuType,
      usuarioType: route.usuarioType,
      description: route.description,
    }));

  // Separar Início e Dashboard do resto
  const homeIndex = filteredLinks.findIndex(p => p.path === "/app");
  const dashboardIndex = filteredLinks.findIndex(p => p.path === "/app/dashboard");
  
  const homePage = homeIndex !== -1 ? filteredLinks.splice(homeIndex, 1)[0] : null;
  const dashboardPage = dashboardIndex !== -1 ? filteredLinks.splice(dashboardIndex > homeIndex ? dashboardIndex - 1 : dashboardIndex, 1)[0] : null;

  // Ordenar o resto alfabeticamente
  filteredLinks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  // Montar a ordem final: Início, Dashboard, resto
  const finalLinks: PermissionDTO[] = [];
  if (homePage) finalLinks.push(homePage);
  if (dashboardPage) finalLinks.push(dashboardPage);
  finalLinks.push(...filteredLinks);

  return finalLinks;
});
