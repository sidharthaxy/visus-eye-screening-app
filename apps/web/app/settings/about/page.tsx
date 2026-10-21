import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";

const DOES = ["Screen your vision", "Track changes over time", "Remind you to rest your eyes"];
const DOESNT = ["Diagnose conditions", "Replace an eye exam", "Prescribe glasses or medicine"];

export default function About() {
  return (
    <Screen gap="gap-0">
      <ScreenHeader title="About" fallback="/settings" />
      <div className="mt-5 flex flex-none items-baseline justify-between gap-3">
        <span className="text-[28px] font-bold tracking-[-0.025em]">Visus</span>
        <span className="text-[13px] text-muted">Version 1.0</span>
      </div>
      <p className="m-0 mt-1.5 text-[16px] leading-normal text-muted text-pretty">Quick eye screening you can do at home, in a few minutes.</p>

      <div className="mt-[18px] grid flex-none grid-cols-2 gap-2.5">
        {[
          ["It does", DOES, true],
          ["It doesn't", DOESNT, false],
        ].map(([title, items, yes]) => (
          <div key={title as string} className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-3.5">
            <span className="text-[14px] font-bold">{title as string}</span>
            {(items as string[]).map((t) => (
              <div key={t} className="flex items-start gap-2 text-[14px] leading-[1.35] text-ink-soft">
                <span className={`grid size-5 flex-none place-items-center rounded-full ${yes ? "bg-good-bg" : "bg-fill"}`}>
                  {yes ? (
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#1D6A3E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 7.5l3 3 6-7" />
                    </svg>
                  ) : (
                    <svg width="9" height="9" viewBox="0 0 20 20" fill="none" stroke="#5F5F5B" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  )}
                </span>
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-none gap-3 rounded-[20px] border border-line bg-white p-4">
        <span className="grid size-9 flex-none place-items-center rounded-full bg-acc-soft text-acc-ink">
          <Icon name="lock" size={18} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[16px] font-bold">Your data and privacy</span>
          <span className="text-[14px] leading-[1.45] text-muted text-pretty">
            Tests run on your phone. Only your answers go to our AI, and results are saved securely to your account. The camera only measures distance and never records.
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-none gap-3 rounded-[20px] border border-ink bg-white p-4">
        <span className="grid size-9 flex-none place-items-center rounded-full bg-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M12 10.5v6M12 7.3v.2" />
          </svg>
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[16px] font-bold">Screening, not diagnosis</span>
          <span className="text-[14px] leading-[1.45] text-ink-soft text-pretty">
            Results point out signs worth checking. Only an eye doctor can diagnose. If your vision changes suddenly, see one right away.
          </span>
        </div>
      </div>

      <Spacer />
      <div className="flex flex-none justify-center gap-6">
        {["Terms of use", "Privacy policy", "Licences"].map((t) => (
          <a key={t} href="#" className="grid h-11 place-items-center text-[15px] font-semibold hover:text-muted">
            {t}
          </a>
        ))}
      </div>
    </Screen>
  );
}
