import * as cheerio from "cheerio";

/**
 * template: string con el SVG original
 * data: objeto con valores 0–3 por músculo
 */
export default function buildSvg(template, data) {
  const $ = cheerio.load(template, { xmlMode: true });

  for (const [muscle, val] of Object.entries(data)) {
    const color = mapValueToColor(val);
    // Asegúrate de que los IDs coincidan: pectoral, biceps, abdomen, quadriceps...
    $(`#${muscle}`).find("*").attr("fill", color);
  }

  return $.xml();
}

function mapValueToColor(v) {
  return (
    {
      1: "#ea9999",
      2: "#ea9999",
      3: "#ffe599",
      4: "#b6d7a8",
      5: "#b6d7a8",
    }[v] || "#3f4140"
  ); // default
}
