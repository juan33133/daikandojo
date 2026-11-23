/**
 * Auditoría SEO sobre el HTML generado en dist/ (ejecutar tras `astro build`).
 * Garantiza en CI que ninguna página pierde metadatos básicos.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "node-html-parser";
import { describe, expect, it } from "vitest";

const DIST = "dist";
// Dominio único de verdad: el `site` de astro.config.mjs (sin barra final)
const SITE = readFileSync("astro.config.mjs", "utf8")
  .match(/site:\s*['"]([^'"]+)['"]/)![1]
  .replace(/\/$/, "");

if (!existsSync(DIST)) throw new Error("No existe dist/: ejecuta `npm run build` antes.");

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name === "index.html" ? [p] : [];
  });

const pages = htmlFiles(DIST).map((file) => ({
  route: "/" + relative(DIST, file).replace(/index\.html$/, ""),
  doc: parse(readFileSync(file, "utf8")),
}));
const indexables = pages.filter(
  (p) => !p.doc.querySelector('meta[name="robots"]')?.getAttribute("content")?.includes("noindex"),
);
const meta = (doc: ReturnType<typeof parse>, sel: string) =>
  doc.querySelector(sel)?.getAttribute("content") ?? "";

describe.each(indexables)("$route", ({ route, doc }) => {
  it("tiene <title> único y de longitud razonable", () => {
    const title = doc.querySelector("title")?.text ?? "";
    expect(title.length).toBeGreaterThanOrEqual(10);
    expect(title.length).toBeLessThanOrEqual(65);
    const iguales = indexables.filter((p) => p.doc.querySelector("title")?.text === title);
    expect(iguales).toHaveLength(1);
  });

  it("tiene meta description entre 50 y 160 caracteres", () => {
    const d = meta(doc, 'meta[name="description"]');
    expect(d.length).toBeGreaterThanOrEqual(50);
    expect(d.length).toBeLessThanOrEqual(160);
  });

  it("tiene canonical absoluta que apunta a sí misma", () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(SITE + route);
  });

  it("tiene exactamente un <h1>", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("declara el idioma", () => {
    expect(doc.querySelector("html")?.getAttribute("lang")).toBe("es");
  });

  it("og:image es absoluta y el fichero existe", () => {
    const img = meta(doc, 'meta[property="og:image"]');
    expect(img.startsWith(SITE)).toBe(true);
    expect(existsSync(join(DIST, new URL(img).pathname))).toBe(true);
  });

  it("todas las imágenes tienen alt", () => {
    const sinAlt = doc.querySelectorAll("img").filter((i) => !i.hasAttribute("alt"));
    expect(sinAlt.map((i) => i.getAttribute("src"))).toEqual([]);
  });

  it("los JSON-LD son JSON válido", () => {
    for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
      expect(() => JSON.parse(s.text)).not.toThrow();
    }
  });
});

describe("dominio", () => {
  it("ninguna página referencia un dominio distinto del oficial", () => {
    for (const p of pages) {
      expect(p.doc.toString(), p.route).not.toMatch(/https?:\/\/(www\.)?daikandojo\.(?!es\b)/);
    }
  });
});

describe("sitemap y robots", () => {
  it("el sitemap contiene todas las páginas indexables y ninguna noindex", () => {
    const sitemap = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
    for (const p of pages) {
      const indexable = indexables.includes(p);
      expect(sitemap.includes(`<loc>${SITE}${p.route}</loc>`), p.route).toBe(indexable);
    }
  });

  it("robots.txt enlaza al sitemap", () => {
    expect(readFileSync(join(DIST, "robots.txt"), "utf8")).toContain(`${SITE}/sitemap-index.xml`);
  });
});
