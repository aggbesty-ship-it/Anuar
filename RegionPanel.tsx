import { Link } from "@tanstack/react-router";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGION_BY_ID, SUITABILITY_LABEL, GEO_SOURCE } from "@/lib/regions";
import { APPLICATION_LABEL } from "@/lib/demo-data";
import { fmt } from "@/lib/calc";
import { selectRegion, setState, useStore } from "@/lib/store";

const TBD = "Данные уточняются";

export function RegionPanel() {
  const id = useStore((s) => s.selectedRegion);
  const area = useStore((s) => s.plannedArea);
  const suit = useStore((s) => (id ? s.suitability[id] : undefined)) ?? "not_assessed";
  const products = useStore((s) => s.products);
  const r = id ? REGION_BY_ID[id] : null;

  if (!r) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <MapPin className="h-8 w-8 text-sage" />
        <p className="mt-3 font-display text-xl text-forest">Выберите территорию</p>
        <p className="mt-1 text-sm text-muted-foreground">Нажмите на область или город на карте, найдите её через поиск или выберите из списка.</p>
      </div>
    );
  }
  const avail = products.filter((p) => p.regions.length === 0 || p.regions.includes(r.id));
  const cats = [...new Set(avail.map((p) => APPLICATION_LABEL[p.application]))];
  const rows: [string, string][] = [
    ["Тип", r.type === "city" ? "Город республиканского значения" : "Область"],
    ["Административный центр", r.center ?? "—"],
    ["Крупные города", r.cities.join(", ")],
    ["Площадь (≈)", `${fmt(r.areaKm2)} км² — расчёт по геометрии OSM`],
    ["Климат", r.climate ? `${r.climate} (общая характеристика)` : TBD],
    ["Почвы", r.soil ?? TBD],
    ["Местные виды растений", TBD],
    ["Возможные направления", r.type === "city" ? "Городское озеленение подходящих участков" : "Определяются после экологической оценки"],
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{r.type === "city" ? "Город" : "Область"} · {r.id}</p>
          <h3 className="mt-1 text-2xl font-semibold text-forest">{r.ru}</h3>
          <p className="text-sm text-muted-foreground">{r.kk}</p>
        </div>
        <button onClick={() => selectRegion(null)} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Снять выбор"><X className="h-4 w-4" /></button>
      </div>
      <span className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-forest">Экологическая пригодность: {SUITABILITY_LABEL[suit]}</span>
      <dl className="mt-5 space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className={v === TBD ? "italic text-muted-foreground" : "text-forest"}>{v}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[9rem_1fr] gap-3">
          <dt className="text-muted-foreground">Категории продукции</dt>
          <dd className="text-forest">{cats.join(", ") || TBD} <span className="text-xs text-muted-foreground">(демо)</span></dd>
        </div>
      </dl>
      <label className="mt-5 block text-sm font-medium text-forest">
        Планируемая площадь, га
        <input type="number" min={0} step="0.1" value={area} onChange={(e) => setState(() => ({ plannedArea: Number(e.target.value) }))} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
      </label>
      <div className="mt-4 grid gap-2">
        <Button asChild className="rounded-full"><Link to="/planner">Запланировать озеленение здесь</Link></Button>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="rounded-full"><Link to="/calculator">Калькулятор</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link to="/contacts" search={{ type: "consultation" }}>Запросить консультацию</Link></Button>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">Источник границ и площади: {GEO_SOURCE}. Справочные сведения носят общий характер; семена и удобрения подбираются индивидуально для каждой территории.</p>
    </div>
  );
}
