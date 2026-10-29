/**
 * Helpers de date basés sur le fuseau horaire LOCAL de l'appareil.
 *
 * `Date#toISOString()` renvoie la date UTC : pour un utilisateur hors UTC,
 * la clé de jour pouvait basculer en cours de journée (ou de semaine) et
 * provoquer des remises à zéro en double. On compose donc les clés à partir
 * de getFullYear/getMonth/getDate.
 */

const pad = (value: number): string => String(value).padStart(2, '0');

/** Clé `YYYY-MM-DD` du jour local de `date`. */
export function getLocalDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Lundi (00:00 local) de la semaine contenant `date`. Ne modifie pas `date`. */
export function getLocalMonday(date: Date = new Date()): Date {
  const monday = new Date(date.getTime());
  monday.setHours(0, 0, 0, 0);
  const dayOfWeek = monday.getDay(); // 0 = dimanche
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - diff);
  return monday;
}

/** Clé `YYYY-MM-DD` du lundi local de la semaine contenant `date`. */
export function getLocalMondayKey(date: Date = new Date()): string {
  return getLocalDateKey(getLocalMonday(date));
}
