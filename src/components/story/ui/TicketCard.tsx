import { example } from "@/content/example-business";
import s from "./screens.module.css";

// The booking ticket that lifts out of the chat and flies into the diary. 300 × 168.
export default function TicketCard() {
  const b = example.booking;
  return (
    <div className={s.ticket}>
      <div className={s.ticketTop}><b>{b.status}</b><span>{example.short}</span></div>
      <div>
        <p className={s.ticketWhen}>{b.day} · {b.time}</p>
        <p className={s.ticketWhat}>{b.service} · {b.with}</p>
      </div>
    </div>
  );
}
