export function formatDate(input: Date | string): string {
  const date = new Date(input)
  return date.toLocaleDateString('pt-BR')
}