import type { PropsWithChildren } from "react";
import BottomNav from "./BottomNav";

type Props = PropsWithChildren<{
  withNav?: boolean;
  dark?: boolean;
}>;

export default function PhoneFrame({ children, withNav, dark }: Props) {
  return (
    <div className="app-shell">
      <main className="frame" style={dark ? { background: "#1A1210" } : undefined}>
        {children}
        {withNav ? <BottomNav /> : null}
      </main>
    </div>
  );
}
