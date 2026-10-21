import type { Eye } from "@visus/shared";

export type Answers = Record<string, unknown>;

/** Every test gets these. Tests only collect raw answers; the server scores them. */
export type TestProps = {
  eye: Eye;
  pxPerMm: number;
  /** True while the pause sheet or exit dialog is open: stop timers. */
  paused: boolean;
  onDone: (answers: Answers) => void;
  onExit: () => void;
  onPause: () => void;
};

export const EYE_LABEL: Record<Eye, string> = { right: "Right eye", left: "Left eye", both: "Both eyes" };
export const COVER_LABEL: Record<Eye, string> = { right: "Cover left eye", left: "Cover right eye", both: "Both eyes open" };
