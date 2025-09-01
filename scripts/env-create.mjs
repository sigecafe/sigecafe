import { writeFileSync } from "fs";
import { platform } from "os";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __projectRoot = path.join(__dirname, "..");
const destination = path.join(__projectRoot, ".env");

const template = `
BASE_URL="http://localhost:3000"
AUTH_SECRET="secret"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sigecafe"
SESSION_REFRESH_SECONDS=10
SESSION_MAX_AGE_SECONDS=600
`;

writeFileSync(destination, template);
