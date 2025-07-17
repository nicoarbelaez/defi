const { spawn } = require("child_process");

let input = process.argv[2];
if (!input) {
  console.error("Debes proporcionar el scriptId o la URL como argumento.");
  process.exit(1);
}

// Extraer scriptId si es una URL
let scriptId = input;
const urlRegex = /\/projects\/([a-zA-Z0-9-_]+)\//;
const match = input.match(urlRegex);
if (match) {
  scriptId = match[1];
}

if (!scriptId) {
  console.error("No se pudo extraer el scriptId.");
  process.exit(1);
}

// Ejecutar clasp setting scriptId "{scriptId}"
const claspPath = "C:\\Users\\arbel\\AppData\\Roaming\\npm\\clasp.ps1"; // Ajusta según tu sistema
const clasp = spawn("pwsh.exe", ["-File", claspPath, "setting", "scriptId", scriptId], {
  stdio: "inherit",
});

clasp.on("close", (code) => {
  if (code !== 0) {
    console.error(`clasp setting terminó con código ${code}`);
    process.exit(code);
  }

  // Ejecutar pnpm push y responder "Y" si es necesario
  const pnpmPath = "C:\\Users\\arbel\\AppData\\Local\\pnpm\\pnpm.CMD"; // Ajusta según tu sistema
  const pnpm = spawn("pwsh.exe", ["-Command", `echo Y | ${pnpmPath} push`], { stdio: "inherit" });

  pnpm.on("close", (code) => {
    if (code !== 0) {
      console.error(`pnpm push terminó con código ${code}`);
      process.exit(code);
    }
    console.log("Comandos ejecutados correctamente.");
  });
});
