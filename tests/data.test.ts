import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import disciplinas from "../src/data/disciplinas.json";
import horarios from "../src/data/horarios.json";
import { aMinutos, DISCIPLINA_A_ACTIVIDADES, type Clase } from "../src/lib/horarios";

// Los datos los editan personas a mano: estos tests evitan publicar errores.
const activas = disciplinas.filter((d) => d.activo !== false);
const clases = Object.values(horarios.horario_semanal as Record<string, Clase[]>).flat();

describe("disciplinas.json", () => {
  it("los ids son únicos y válidos como slug de URL", () => {
    const ids = disciplinas.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(activas.map((d) => [d.id, d]))("%s tiene imagen existente y color válido", (_, d) => {
    expect(existsSync(join("public", d.imagen)), `falta ${d.imagen}`).toBe(true);
    expect(d.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it("toda disciplina activa está enlazada con el horario", () => {
    for (const d of activas) expect(DISCIPLINA_A_ACTIVIDADES, d.id).toHaveProperty(d.id);
  });
});

describe("horarios.json", () => {
  it.each(clases.map((c) => [`${c.actividad} ${c.inicio}`, c]))(
    "%s: hora de fin posterior a la de inicio",
    (_, c) => {
      expect(aMinutos(c.fin)).toBeGreaterThan(aMinutos(c.inicio));
    },
  );

  it("cada actividad del mapeo existe en el horario (detecta erratas)", () => {
    const actividades = new Set(clases.map((c) => c.actividad));
    const idsActivos = new Set(activas.map((d) => d.id));
    for (const [id, nombres] of Object.entries(DISCIPLINA_A_ACTIVIDADES)) {
      if (!idsActivos.has(id)) continue;
      expect(nombres.some((n) => actividades.has(n)), `${id}: ${nombres}`).toBe(true);
    }
  });
});
