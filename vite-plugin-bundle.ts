import fs from "fs";
import path from "path";

const walk = async function* (dir: string) {
	for await (const dirent of await fs.promises.opendir(dir)) {
		const entry = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			yield* walk(entry);
		} else {
			yield entry;
		}
	}
};

const vitePluginBundle = () => ({
	name: "vite-plugin-bundle",
	async buildStart() {
		const srcPath = path.resolve("src");
		for await (const p of walk(srcPath)) {
			const fullPath = path.resolve(p);
			const contents = fs.readFileSync(fullPath);
			const fileName = path.relative(srcPath, fullPath);
			this.emitFile({
				type: "asset",
				source: contents,
				fileName: fileName
			});
		}
	}
});

export default vitePluginBundle;
