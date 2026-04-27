const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeDate(input?: string | Date | null) {
  if (!input) return new Date();
  if (input instanceof Date) return new Date(input);
  return new Date(input);
}

export function formatDateOnly(input?: string | Date | null) {
  const date = normalizeDate(input);
  return date.toISOString().slice(0, 10);
}

export function formatDateTimeLocal(input?: string | Date | null) {
  if (!input) return "";
  const date = normalizeDate(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getISOWeek(input?: string | Date | null) {
  const date = normalizeDate(input);
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function weekRange(isoWeek: string) {
  const [yearPart, weekPart] = isoWeek.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;
  const monday = new Date(simple);

  if (day <= 4) {
    monday.setUTCDate(simple.getUTCDate() - day + 1);
  } else {
    monday.setUTCDate(simple.getUTCDate() + 8 - day);
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday.getTime() + index * DAY_MS);
    return {
      date: current.toISOString().slice(0, 10),
      label: current.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      weekday: current.toLocaleDateString("en-GB", {
        weekday: "long",
        timeZone: "UTC",
      }),
    };
  });

  return {
    start: days[0]?.date ?? "",
    end: days[6]?.date ?? "",
    days,
  };
}

export function getCurrentWeek() {
  return getISOWeek(new Date());
}

export function getWeekTuesday(isoWeek: string) {
  const range = weekRange(isoWeek);
  return range.days[1]?.date ?? range.start;
}

