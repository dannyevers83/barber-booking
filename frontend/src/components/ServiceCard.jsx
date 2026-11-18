// ─── Service card component ─────────────────────────────────────────────
function ServiceCard({ service, isSelected, onSelect }) {
  // ─── Selectable service card ──────────────────────────────────────────
  return (
    <button
      type="button"
      className="w-full rounded-xl border-2 border-transparent bg-card p-6 text-left aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      onClick={() => onSelect(service.id)}
      aria-pressed={isSelected}
    >
      <span className="block text-xl font-semibold">{service.name}</span>
      <span className="mt-2 block text-muted-foreground">
        {service.duration} minutes — €{service.price}
      </span>
    </button>
  );
}

export default ServiceCard;
