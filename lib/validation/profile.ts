import { z } from 'zod';

export function isAdultBirthDate(value: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(today);
  const part = (type: string) => Number(parts.find(p => p.type === type)?.value);
  const [year, month, day] = value.split('-').map(Number);
  const age = part('year') - year - (part('month') < month || (part('month') === month && part('day') < day) ? 1 : 0);
  return age >= 18 && age <= 120;
}
export const birthDateSchema = z.string().refine(value => isAdultBirthDate(value), 'Ingresa una fecha válida; debes tener al menos 18 años.');
export const genderSchema = z.enum(['femenino', 'masculino', 'no_binario', 'prefiero_no_decir', 'otro']);
