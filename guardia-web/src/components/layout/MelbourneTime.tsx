import { useEffect, useState, type CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

function getMelbourneTime() {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      timeZone: "Australia/Melbourne",
    }).format(new Date());
  } catch {
    return "9:41";
  }
}

export default function MelbourneTime({ className, style }: Props) {
  const [time, setTime] = useState(() => getMelbourneTime());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(getMelbourneTime());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <span className={className} style={style}>
      {time}
    </span>
  );
}
