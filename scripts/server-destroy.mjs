import { platform } from 'os';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get port from command line args or from .env file or default to 3000
const args = process.argv.slice(2);
let port = args[0];

// If no port is provided via arguments, try to get it from .env
if (!port) {
    try {
        const envPath = join(projectRoot, '.env');
        const envContent = readFileSync(envPath, 'utf8');

        // First look for APP_PORT or PORT directly
        let portMatch = envContent.match(/(?:^|\n)(?:APP_PORT|PORT)\s*=\s*(\d+)/i);

        if (portMatch && portMatch[1]) {
            port = portMatch[1];
            console.log(`Using port ${port} from APP_PORT/PORT in .env file`);
        } else {
            // Try to extract port from BASE_URL (format: "http://localhost:3000")
            portMatch = envContent.match(/BASE_URL\s*=\s*["'](?:https?:\/\/)?(?:localhost|[^:"']+):(\d+)["']/i);

            if (portMatch && portMatch[1]) {
                port = portMatch[1];
                console.log(`Using port ${port} from BASE_URL in .env file`);
            } else {
                port = 3000;
                console.log(`No port found in .env, using default port ${port}`);
            }
        }
    } catch (err) {
        // If .env file doesn't exist or can't be read
        port = 3000;
        console.log(`Could not read .env file, using default port ${port}`);
    }
}

try {
    if (platform() === 'win32') {
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        if (output) {
            const pid = output.split('\n')[0].trim().split(/\s+/).pop();
            execSync(`taskkill /PID ${pid} /F`);
            console.log(`Successfully killed process using port ${port}`);
        } else {
            console.log(`No process found using port ${port}`);
        }
    } else {
        try {
            execSync(`fuser -k ${port}/tcp`);
            console.log(`Successfully killed process using port ${port}`);
        } catch (error) {
            if (error.status === 1) {
                console.log(`No process found using port ${port}`);
            } else {
                throw error;
            }
        }
    }
} catch (error) {
    console.error(`Failed to kill process using port ${port}:`, error.message);
}