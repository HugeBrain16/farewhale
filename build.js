const ejs = require("ejs");
const fs = require("fs-extra");
const path = require("path");

const dest = path.join(__dirname, "dist");
const icon = path.join(__dirname, "favicon.ico");

console.log("Building...");

if (fs.existsSync(dest)) {
  fs.removeSync(dest);
}
fs.mkdirSync(dest);

console.log("Copying assets...");
fs.copySync(path.join(__dirname, "assets"), path.join(dest, "assets"));

if (fs.existsSync(icon)) {
  console.log("Copying icon file...");
  fs.copySync(icon, dest + "/favicon.ico");
}

function compileDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });

  fs.readdirSync(srcDir).forEach((file) => {
    const inputFile = path.join(srcDir, file);
    const stat = fs.statSync(inputFile);

    if (stat.isDirectory()) {
      compileDir(inputFile, path.join(outDir, file));
      return;
    }

    if (!file.endsWith(".ejs")) {
      fs.copySync(inputFile, path.join(outDir, file));
      return;
    }

    const outputFile = path.join(outDir, file.replace(".ejs", ".html"));
    console.log(
      `Compiling ${path.relative(__dirname, inputFile)} -> ${path.relative(__dirname, outputFile)}...`
    );

    const fileContent = fs.readFileSync(inputFile, "utf8");
    try {
      const html = ejs.render(fileContent, {}, { filename: inputFile, root: __dirname });
      fs.writeFileSync(outputFile, html);
    } catch (err) {
      console.error(`Error compiling ${file}:`, err);
      process.exit(1);
    }
  });
}

compileDir(path.join(__dirname, "src/pages"), dest);
console.log("Build complete!");
