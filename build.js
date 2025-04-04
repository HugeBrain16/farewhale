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

const pages = path.join(__dirname, "src/pages");
fs.readdirSync(pages).forEach((file) => {
  if (!file.endsWith(".ejs")) return;

  const inputFile = path.join(pages, file);
  const outputFile = path.join(dest, file.replace(".ejs", ".html"));

  console.log(`Compiling ${file} to ${path.basename(outputFile)}...`);

  const fileContent = fs.readFileSync(inputFile, "utf8");

  try {
    const html = ejs.render(
      fileContent,
      {},
      { filename: inputFile, root: __dirname },
    );

    fs.writeFileSync(outputFile, html);
  } catch (err) {
    console.error(`Error compiling ${file}:`, err);
    process.exit(1);
  }
});

console.log("Build complete!");
