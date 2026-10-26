// UK time with the right zone label (GMT in winter, BST in summer). Never the visitor's location.
export function ukTime(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const raw = get("timeZoneName");
  const zone = /BST|GMT\+1|UTC\+1/.test(raw) ? "BST" : "GMT";
  return `${get("hour")}:${get("minute")} ${zone}`;
}
