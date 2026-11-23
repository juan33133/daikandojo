/** Recorta un texto para usarlo como meta description sin partir palabras. */
export function metaDescription(texto: string, max = 160): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max - 1);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return corte.slice(0, ultimoEspacio > 0 ? ultimoEspacio : corte.length).replace(/[\s,.;:]+$/, "") + "…";
}
