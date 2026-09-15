export const FUSO = 'America/Sao_Paulo';

export function dateKeyInFuso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { timeZone: FUSO });
}

export function formatTimeInFuso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateInFuso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { timeZone: FUSO });
}

export function sameDayInFuso(a: Date | string, b: Date | string): boolean {
  const left = dateKeyInFuso(a);
  const right = dateKeyInFuso(b);
  return Boolean(left) && left === right;
}

/** Interpreta YYYY-MM-DD como meio-dia no Fuso (vencimento de Tarefa). */
export function dueAtFromDateInput(yyyyMmDd: string): string {
  return `${yyyyMmDd}T12:00:00-03:00`;
}

export function dateInputFromIso(iso?: string): string {
  if (!iso) return '';
  return dateKeyInFuso(iso);
}

/** Interpreta datetime-local (YYYY-MM-DDTHH:mm) como horário no Fuso. */
export function isoFromDatetimeLocal(value: string): string {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return new Date(value).toISOString();
  const [, year, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00-03:00`;
}

export function datetimeLocalFromIso(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}:${pick('minute')}`;
}
