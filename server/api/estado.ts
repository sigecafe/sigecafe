export default defineEventHandler(async (event) => {
  try {
    const estados = await prisma.estado.findMany();
    console.log('Estado API: Returning estados:', estados);
    return estados;
  } catch (error) {
    console.error('Estado API: Error fetching estados:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching estados",
    });
  }
});
