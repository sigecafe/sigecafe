import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Simple hash function that matches the one in crypto.ts
async function hash(password) {
  return await bcrypt.hash(password, 10);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __projectRoot = path.join(__dirname, "..");
const __prismaDir = path.join(__projectRoot, "prisma");
const __seedDir = path.join(__prismaDir, "seeds");

function getSeeds(filePath) {
  try {
    const data = readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading seed file ${filePath}:`, e);
    process.exit(1);
  }
}

async function insertItem(model, item) {
  try {
    if (!item) {
      return;
    }

    if (item.password) {
      item.password = await hash(item.password);
    }

    // First check if the item exists
    if (model === 'cooperativa' && item.cnpj) {
      const existing = await prisma[model].findFirst({
        where: { cnpj: item.cnpj }
      });

      if (existing) {
        console.log(`${model} with cnpj ${item.cnpj} already exists, skipping.`);
        return;
      }
    }

    await prisma[model].create({ data: item });
  } catch (e) {
    console.error(`Error inserting item into ${model}:`, e);
    // Don't exit the process on non-critical errors
    if (e.code === 'P2002') {
      console.log(`Unique constraint error. Skipping this record.`);
    } else {
      process.exit(1);
    }
  }
}

async function updateItem(model, item, relationships) {
  try {
    if (!item || !item.id) {
      return;
    }
    const modelName = model.toLowerCase();
    if (!prisma[modelName]) {
      throw new Error(`Invalid model name: ${model}`);
    }
    await prisma[modelName].update({
      where: { id: item.id },
      data: relationships,
    });
  } catch (e) {
    console.error(`Error updating relationships in ${model}:`, e);
    process.exit(1);
  }
}

async function seedModel(model, filePath) {
  const items = getSeeds(filePath);
  if (!items) {
    return;
  }

  // Check if this is an update file
  const isUpdateFile = filePath.includes("_update_");

  // Extract model name from filename and normalize it
  const modelName = model.charAt(0).toLowerCase() + model.slice(1);

  if (isUpdateFile) {
    for (const item of items) {
      const relationships = { ...item };
      delete relationships.id; // Remove id from relationships data
      await updateItem(modelName, item, relationships);
    }
  } else {
    for (const item of items) {
      await insertItem(modelName, item);
    }
  }
}

(async function seed() {
  try {
    // First process regular seed files
    const seedFiles = readdirSync(__seedDir)
      .filter((file) => !file.includes("_update_"))
      .sort();

    for (const seedFile of seedFiles) {
      const model = seedFile.split("_")[1].split(".")[0];
      const filePath = path.join(__seedDir, seedFile);
      await seedModel(model, filePath);
    }

    // Then process update files
    const updateFiles = readdirSync(__seedDir)
      .filter((file) => file.includes("_update_"))
      .sort();

    for (const updateFile of updateFiles) {
      const model = updateFile.split("_update_")[1].split(".")[0];
      const filePath = path.join(__seedDir, updateFile);
      await seedModel(model, filePath);
    }

    console.log("Seeding completed successfully.");
  } catch (e) {
    console.error("Seeding failed:", e);
  } finally {
    await prisma.$disconnect();
  }
})();
