/**
 * Lógica pura de horarios: sin dependencias de Astro para poder testearla
 * de forma aislada (ver tests/horarios.test.ts).
 */

export type Clase = {
  inicio: string;
  fin: string;
  actividad: string;
  grupo: string;
};

export type ClaseFiltrada = Clase & { dia: DiaSemana; nombreMostrar: string };

export type HorarioSemanal = Partial<Record<string, Clase[]>>;

export const DIAS_SEMANA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const DIAS_NOMBRES: Record<DiaSemana, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
};

/**
 * Relaciona el id de cada disciplina con los nombres de actividad que se usan
 * en horarios.json. La comparación es exacta para evitar falsos positivos
 * (p. ej. "Jiu Jitsu" no debe capturar "BJJ (Jiu Jitsu)").
 */
export const DISCIPLINA_A_ACTIVIDADES: Record<string, string[]> = {
  "aikido-tomiki": ["Aikido"],
  boxeo: ["Boxeo", "Kick Boxing / Boxeo"],
  "brazilian-jiu-jitsu": ["BJJ (Jiu Jitsu)", "Jiu Jitsu"],
  bujinkan: ["Budo Taijutsu"],
  hapkido: ["Hapkido"],
  "ju-jutsu": ["Jiu Jitsu"],
  "karate-do": ["Karate"],
  kenjutsu: ["Kenjutsu"],
  "kick-boxing-k1": ["Kick Boxing", "Kick Boxing / Boxeo"],
  "krav-maga": ["Krav Maga"],
  lucha: ["Lucha"],
  "muay-thai": ["Muay Thai"],
  "tang-soo-do": ["Tang Soo Do"],
};

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Convierte "HH:MM" a minutos desde medianoche. Lanza si el formato es inválido. */
export function aMinutos(hora: string): number {
  if (!HORA_RE.test(hora)) throw new Error(`Hora inválida: "${hora}"`);
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Devuelve las clases de una disciplina agrupadas por día y franja horaria. */
export function getClasesForDisciplina(
  disciplinaId: string,
  nombreMostrar: string,
  horario: HorarioSemanal,
) {
  const actividades = DISCIPLINA_A_ACTIVIDADES[disciplinaId] ?? [];

  const clasesFiltradas: ClaseFiltrada[] = DIAS_SEMANA.flatMap((dia) =>
    (horario[dia] ?? [])
      .filter((clase) => actividades.includes(clase.actividad))
      .map((clase) => ({ ...clase, dia, nombreMostrar })),
  );

  const clasesPorDiaYHora: Record<string, ClaseFiltrada[]> = {};
  for (const clase of clasesFiltradas) {
    (clasesPorDiaYHora[`${clase.dia}-${clase.inicio}`] ??= []).push(clase);
  }

  const franjasUnicas = [...new Set(clasesFiltradas.map((c) => c.inicio))].sort(
    (a, b) => aMinutos(a) - aMinutos(b),
  );

  return {
    tieneClases: clasesFiltradas.length > 0,
    clasesPorDiaYHora,
    franjasUnicas,
    diasSemana: DIAS_SEMANA,
    diasNombres: DIAS_NOMBRES,
  };
}
