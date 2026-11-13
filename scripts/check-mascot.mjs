/* Garante que nenhuma seção fica sem a mascote (docs/mascote-brief.md, 6.6).
   Falha (e derruba o build) se algum <section> ou o <footer> de qualquer
   página não tiver data-mascot-spot. Exceção: data-mascot-spot="none" com um
   comentário HTML logo antes explicando o motivo.
   Também confere: spot válido, <div class="mascot-slot"> presente e que
   data-mascot / data-mascot-view não foram reaproveitados para posição. */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPOTS = ["caixa", "palco", "mini", "espiar-baixo", "espiar-lado", "sentada", "rosto", "none"]; // rosto = só o rosto, em avatar (loja)
const pages = (await readdir(root)).filter((f) => f.endsWith(".html"));
const errors = [];
let total = 0;

for (const page of pages) {
  const html = await readFile(path.join(root, page), "utf8");
  const re = /<(section|footer)\b([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    total++;
    const [tag, name, attrs] = m;
    const line = html.slice(0, m.index).split("\n").length;
    const where = `${page}:${line} <${name}${(attrs.match(/aria-labelledby="([^"]+)"/) || attrs.match(/class="([^"]+)"/) || ["", ""])[1] ? " " + (attrs.match(/aria-labelledby="([^"]+)"/) || attrs.match(/class="([^"]+)"/))[1] : ""}>`;
    const spot = (attrs.match(/data-mascot-spot="([^"]*)"/) || [])[1];
    if (spot === undefined) { errors.push(`${where}: falta data-mascot-spot`); continue; }
    if (!SPOTS.includes(spot)) { errors.push(`${where}: data-mascot-spot="${spot}" não existe (use ${SPOTS.join(", ")})`); continue; }
    if (spot === "none") {
      if (!/<!--[^]*?-->\s*$/.test(html.slice(Math.max(0, m.index - 400), m.index))) errors.push(`${where}: spot "none" precisa de um comentário logo antes explicando o motivo`);
      continue;
    }
    const end = html.indexOf(`</${name}>`, m.index);
    if (!/class="mascot-slot[ "]/.test(html.slice(m.index, end))) errors.push(`${where}: falta <div class="mascot-slot"> dentro da seção`);
    if (/data-mascot(-view)?="(caixa|palco|mini|espiar-baixo|espiar-lado|sentada)"/.test(tag)) errors.push(`${where}: data-mascot / data-mascot-view são gatilhos de evento, não posição`);
  }
}

if (errors.length) {
  console.error(`\ncheck-mascot: ${errors.length} problema(s)\n- ` + errors.join("\n- ") + "\n");
  process.exit(1);
}
console.log(`check-mascot: ok (${total} seções em ${pages.length} página(s), todas com a mascote)`);
