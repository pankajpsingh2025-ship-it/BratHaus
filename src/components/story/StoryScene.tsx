"use client";
import { PerspectiveCamera, useProgress } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Vector3, type Group, type Object3D, type PerspectiveCamera as PCam } from "three";
import { rig } from "@/lib/rig";
import { htmlLayer, useStoryHost } from "@/lib/storyHost";
import { useEffectsLevel, useQuality } from "@/components/three/quality";
import Lights from "@/components/three/kit/Lights";
import Dust from "@/components/three/kit/Dust";
import Effects from "@/components/three/kit/Effects";
import PhoneScreens from "./ui/PhoneScreens";
import DashboardScreen from "./ui/DashboardScreen";
import Phone from "./Phone";
import Browser from "./Browser";
import BookingTicket from "./BookingTicket";
import Laptop from "./Laptop";
import Thread from "./Thread";
import Nodes from "./Nodes";
import LogoMark3D from "@/components/brand/LogoMark3D";
import { CALLOUTS, calloutOn } from "./callouts";
import { parts, PHONE, setVars } from "./parts";
import { clearAnchorCache, domBox } from "./anchors";
import { planFor } from "./timeline";
import { CAMERA, zonePoint } from "./zones";

// The home story's 3D, in the canvas's main scene (not a View): full screen, with postprocessing and
// the devices' DOM screens. Mounted once; hidden (and its effects off) while the story isn't on screen.
// The camera never moves: every device is placed in the device zone by the master timeline.
export default function StoryScene({ visible }: { visible: boolean }) {
  const host = useStoryHost();
  const quality = useQuality();
  const lite = quality === "lite";
  const reduced = useEffectsLevel() === "reduced";
  const zones = host.zones;
  const plan = useMemo(() => (zones && zones.layout !== "short" ? planFor(zones) : null), [zones]);
  const tall = plan?.portrait ?? false;
  const size = useThree((s) => s.size);
  const cam = useRef<PCam>(null);
  const els = useRef(new Map<string, HTMLElement | null>());
  const dash = useRef<HTMLElement | null>(null);
  const frames = useRef(0);
  const tmp = useMemo(() => new Vector3(), []);
  // the hero logo's exit, read from the rig each frame
  const logoExit = useMemo(() => ({ get current() { return rig.logo.exit; } }), []);
  const nodes = useMemo(() => (plan ? plan.nodes.map((n) => new Vector3(n.x, n.y, n.z)) : [0, 1, 2, 3].map(() => new Vector3())), [plan]);
  const dust = useMemo(() => (zones && plan ? { c: zonePoint(0.5, 0.5, -1, zones), w: zones.device.w * zonePoint(0, 0, -1, zones).k, h: zones.device.h * zonePoint(0, 0, -1, zones).k } : null), [zones, plan]);

  // real loading progress for the first-visit preloader (anything the scene's loaders fetch)
  const { progress, active } = useProgress();
  useEffect(() => { dispatchEvent(new CustomEvent("bh:3d-progress", { detail: { progress, active } })); }, [progress, active]);

  // the screens' DOM lives in a layer under the canvas: hide it with the story
  useEffect(() => { if (htmlLayer.current) htmlLayer.current.style.visibility = visible ? "visible" : "hidden"; }, [visible]);
  // a new layout re-measures the screens' anchors (their UIs reflow at a new zoom)
  useEffect(() => { clearAnchorCache(); parts.feedShift = 0; els.current.clear(); }, [plan]);

  // the overlap tests read where everything really is (dev, or ?debug in production)
  const debug = useMemo(() => typeof location !== "undefined" && (process.env.NODE_ENV !== "production" || /[?&]debug\b/.test(location.search)), []);
  const box = useMemo(() => new Box3(), []);
  // the canvas is fixed but the stage scrolls away at the story's end: the whole scene follows it up
  const world = useRef<Group>(null);
  const section = useRef<HTMLElement | null>(null);

  // framed Views on other pages leave the renderer's viewport/scissor on their own box: reset it first
  useFrame((st) => {
    if (!visible) return;
    st.gl.setScissorTest(false);
    st.gl.setViewport(0, 0, st.size.width, st.size.height);
  }, -1);

  useFrame(() => {
    const c = cam.current; if (!c || !visible) return;
    if (++frames.current === 4) dispatchEvent(new Event("bh:story-ready"));
    c.position.set(0, 0, CAMERA.z); c.lookAt(0, 0, 0); c.updateMatrixWorld();
    if (world.current && zones) {
      if (!section.current || !section.current.isConnected) section.current = document.querySelector<HTMLElement>("[data-story]");
      const r = section.current?.getBoundingClientRect();
      const past = r ? Math.max(0, innerHeight - r.bottom) : 0;          // px the stage has moved up
      world.current.position.y = past * zonePoint(0, 0, 0, zones).k;
    }

    // the screens' state (the feed scrolls exactly far enough to stop on the ad)
    const u = rig.ui;
    if (parts.phoneUi && !parts.feedShift) {
      const ad = domBox(parts.phoneUi, "[data-ad]", PHONE.cssW);
      if (ad && ad.y) { parts.feedShift = ad.y - ad.h / 2 - 96; parts.phoneUi.style.setProperty("--feed-shift", `${parts.feedShift}px`); }
    }
    setVars(parts.phoneUi, { "--feed": u.feed, "--tap": u.tap, "--site": u.site, "--chat": u.chat, "--msg": u.msg, "--typing": u.typing });
    setVars(dash.current, { "--diary": u.diary, "--toast": u.toast, "--auto": u.auto });
    if (parts.phoneUi) parts.phoneUi.style.opacity = (rig.phone.o * (parts.phone?.visible ? 1 : 0)).toFixed(3);

    // callouts (landscape only): project each edge anchor into the DOM
    for (const co of CALLOUTS) {
      let el = els.current.get(co.id);
      if (el === undefined) { el = document.getElementById(co.id); els.current.set(co.id, el); }
      if (!el) continue;
      if (!tall && calloutOn(co) && co.anchor(tmp)) {
        tmp.project(c);
        const x = (tmp.x * 0.5 + 0.5) * size.width, y = (-tmp.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.classList.add("is-on");
      } else el.classList.remove("is-on");
    }

    if (debug) expose(c);
  });

  // window.__story: the zones and each device's projected rectangle (CSS px), for tests/layout.spec.ts
  const expose = (c: PCam) => {
    const rect = (o: Object3D | null) => {
      if (!o || !o.visible || o.scale.x < 0.01) return null;
      box.setFromObject(o);
      if (box.isEmpty()) return null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        tmp.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(c);
        const x = (tmp.x * 0.5 + 0.5) * size.width, y = (-tmp.y * 0.5 + 0.5) * size.height;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    };
    (window as unknown as { __story?: unknown }).__story = {
      zones, progress: rig.progress, layout: zones?.layout,
      // the hero mark's footprint on screen (CSS px), while it's there
      logo: plan && rig.logo.exit < 0.98 ? (() => { const b = plan.heroLogo.box, h = plan.heroLogo.hPx, w = h * 0.8; return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h }; })() : null,
      devices: {
        phone: rig.phone.o > 0.05 ? rect(parts.phone) : null,
        browser: rig.browser.o > 0.05 ? rect(parts.browser) : null,
        laptop: rig.laptop.o > 0.05 ? rect(parts.laptop) : null,
        ticket: rig.ticket.o > 0.05 && rig.fly.p < 0.5 ? rect(parts.ticket) : null,
      },
    };
  };

  const media = host.media;
  if (!plan) return null;
  return (
    <>
      {/* always the default camera: switching it would make the effect composer rebuild on every visit */}
      <PerspectiveCamera ref={cam} makeDefault position={[0, 0, CAMERA.z]} fov={CAMERA.fov} near={0.1} far={100} />
      <group ref={world} visible={visible}>
        <Lights spot={30} />
        {!tall && dust && (
          <group position={[dust.c.x, dust.c.y, dust.c.z]}>
            <Dust count={(lite ? 300 : 700) / (reduced ? 2 : 1)} box={[dust.w, dust.h, 3]} size={0.01} opacity={0.3} color="#F1D7A8" />
          </group>
        )}
        <Phone register={(g) => { parts.phone = g; }} zoom={plan.zoom.phone}>
          <div ref={(el) => { parts.phoneUi = el?.firstElementChild as HTMLElement | null; }}><PhoneScreens media={media} active={visible} /></div>
        </Phone>
        <Browser media={media} lite={lite} zoom={plan.zoom.browser} />
        <BookingTicket tall={tall} zoom={plan.zoom.ticket} />
        <Laptop tall={tall} ui={dash} zoom={plan.zoom.laptop}>
          <div ref={(el) => { dash.current = el?.firstElementChild as HTMLElement | null; parts.dashUi = dash.current; }}><DashboardScreen /></div>
        </Laptop>
        {/* the hero: the 3D BratHaus mark, which turns edge-on and lifts away as the story begins */}
        <group position={[plan.heroLogo.x, plan.heroLogo.y, plan.heroLogo.z]}>
          <LogoMark3D fit={plan.heroLogo.fit} exit={logoExit} delay={0.5} />
        </group>
        <Thread tall={tall} nodes={nodes} logo={plan.logo} />
        <Nodes nodes={nodes} />
      </group>
      {/* portrait: a light bloom only */}
      <Effects lite={lite || tall || reduced} enabled={visible} />
    </>
  );
}
