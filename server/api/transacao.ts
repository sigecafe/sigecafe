import { getServerSession } from "#auth";
import { UsuarioRepository } from '@@/server/repositories/UsuarioRepository';
import type { Usuario, Transacao } from "@prisma/client";
import prisma from '@@/lib/prisma';

// At the top of the file, add this interface
interface UserBasicInfo {
  id: number;
  name: string;
  type: string;
}

const usuarioRepository = new UsuarioRepository();

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  console.log("Session:", JSON.stringify(session));
  console.log("Session user:", session.user?.name);

  const method = event.method;
  const currentUser = session.user as Usuario;

  // If no user, return an error
  if (!currentUser) {
    console.log("No user found in session");
    throw createError({
      statusCode: 401,
      statusMessage: "User not found in session",
    });
  }

  console.log("Current user full object:", JSON.stringify(currentUser));
  console.log("Current user type (exact value):", `"${currentUser.type}"`);
  console.log("Current user type type:", typeof currentUser.type);
  console.log("Current user type ASCII:", Array.from(currentUser.type || "").map(c => c.charCodeAt(0)).join(","));

  // GET - Fetch all transactions
  if (method === "GET") {
    try {
      console.log("OVERRIDE: Fetching ALL transactions regardless of user type");

      // Get ALL transactions, regardless of user type
      const transacoes = await prisma.transacao.findMany({
        include: {
          comprador: true,
          produtor: true
        },
        orderBy: {
          data: 'desc'
        }
      });

      console.log(`Found ${transacoes.length} transactions in total`);
      return transacoes;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error fetching transactions",
      });
    }
  }

  // POST - Create new transaction
  if (method === "POST") {
    try {
      const body = await readBody(event);

      // Validate required fields
      if (!body.compradorId || !body.produtorId || !body.quantidade || !body.precoUnitario) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing required fields",
        });
      }

      // Make sure the IDs are numbers
      body.compradorId = Number(body.compradorId);
      body.produtorId = Number(body.produtorId);
      body.quantidade = Number(body.quantidade);
      body.precoUnitario = Number(body.precoUnitario);


      // Set date if not provided
      if (!body.data) {
        body.data = new Date();
      }

      // Set default status if not provided
      if (!body.status) {
        body.status = "PENDENTE";
      }

      // Create the transaction
      const newTransacao = await prisma.transacao.create({
        data: {
          compradorId: body.compradorId,
          produtorId: body.produtorId,
          quantidade: body.quantidade,
          precoUnitario: body.precoUnitario,
          data: new Date(body.data),
          status: body.status,
          observacoes: body.observacoes || ""
        },
        include: {
          comprador: true,
          produtor: true
        }
      });

      return newTransacao;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error creating transaction",
      });
    }
  }

  // PUT - Update existing transaction
  if (method === "PUT") {
    try {
      const body = await readBody(event);

      if (!body.id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing ID for update",
        });
      }

      // Convert numeric fields
      const id = Number(body.id);
      if (body.compradorId) body.compradorId = Number(body.compradorId);
      if (body.produtorId) body.produtorId = Number(body.produtorId);
      if (body.quantidade) body.quantidade = Number(body.quantidade);
      if (body.precoUnitario) body.precoUnitario = Number(body.precoUnitario);

      // Update the transaction using Prisma ORM
      const updatedTransacao = await prisma.transacao.update({
        where: { id },
        data: {
          ...(body.compradorId ? { compradorId: body.compradorId } : {}),
          ...(body.produtorId ? { produtorId: body.produtorId } : {}),
          ...(body.quantidade ? { quantidade: body.quantidade } : {}),
          ...(body.precoUnitario ? { precoUnitario: body.precoUnitario } : {}),
          ...(body.data ? { data: new Date(body.data) } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(body.observacoes !== undefined ? { observacoes: body.observacoes } : {})
        }
      });

      // Fetch the updated transaction
      const transaction = await prisma.transacao.findUnique({
        where: { id },
        include: {
          comprador: true,
          produtor: true
        }
      });

      return transaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error updating transaction",
      });
    }
  }

  // DELETE - Remove transaction
  if (method === "DELETE") {
    try {
      // Get ID from URL params
      const idParam = event.context.params?.id;

      // If no ID in params, try from body
      let transactionId: number;
      if (!idParam) {
        const body = await readBody(event);
        if (!body.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "Missing transaction ID for deletion",
          });
        }
        transactionId = Number(body.id);
      } else {
        transactionId = Number(idParam);
      }

      // Delete using Prisma ORM
      await prisma.transacao.delete({
        where: { id: transactionId }
      });

      return { success: true, message: "Transaction deleted successfully" };
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error deleting transaction",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method not allowed",
  });
});

// Endpoint to get contrapartes (potential buyers/sellers)
export const getContrapartes = defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const currentUser = session.user as Usuario;
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "User not found in session",
    });
  }

  try {
    // Get potential transaction partners based on user type
    let usuarios: UserBasicInfo[] = [];

    if (currentUser.type === "ADMINISTRADOR") {
      // Admin can see all users
      usuarios = await prisma.usuario.findMany({
        where: {
          type: { in: ["COMPRADOR", "PRODUTOR"] }
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      });
    } else if (currentUser.type === "COMPRADOR") {
      // Buyers can transact with producers
      usuarios = await prisma.usuario.findMany({
        where: {
          type: "PRODUTOR"
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      });
    } else if (currentUser.type === "PRODUTOR") {
      // Producers can transact with buyers
      usuarios = await prisma.usuario.findMany({
        where: {
          type: "COMPRADOR"
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      });
    }

    return usuarios;
  } catch (error) {
    console.error("Error fetching contrapartes:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching contrapartes",
    });
  }
});