import fs from "fs/promises";
import buildSvg from "../utils/svgBuilder.js";
import { toPng, toJpg } from "../utils/imageConverter.js";

export default async function (req, res) {
  const data = {
    triceps: +req.query.triceps || 0,
    biceps: +req.query.biceps || 0,
    lumbar: +req.query.lumbar || 0,
    trapecio: +req.query.trapecio || 0,
    dorsal: +req.query.dorsal || 0,
    pectoral: +req.query.pectoral || 0,
    hombros: +req.query.hombros || 0,
    abdomen: +req.query.abdomen || 0,
    antebrazo: +req.query.antebrazo || 0,
    cuadriceps: +req.query.cuadriceps || 0,
    aductores: +req.query.aductores || 0,
    femoral: +req.query.femoral || 0,
    gluteo: +req.query.gluteo || 0,
    pantorrillas: +req.query.pantorrillas || 0,
  };

  const format = req.query.format === "jpg" ? "jpg" : "png";

  try {
    const svgTemplate = await fs.readFile(
      new URL("../templates/body.svg", import.meta.url),
      "utf8"
    );
    const svg = buildSvg(svgTemplate, data);

    const imgBuffer = format === "jpg" ? await toJpg(svg) : await toPng(svg);

    res.set("Content-Type", `image/${format}`);
    res.send(imgBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando la imagen" });
  }
}
