export function validateEventDateRange(
  startValue: string,
  endValue: string,
  now: Date = new Date(),
): void {
  const startDate = new Date(startValue);
  const endDate = new Date(endValue);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Fechas inválidas.");
  }

  const startUtc = new Date(startDate.getTime());
  const nowUtc = new Date(now.getTime());

  if (startUtc < nowUtc) {
    throw new Error("La fecha de inicio no puede estar en el pasado.");
  }

  if (endDate <= startDate) {
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");
  }
}
