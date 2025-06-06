import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

async function addJsExtensions(content) {
	// Lägg till .js i alla relativa importer som inte är npm-paket och som inte redan har .js
	return content.replace(
		/from\s+["'](\.[^"']+?)(?!\.js["'])["']/g,
		(match, path) => `from '${path}.js'`,
	);
}

async function findJsFiles(dir) {
	const files = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findJsFiles(fullPath)));
		} else if (entry.isFile() && entry.name.endsWith(".js")) {
			files.push(fullPath);
		}
	}

	return files;
}

async function buildCron() {
	try {
		// Rensa dist-cron-mappen
		console.log("Cleaning dist-cron directory...");
		await rm(join(rootDir, "dist-cron"), { recursive: true, force: true });
		await mkdir(join(rootDir, "dist-cron"), { recursive: true });

		// Kompilera TypeScript
		console.log("Compiling TypeScript...");
		const { execSync } = await import("node:child_process");
		execSync("npx tsc --project tsconfig.cron.json", { stdio: "inherit" });

		// Hitta alla JS-filer i dist-cron
		console.log("Processing compiled files...");
		const files = await findJsFiles(join(rootDir, "dist-cron/src"));

		// Modifiera varje fil för att lägga till .js i importer
		for (const file of files) {
			const content = await readFile(file, "utf8");
			const modifiedContent = await addJsExtensions(content);
			await writeFile(file, modifiedContent, "utf8");
		}

		console.log("Build completed successfully!");
	} catch (error) {
		console.error("Build failed:", error);
		process.exit(1);
	}
}

buildCron();
