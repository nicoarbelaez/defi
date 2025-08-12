// deploy-clasp-pnpm.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const claspPath = "C:\\Users\\arbel\\AppData\\Roaming\\npm\\clasp.ps1"; // Mantén esto si lo necesitas, como en tu script original

function extractScriptId(input) {
  if (!input) return null;
  const s = String(input).trim();

  // script.google.com/projects/<id>/...
  const projectRegex = /\/projects\/([a-zA-Z0-9-_]+)\//;
  const m1 = s.match(projectRegex);
  if (m1) return m1[1];

  // docs links: /d/<id>/
  const dRegex = /\/d\/([a-zA-Z0-9-_]+)\//;
  const m2 = s.match(dRegex);
  if (m2) return m2[1];

  // si ya nos pasan solo el id
  if (/^[a-zA-Z0-9-_]+$/.test(s)) return s;

  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Exit code ${code}`));
    });
  });
}

async function runClaspSetting(scriptId) {
  console.log(`\n--- Ejecutando: clasp setting scriptId ${scriptId} ---`);
  // Ejecuta el script de PowerShell que hace: clasp setting scriptId <id>
  await runCommand("pwsh.exe", ["-File", claspPath, "setting", "scriptId", scriptId]);
}

async function runPnpmPush() {
  console.log(`Ejecutando: pnpm push (confirmando "Y" automáticamente)`);
  // Usamos pnpm desde PATH — no hardcodeamos pnpmPath
  // echo Y | pnpm push  (se ejecuta dentro de pwsh para que el pipe funcione igual que en tu entorno)
  await runCommand("pwsh.exe", ["-Command", `echo Y | pnpm push`]);
}

async function main() {
  const input = process.argv[2];

  let scriptIds = [];

  if (input) {
    // Si nos pasaron argumento, intentar extraer scriptId de url o id
    const sid = extractScriptId(input);
    if (!sid) {
      console.error("No se pudo extraer scriptId del argumento proporcionado.");
      process.exit(1);
    }
    scriptIds = [sid];
  } else {
    // No se pasó argumento => leer appscript-link.json y obtener todos los ids
    const jsonFile = path.join(__dirname, "appscript-link.json");
    if (!fs.existsSync(jsonFile)) {
      console.error("No se proporcionó argumento y no existe appscript-link.json en el directorio.");
      process.exit(1);
    }

    let data;
    try {
      data = fs.readFileSync(jsonFile, "utf8");
    } catch (err) {
      console.error("Error leyendo appscript-link.json:", err.message);
      process.exit(1);
    }

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (err) {
      console.error("appscript-link.json no es JSON válido:", err.message);
      process.exit(1);
    }

    // parsed puede ser:
    // - un array de strings (ids o urls)
    // - un array de objetos { scriptId: "...", script: "...", url: "..."}
    // - un objeto con scriptId
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === "string") {
          const sid = extractScriptId(item);
          if (sid) scriptIds.push(sid);
        } else if (typeof item === "object" && item !== null) {
          const possible =
            item.scriptId || item.script || item.script_url || item.url || item.link;
          const sid = extractScriptId(possible);
          if (sid) scriptIds.push(sid);
        }
      }
    } else if (typeof parsed === "object" && parsed !== null) {
      // objeto único
      const possible =
        parsed.scriptId || parsed.script || parsed.script_url || parsed.url || parsed.link;
      const sid = extractScriptId(possible);
      if (sid) scriptIds.push(sid);
    }

    // eliminar duplicados y nulos
    scriptIds = [...new Set(scriptIds.filter(Boolean))];

    if (scriptIds.length === 0) {
      console.error("No se encontró ningún scriptId válido en appscript-link.json.");
      process.exit(1);
    }

    console.log(`Se detectaron ${scriptIds.length} scriptId(s) en appscript-link.json.`);
  }

  const failures = [];

  // Ejecutar secuencialmente para evitar solapamientos
  for (const sid of scriptIds) {
    try {
      await runClaspSetting(sid);
    } catch (err) {
      console.error(`Error en 'clasp setting' para ${sid}:`, err.message);
      failures.push({ id: sid, step: "clasp setting", error: err.message });
      // continuar con siguiente id (no hacemos exit inmediato)
      continue;
    }

    try {
      await runPnpmPush();
    } catch (err) {
      console.error(`Error en 'pnpm push' para ${sid}:`, err.message);
      failures.push({ id: sid, step: "pnpm push", error: err.message });
      // continuar con siguiente id
      continue;
    }

    console.log(`✅ Despliegue completado para ${sid}`);
  }

  // Resumen final
  console.log("\n--- RESUMEN ---");
  if (failures.length === 0) {
    console.log("Todos los despliegues se completaron correctamente.");
    process.exit(0);
  } else {
    console.error(`${failures.length} despliegue(s) fallaron:`);
    failures.forEach((f) => {
      console.error(`- id: ${f.id} | paso: ${f.step} | error: ${f.error}`);
    });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
