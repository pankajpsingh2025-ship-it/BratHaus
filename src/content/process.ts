// How a project runs (the process tray on Home and Studio).
export type Step = { n: string; title: string; text: string; art: "call" | "plan" | "build" | "launch" | "grow" };
export const process: Step[] = [
  { n: "01", title: "Call", text: "Twenty minutes to understand your business.", art: "call" },
  { n: "02", title: "Plan", text: "A clear plan and a fixed quote before we start.", art: "plan" },
  { n: "03", title: "Build", text: "Ads, website, agents and software, shown to you as we go.", art: "build" },
  { n: "04", title: "Launch", text: "Live, tested and tracked.", art: "launch" },
  { n: "05", title: "Grow", text: "We keep improving what brings in customers.", art: "grow" },
];
