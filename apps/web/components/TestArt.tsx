import type { TestId } from "@visus/shared";

import { categoryOf, testInfo } from "@/lib/tests";

import { Icon } from "./Icon";

/** Round-icon content for a test row: an "E" for acuity tests, else its category icon. */
export function TestIcon({ id, size = 20 }: { id: TestId; size?: number }) {
  if (id === "tumbling_e" || id === "kids_tumbling_e") return <>E</>;
  const icon = categoryOf(testInfo(id).category).icon;
  return icon === "E" ? <>Aa</> : <Icon name={icon} size={size} />;
}

const f2 = (n: number) => +n.toFixed(2);
const rot = (deg: number) => ({ display: "inline-block", transform: `rotate(${deg}deg)` });

/** Hero picture on the test detail screen: a small preview of the test itself. */
export function TestPreview({ id }: { id: TestId }) {
  switch (id) {
    case "tumbling_e":
    case "kids_tumbling_e":
      return (
        <div className="flex flex-col items-center gap-3 font-bold leading-none">
          <span className="text-[52px]">E</span>
          <div className="flex gap-[18px] text-[32px]">
            <span style={rot(90)}>E</span>
            <span style={rot(180)}>E</span>
            <span>E</span>
          </div>
          <div className="flex gap-3.5 text-[20px]">
            <span style={rot(270)}>E</span>
            <span>E</span>
            <span style={rot(90)}>E</span>
            <span style={rot(180)}>E</span>
          </div>
          <div className="flex gap-2.5 text-[13px]">
            <span>E</span>
            <span style={rot(180)}>E</span>
            <span style={rot(270)}>E</span>
            <span>E</span>
            <span style={rot(90)}>E</span>
          </div>
        </div>
      );
    case "near_reading":
      return (
        <div className="flex flex-col items-center gap-2 font-semibold leading-none">
          {[26, 20, 15, 11, 8].map((s, i) => (
            <span key={s} style={{ fontSize: s }}>
              {["Sun is up", "Birds sing at dawn", "We walk to the market", "Mother cooks rice for lunch", "The train leaves at nine today"][i]}
            </span>
          ))}
        </div>
      );
    case "near_point":
      return (
        <div className="flex items-center gap-5 text-[44px] font-bold">
          <span className="text-[22px] text-faint">40 cm</span>
          <span>Aa</span>
          <span className="text-[22px] text-faint">10 cm</span>
        </div>
      );
    case "clock_dial":
      return (
        <svg width="132" height="132" viewBox="-60 -60 120 120" stroke="#111" strokeWidth="2.4" strokeLinecap="round">
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <line key={a} x1={f2(-50 * Math.sin((a * Math.PI) / 180))} y1={f2(-50 * Math.cos((a * Math.PI) / 180))} x2={f2(50 * Math.sin((a * Math.PI) / 180))} y2={f2(50 * Math.cos((a * Math.PI) / 180))} />
          ))}
        </svg>
      );
    case "duochrome":
      return (
        <div className="grid h-[110px] w-[200px] grid-cols-2 overflow-hidden rounded-[14px] text-[26px] font-bold">
          <span className="grid place-items-center bg-[#D8432F]">HN</span>
          <span className="grid place-items-center bg-[#2E9A50]">DK</span>
        </div>
      );
    case "amsler":
      return (
        <svg width="132" height="132" viewBox="0 0 100 100">
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} stroke="#111" strokeWidth="0.8">
              <line x1={i * 10} y1="0" x2={i * 10} y2="100" />
              <line x1="0" y1={i * 10} x2="100" y2={i * 10} />
            </g>
          ))}
          <circle cx="50" cy="50" r="2.6" fill="#111" />
        </svg>
      );
    case "contrast":
      return (
        <div className="flex gap-3 text-[40px] font-bold">
          {["#111111", "#888888", "#C4C4C4", "#E1E1E1"].map((c, i) => (
            <span key={c} style={{ color: c }}>
              {"HOVK"[i]}
            </span>
          ))}
        </div>
      );
    case "peripheral_field":
      return (
        <svg width="132" height="132" viewBox="-60 -60 120 120">
          <circle r="56" fill="none" stroke="#ECECE8" />
          <circle r="3" fill="#111" />
          {[20, 75, 140, 200, 260, 320].map((a, i) => (
            <circle key={a} cx={f2((i % 2 ? 30 : 46) * Math.cos((a * Math.PI) / 180))} cy={f2((i % 2 ? 30 : 46) * Math.sin((a * Math.PI) / 180))} r="4" fill={i === 2 ? "#111" : "#D6D6D1"} />
          ))}
        </svg>
      );
    case "colour_plates":
    case "kids_colour_shapes":
      return (
        <svg width="132" height="132" viewBox="-60 -60 120 120">
          {Array.from({ length: 90 }, (_, i) => {
            const a = i * 2.39996;
            const r = 54 * Math.sqrt((i + 0.5) / 90);
            const fg = Math.abs(r * Math.cos(a)) < 16 && r * Math.sin(a) > -30;
            return <circle key={i} cx={f2(r * Math.cos(a))} cy={f2(r * Math.sin(a))} r={4.4} fill={fg ? ["#E07B39", "#E89048", "#D96A2E"][i % 3] : ["#7F9A4E", "#93A85A", "#A9B46A"][i % 3]} />;
          })}
        </svg>
      );
    default:
      return (
        <span className="grid size-20 place-items-center rounded-full bg-acc-soft text-acc-ink">
          <Icon name={categoryOf(testInfo(id).category).icon as "comfort"} size={40} />
        </span>
      );
  }
}
