import { exec } from "child_process";

const containerName = "postgres";

exec(`docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`, (err, stdout) => {
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
    console.log(`Container ${containerName} does not exist.`);
  }
});
