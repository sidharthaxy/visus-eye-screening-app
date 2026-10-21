import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";

/** Temporary page for a route that isn't built yet. */
export function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} />
      <p className="text-muted">Coming soon.</p>
    </Screen>
  );
}
