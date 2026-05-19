/**
 * Distância entre dois pontos geográficos em quilômetros (fórmula de
 * Haversine). Suficiente pra ordenação e exibição com 1-2 casas decimais —
 * o erro acumulado em distâncias terrestres curtas (<100 km) é desprezível.
 */
export function distanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // raio médio da Terra em km
  const dLat = grausParaRad(lat2 - lat1);
  const dLng = grausParaRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(grausParaRad(lat1)) *
      Math.cos(grausParaRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function grausParaRad(g: number): number {
  return (g * Math.PI) / 180;
}

/**
 * Formato amigável: "350 m", "2,3 km", "14 km".
 * Acima de 10 km arredonda pra inteiro; abaixo usa 1 casa decimal.
 */
export function formataDistancia(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km >= 10) {
    return `${Math.round(km)} km`;
  }
  // 1 casa decimal com vírgula
  return `${km.toFixed(1).replace('.', ',')} km`;
}
