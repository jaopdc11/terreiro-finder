/**
 * Aplica máscara visual do CEP brasileiro: "12345678" → "12345-678".
 * Aceita input sujo (com hífen, espaços, letras) — descarta não-dígitos
 * e limita a 8 dígitos. Use no onChange de inputs de CEP.
 */
export function formatarCep(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
