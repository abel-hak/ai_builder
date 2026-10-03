import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Cpu } from "lucide-react";
import { MODELS, useModel, type ModelId } from "@/lib/models";

/** Compact model switcher shared by every tool. Persists to localStorage. */
const ModelPicker = ({ disabled = false }: { disabled?: boolean }) => {
  const [model, setModel] = useModel();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = MODELS.find((m) => m.id === model) ?? MODELS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: ModelId) => {
    setModel(id);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Model: ${current.label}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
      >
        <Cpu size={12} className="text-primary" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Choose a model"
          className="absolute right-0 top-full mt-1 py-1 w-56 bg-card border border-border rounded-lg shadow-card z-20"
        >
          {MODELS.map((m) => (
            <li key={m.id} role="option" aria-selected={m.id === model}>
              <button
                type="button"
                onClick={() => choose(m.id)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors ${
                  m.id === model ? "text-primary" : "text-foreground/80"
                }`}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {m.note} · ${m.inputPerM}/${m.outputPerM} per 1M
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelPicker;
