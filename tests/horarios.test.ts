import { describe, expect, it } from "vitest";
import {
  aMinutos,
  getClasesForDisciplina,
  type HorarioSemanal,
} from "../src/lib/horarios";

const horario: HorarioSemanal = {
  lunes: [
    { inicio: "19:00", fin: "20:00", actividad: "Karate", grupo: "Adultos" },
    { inicio: "17:00", fin: "18:00", actividad: "Karate", grupo: "Infantil" },
    { inicio: "18:00", fin: "19:00", actividad: "BJJ (Jiu Jitsu)", grupo: "Adultos" },
  ],
  miercoles: [
    { inicio: "09:00", fin: "10:00", actividad: "Karate", grupo: "Adultos" },
    { inicio: "20:00", fin: "21:00", actividad: "Kick Boxing / Boxeo", grupo: "Adultos" },
  ],
};

describe("aMinutos", () => {
  it("convierte HH:MM a minutos", () => {
    expect(aMinutos("00:00")).toBe(0);
    expect(aMinutos("17:45")).toBe(17 * 60 + 45);
  });

  it.each(["7:00", "24:00", "12:60", "abc", ""])("rechaza '%s'", (hora) => {
    expect(() => aMinutos(hora)).toThrow();
  });
});

describe("getClasesForDisciplina", () => {
  it("filtra las clases de la disciplina y las agrupa por día y hora", () => {
    const r = getClasesForDisciplina("karate-do", "Karate-Do", horario);

    expect(r.tieneClases).toBe(true);
    expect(r.clasesPorDiaYHora["lunes-17:00"]).toHaveLength(1);
    expect(r.clasesPorDiaYHora["lunes-17:00"][0]).toMatchObject({
      dia: "lunes",
      grupo: "Infantil",
      nombreMostrar: "Karate-Do",
    });
    expect(r.clasesPorDiaYHora["lunes-18:00"]).toBeUndefined();
  });

  it("ordena las franjas cronológicamente", () => {
    const r = getClasesForDisciplina("karate-do", "Karate", horario);
    expect(r.franjasUnicas).toEqual(["09:00", "17:00", "19:00"]);
  });

  it("una actividad compartida aparece en ambas disciplinas", () => {
    const boxeo = getClasesForDisciplina("boxeo", "Boxeo", horario);
    const kick = getClasesForDisciplina("kick-boxing-k1", "K1", horario);
    expect(boxeo.clasesPorDiaYHora["miercoles-20:00"]).toHaveLength(1);
    expect(kick.clasesPorDiaYHora["miercoles-20:00"]).toHaveLength(1);
  });

  it("no confunde nombres parecidos (regresión: 'Jiu Jitsu' ⊂ 'BJJ (Jiu Jitsu)')", () => {
    const r = getClasesForDisciplina("ju-jutsu", "Ju Jutsu", horario);
    expect(r.tieneClases).toBe(false);
  });

  it("devuelve vacío para disciplinas desconocidas", () => {
    const r = getClasesForDisciplina("no-existe", "X", horario);
    expect(r).toMatchObject({ tieneClases: false, franjasUnicas: [] });
  });
});
