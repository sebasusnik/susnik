import { differenceInMonths } from "date-fns";
import type { Experience } from "../components/ExpList";

export function formatDuration(exp: Experience) {
  const end = exp.to === 'present' ? new Date() : exp.to;
  const months = Math.max(0, differenceInMonths(end, exp.from));
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts = [] as string[];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (remMonths) parts.push(`${remMonths} mo${remMonths > 1 ? 's' : ''}`);
  if (!parts.length) parts.push('0 mos');
  return parts.join(' ');
}
