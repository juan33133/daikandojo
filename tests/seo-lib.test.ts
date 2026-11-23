import { describe, expect, it } from "vitest";
import { metaDescription } from "../src/lib/seo";

describe("metaDescription", () => {
  it("deja intactos los textos cortos (normalizando espacios)", () => {
    expect(metaDescription("  Hola   mundo \n")).toBe("Hola mundo");
  });

  it("recorta sin partir palabras y nunca supera el máximo", () => {
    const texto = "palabra ".repeat(40);
    const r = metaDescription(texto, 50);
    expect(r.length).toBeLessThanOrEqual(50);
    expect(r).toMatch(/palabra…$/);
  });

  it("quita la puntuación colgante antes de los puntos suspensivos", () => {
    expect(metaDescription("uno dos, tres cuatro", 10)).toBe("uno dos…");
  });
});
