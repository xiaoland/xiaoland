import { copyFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const sourceDir = join(projectRoot, "dist", "lanzhijiang", "assets");
const targetDir = join(projectRoot, "dist", "client", "assets");

console.log("Copying worker assets to client directory...");

if (!existsSync(sourceDir)) {
  console.log("Source directory does not exist:", sourceDir);
  process.exit(0);
}

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

try {
  const files = readdirSync(sourceDir);

  for (const file of files) {
    if (
      file.endsWith(".png") ||
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".gif") ||
      file.endsWith(".svg")
    ) {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(targetDir, file);

      copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file}`);
    }
  }

  console.log("Asset copying completed successfully.");
} catch (error) {
  console.error("Error copying assets:", error);
  process.exit(1);
}
