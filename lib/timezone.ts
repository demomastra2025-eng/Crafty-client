const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Oral"; // UTC+5 by default

type DateLike = Date | string | number | null | undefined;

const baseOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
};

export function formatDateTimeWithTz(value: DateLike, opts?: Intl.DateTimeFormatOptions) {
  if (!value && value !== 0) return "";
  try {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleString("ru-RU", {
      ...baseOptions,
      ...opts,
      timeZone: DEFAULT_TIMEZONE
    });
  } catch {
    return "";
  }
}

export function getTimezone() {
  return DEFAULT_TIMEZONE;
}
