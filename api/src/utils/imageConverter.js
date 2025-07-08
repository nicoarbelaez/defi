import sharp from "sharp";

export async function toPng(svg) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function toJpg(svg) {
  return sharp(Buffer.from(svg)).jpeg({ quality: 90, force: true }).toBuffer();
}
