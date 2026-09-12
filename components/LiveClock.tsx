'use client';

import { useEffect, useState } from 'react';

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="liveClock" aria-live="polite">
        <span className="clockDate">Loading current date…</span>
        <strong className="clockTime">--:--:--</strong>
      </div>
    );
  }

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  const zone = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  })
    .formatToParts(now)
    .find((part) => part.type === 'timeZoneName')?.value;

  return (
    <div className="liveClock" aria-live="polite">
      <span className="clockLabel">Current Date & Time</span>
      <span className="clockDate">{date}</span>
      <strong className="clockTime">{time}</strong>
      <span className="clockZone">{zone ?? 'Local time'} · updates live</span>
    </div>
  );
}
