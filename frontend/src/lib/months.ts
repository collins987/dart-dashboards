/** Month names used by the filters and the no-data panel. */
export const MONTH_LABELS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_LABELS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The year-to-date label in dart-api.yaml's format, for example "Jan–Nov 2026". */
export function yearToDateLabel(year: number, month: number): string {
  return `Jan–${MONTH_LABELS_SHORT[month - 1]} ${year}`;
}
