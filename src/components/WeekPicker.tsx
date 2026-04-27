export function WeekPicker({
  currentWeek,
  name = "week",
}: {
  currentWeek: string;
  name?: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor={name}>Week</label>
        <input id={name} name={name} type="week" defaultValue={currentWeek} />
      </div>
      <button type="submit" className="secondary-button">
        Go
      </button>
    </form>
  );
}

