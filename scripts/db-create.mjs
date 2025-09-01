import { exec } from "child_process";

console.log("Creating database...");

const containerName = "postgres";
const dbName = "sigecafe";

exec(
  `docker run --name ${containerName} -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=${dbName} -d postgres`,
  (err, stdout) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }

    if (stdout.includes(containerName)) {
      exec(`docker rm -f ${containerName}`, (rmErr, rmStdout) => {
        if (rmErr) {
          console.error(`Remove Error: ${rmErr}`);
        } else {
          console.log(`Container ${containerName} removed: ${rmStdout}`);
        }
      });
    } else {
      console.log(`Container ${containerName} not found`);
    }
    let dbExists = false;
    let attempts = 0;
    const checkDb = () => {
      attempts++;
      if (attempts > 10) {
        console.error("Failed to connect to the database after 10 attempts.");
        return;
      }
      exec(`docker exec ${containerName} psql -U postgres -c "SELECT 1" -d ${dbName}`, (err, stdout) => {
        if (err) {
          console.error("Database not ready yet, retrying...");
          setTimeout(checkDb, 1000);
        } else {
          console.log(`Database ${dbName} exists and is ready`);
          dbExists = true;
        }
      });
    };
    checkDb();
  }
);
