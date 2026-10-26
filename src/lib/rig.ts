// The home story's single source of truth. The GSAP master timeline (scrubbed by scroll) tweens
// these plain objects; the 3D scene copies them onto meshes each frame (damped), and the DOM
// overlays are tweened by the same timeline, so 3D and text can never drift apart.
// Units: world units, degrees, 0–1 for opacity and progress values. The camera never moves:
// every device pose is fitted to the device zone (components/story/zones.ts).

export type Xf = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number; o: number };
const xf = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, o = 1): Xf => ({ x, y, z, rx, ry, rz, s, o });

function initial() {
  return {
    progress: 0,
    /** the hero's 3D logo: 0 resting … 1 turned edge-on and lifted away (the story's first 7%) */
    logo: { exit: 0 },
    phone: xf(0, 0, 0, 6, -18, 4, 1, 1),
    /** q = 1 stretches the browser to the phone screen's shape (it grows out of it), 0 its own */
    browser: { ...xf(0, 0, 0, 0, 0, 0, 0.3, 0), q: 0 },
    /** 0 = layers flat, 1 = fully exploded */
    layers: { spread: 0 },
    /** the booking ticket: lift = 0 inside the phone's last message … 1 floating at its own pose */
    ticket: { ...xf(0, 0, 0, 0, 0, 0, 1, 0), lift: 0 },
    /** the ticket flying along the thread into the diary (0 → 1) */
    fly: { p: 0 },
    laptop: xf(0, -1.8, -0.5, 0, 0, 0, 1, 0),
    /** the lid: 0 closed (−90°) … 1 open (−12°) */
    lid: { open: 0 },
    /** the gold thread: how far it has travelled along its anchors (0 off-screen right, 1 the ad,
     *  2 the website, 3 the phone, 4 the ticket, 5 the laptop screen) and its opacity */
    thread: { route: 0, o: 1 },
    /** the finale: devices → glowing nodes (0–1), then the thread → the BratHaus mark (0–1) */
    nodes: { p: 0, logo: 0 },
    /** screen UI state (written into CSS variables on the screens) */
    ui: {
      feed: 0,      // 0 top of the feed … 1 stopped on the Marlow & Finch ad
      tap: 0,       // tap ripple on "Book now"
      site: 0,      // phone shows the salon's mobile site
      chat: 0,      // phone shows the chat
      msg: 0,       // how many chat messages are in (0–4, fractional = appearing)
      typing: 0,    // typing indicator (0–1)
      diary: 0,     // the Saturday 10:30 slot filling
      toast: 0,     // "New booking from your AI agent"
      auto: 0,      // the automations ticking in
    },
  };
}

export type Rig = ReturnType<typeof initial>;
export const rig: Rig = initial();

/** Back to the opening frame (before a timeline is rebuilt). */
export function resetRig() {
  const fresh = initial();
  (Object.keys(fresh) as (keyof Rig)[]).forEach((k) => {
    const v = fresh[k];
    if (typeof v === "object") Object.assign(rig[k] as object, v);
    else (rig as Record<string, unknown>)[k] = v;
  });
}

/** Story-wide state the canvas needs. */
export const story = {
  active: false,
  lite: false,
  /** time-based intro (0 → 1 over ~1.2s once the 3D is ready) */
  intro: 0,
};
