import { getServerSession } from "#auth";
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';
import type { Usuario, UsuarioType } from "@prisma/client";
import prisma from '@@/lib/prisma';

const repository = new UsuarioRepository();

// Helper function to normalize phone number by removing non-digit characters
function normalizePhoneNumber(phone: string): string {
  return phone ? phone.replace(/\D/g, '') : '';
}

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const user = session?.user as Usuario | undefined;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  console.log("Session user:", user.name);

  const method = event.method;

  // GET - Fetch all colaboradores
  if (method === "GET") {
    try {
      const currentUser = user;

      // If no user, return an empty list
      if (!currentUser) {
        console.log("No user found in session");
        return [];
      }

      // ADMINISTRADOR might not have cooperativaId set directly, try to find it
      let cooperativaId = currentUser.cooperativaId;

      if (!cooperativaId && currentUser.type === "ADMINISTRADOR") {
        // For admin users, get the first cooperative (as a fallback)
        const cooperativas = await prisma.cooperativa.findMany({
          take: 1
        });

        if (cooperativas.length > 0) {
          cooperativaId = cooperativas[0].id;
          console.log("Admin user without cooperativaId, using first cooperative:", cooperativaId);
        }
      }

      if (!cooperativaId) {
        console.log("No cooperativaId found for user:", currentUser.id);
        return [];
      }

      console.log("Fetching colaboradores for cooperativa:", cooperativaId);

      // Adjust the way we fetch colaboradores - now get actual colaboradores with their users
      const colaboradores = await prisma.usuario.findMany({
        where: { type: "COLABORADOR" as UsuarioType, cooperativaId }
      });

      console.log("Fetched colaboradores:", colaboradores.length);

      return { data: colaboradores };
    } catch (error) {
      console.error("Error fetching colaboradores:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error fetching colaboradores",
      });
    }
  }

  // POST - Create new colaborador
  if (method === "POST") {
    try {
      const body = await readBody(event);
      const currentUser = session.user as Usuario;

      // Normalize phone if present
      if (body.celular) {
        body.celular = normalizePhoneNumber(body.celular);
      }

      // Set the colaborador type and associate with the admin's cooperativa
      body.type = "COLABORADOR";

      // If the current user has a cooperativaId, assign the same to the new colaborador
      if (currentUser && currentUser.cooperativaId) {
        body.cooperativaId = currentUser.cooperativaId;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "Current user doesn't have a cooperativa assigned",
        });
      }

      // Ensure password is provided
      if (!body.password) {
        body.password = 'password'; // Set a default password if none provided
        console.log("Setting default password for new colaborador");
      }

      // Create the Usuario with colaborador type and cargo
      const newUser = await repository.createUsuario(body);
      return { data: [newUser] };
    } catch (error) {
      console.error("Error creating colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error creating colaborador",
      });
    }
  }

  // PUT - Update existing colaborador
  if (method === "PUT") {
    try {
      const body = await readBody(event);

      if (!body.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing ID for update",
        });
      }

      // Normalize phone if present
      if (body.celular) {
        body.celular = normalizePhoneNumber(body.celular);
      }

      // Update the Usuario (cargo, celular, etc.)
      const updatedUser = await repository.updateUsuario(body);
      return { data: [updatedUser] };
    } catch (error) {
      console.error("Error updating colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error updating colaborador",
      });
    }
  }

  // DELETE - Remove colaborador
  if (method === "DELETE") {
    try {
      const body = await readBody(event);
      const usuario = body.usuario as Usuario;

      if (!usuario || !usuario.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing colaborador data for deletion",
        });
      }

      return await repository.deleteUsuarioById(usuario.id);
    } catch (error) {
      console.error("Error deleting colaborador:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error deleting colaborador",
      });
    }
  }

  // Helper function to fetch a colaborador by ID
  // Helper: fetch updated usuario
  async function fetchColaboradorById(id: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    return { data: [usuario] };
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});