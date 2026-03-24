export default function MoistureRing({ value, toneClass, labelClass = "text-foreground" }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-muted"
          strokeWidth="3"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
        />
        <path
          className={toneClass}
          strokeDasharray={`${value}, 100`}
          strokeWidth="3"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${labelClass}`}>{value}%</span>
    </div>
  );
}
