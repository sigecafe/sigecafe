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
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  console.log("Session user:", session.user?.name);

  const method = event.method;

  // GET - Fetch all colaboradores
  if (method === "GET") {
    try {
      const currentUser = session.user as Usuario;

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

      console.log("Fetching produtores for cooperativa:", cooperativaId);

      // Adjust the way we fetch produtores - now get actual produtores with their users
      const produtores = await prisma.usuario.findMany({
        where: {
          type: "PRODUTOR" as UsuarioType,
          cooperativaId: cooperativaId
        },
        include: {
          estado: {
            select: {
              id: true,
              nome: true,
              sigla: true
            }
          }
        }
      });

      console.log("Produtor API: Data structure example:",
        produtores.length > 0 ? JSON.stringify(produtores[0], null, 2) : "No producers found");

      console.log("Fetched produtores:", produtores.length);

      return { data: produtores };
    } catch (error) {
      console.error("Error fetching produtores:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error fetching produtores",
      });
    }
  }

  // POST - Create new colaborador
  if (method === "POST") {
    try {
      const body = await readBody(event);
      const currentUser = session.user as Usuario;

      console.log("Creating producer with data:", JSON.stringify(body, null, 2));

      // Normalize phone if present
      if (body.celular) {
        body.celular = normalizePhoneNumber(body.celular);
      }

      // Set the produtor type and associate with the admin's cooperativa
      body.type = "PRODUTOR";

      // If the current user has a cooperativaId, assign the same to the new comprador
      if (currentUser && currentUser.cooperativaId) {
        body.cooperativaId = currentUser.cooperativaId;
      }

      // Ensure password is provided
      if (!body.password) {
        body.password = 'password'; // Set a default password if none provided
        console.log("Setting default password for new produtor");
      }

      // Log important fields
      console.log("Producer fields being sent:", {
        name: body.name,
        email: body.email,
        celular: body.celular,
        documento: body.documento,
        endereco: body.endereco,
        cidade: body.cidade,
        estadoId: body.estadoId
      });

      // Create the usuario first
      const newUser = await repository.createUsuario(body);

      // No associado model: user creation complete
      return { data: [newUser] };
    } catch (error) {
      console.error("Error creating produtor:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error creating produtor",
      });
    }
  }

  // PUT - Update existing colaborador
  if (method === "PUT") {
    try {
      const body = await readBody(event);

      console.log("Updating producer with data:", JSON.stringify(body, null, 2));

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

      // Log important fields
      console.log("Producer update fields:", {
        id: body.id,
        name: body.name,
        email: body.email,
        celular: body.celular,
        documento: body.documento,
        endereco: body.endereco,
        cidade: body.cidade,
        estadoId: body.estadoId
      });

      // Update the usuario
      const updatedUser = await repository.updateUsuario(body);

      // No associado model: user update complete
      return { data: [updatedUser] };
    } catch (error) {
      console.error("Error updating produtor:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error updating produtor",
      });
    }
  }

  // DELETE - Remove produtor
  if (method === "DELETE") {
    try {
      const body = await readBody(event);
      const usuario = body.usuario as Usuario;

      if (!usuario || !usuario.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing produtor data for deletion",
        });
      }

      return await repository.deleteUsuarioById(usuario.id);
    } catch (error) {
      console.error("Error deleting produtor:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error deleting produtor",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});