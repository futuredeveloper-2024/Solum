export default function NoticeToast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-5 top-5 z-50 flex justify-center">
      <div className="rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm font-medium text-foreground shadow-xl shadow-black/30 backdrop-blur-xl">
        {message}
      </div>
    </div>
  );
}
