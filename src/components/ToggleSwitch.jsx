export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-200 active:scale-95 ${
        checked
          ? "border-primary/40 bg-primary shadow-lg shadow-primary/20"
          : "border-border bg-muted"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      ></span>
    </button>
  );
}
