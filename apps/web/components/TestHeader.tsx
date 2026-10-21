import { Pill } from "./Chip";
import { Icon } from "./Icon";
import { HeaderButton } from "./ScreenHeader";

type Props = {
  title: string;
  onExit: () => void;
  /** e.g. "Right eye" or "Both eyes". */
  eyeLabel?: string;
  /** Right of the eye pill, e.g. "Line 4 of 8 · 6/18", "Hold at 40 cm". */
  progress?: string;
  /** Pause button on the right instead of empty space. */
  onPause?: () => void;
};

/** Top of every visual test screen: exit, title, then eye pill + progress. */
export function TestHeader({ title, onExit, eyeLabel, progress, onPause }: Props) {
  return (
    <div className="flex-none">
      <div className="flex h-11 items-center">
        <HeaderButton icon="close" label="Exit test" onClick={onExit} />
        <div className="min-w-0 flex-1 truncate text-center text-[17px] font-bold">{title}</div>
        {onPause ? <HeaderButton icon="pause" label="Pause test" onClick={onPause} /> : <span className="w-11" />}
      </div>
      {(eyeLabel || progress) && (
        <div className="mt-4 flex items-center justify-between gap-3">
          {eyeLabel ? <Pill label={eyeLabel} leading={<Icon name="eye" size={16} />} /> : <span />}
          {progress && <span className="text-[14px] font-semibold text-muted">{progress}</span>}
        </div>
      )}
    </div>
  );
}
