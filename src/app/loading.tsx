export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
