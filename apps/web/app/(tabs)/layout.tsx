import { TabBar } from "@/components/TabBar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative h-full">
      {children}
      <TabBar />
    </div>
  );
}
