export type ResultMessage = { title: string; subtitle: string };

/** A short Hebrew verdict for the results screen, by the share of correct answers. */
export function resultMessage(score: number, total: number): ResultMessage {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) return { title: 'ציון מושלם!', subtitle: 'ידעתם הכול. מרשים מאוד.' };
  if (ratio >= 0.8) return { title: 'מצוין!', subtitle: 'כמעט הכול נכון.' };
  if (ratio >= 0.6) return { title: 'יפה מאוד', subtitle: 'ידעתם את רוב התשובות.' };
  if (ratio >= 0.4) return { title: 'לא רע', subtitle: 'עוד סיבוב ואתם שם.' };
  return { title: 'נושא לא פשוט', subtitle: 'שווה לנסות עוד סיבוב.' };
}
