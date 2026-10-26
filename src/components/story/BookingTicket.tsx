"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MeshStandardMaterial, Object3D, Quaternion, Vector3, type Group } from "three";
import { rig } from "@/lib/rig";
import TicketCard from "./ui/TicketCard";
import { diarySlot, domBox } from "./anchors";
import { dampXf, LAPTOP, parts, PHONE, screenPoint, TABLET, TICKET } from "./parts";
import Screen from "./Screen";

// only its edge shows (the DOM card covers the face), so it is kept below the bloom threshold
const paper = new MeshStandardMaterial({ color: "#8f8a80", roughness: 0.9, metalness: 0, transparent: true });
export const ticketMaterials = [paper];
const TH = (TICKET.w * TICKET.cssH) / TICKET.cssW;

// The booking ticket (S6): the chat's final confirmation lifts out of the phone screen as this card,
// then flies along the thread into the diary's Saturday 10:30 slot.
export default function BookingTicket({ tall, zoom }: { tall: boolean; zoom: number }) {
  const g = useRef<Group>(null);
  const ui = useRef<HTMLDivElement>(null);
  // the ticket's own resting transform (damped towards the rig), before the lift and flight are blended in
  const base = useMemo(() => new Object3D(), []);
  const v = useMemo(() => ({ from: new Vector3(), slot: new Vector3(), q: new Quaternion(), qa: new Quaternion() }), []);
  useFrame((_, dt) => {
    const o = g.current; if (!o) return;
    dampXf(base, rig.ticket, dt);
    o.position.copy(base.position); o.quaternion.copy(base.quaternion); o.scale.copy(base.scale);
    // lift: from the last message bubble, at its size, flat on the phone's screen
    const l = rig.ticket.lift;
    const ph = parts.phone;
    if (l < 0.999 && ph && rig.ticket.o > 0.001) {
      const m = domBox(parts.phoneUi, "[data-msg='3']", PHONE.cssW, false) ?? { x: 160, y: 640, w: 280, h: 90 };
      screenPoint(m.x, m.y, PHONE, PHONE.screenZ + 0.01, v.from);
      ph.localToWorld(v.from);
      ph.getWorldQuaternion(v.qa);
      const s0 = (m.w * (PHONE.screenW / PHONE.cssW) * ph.scale.x) / TICKET.w;
      const e = l * l * (3 - 2 * l);
      o.position.lerpVectors(v.from, base.position, e);
      o.position.z += Math.sin(Math.PI * e) * 0.3;
      o.quaternion.slerpQuaternions(v.qa, base.quaternion, e);
      o.scale.setScalar(s0 + (base.scale.x - s0) * e);
    }
    // flight: arcing up, shrinking to the slot's width, turning to the screen
    const f = rig.fly.p;
    if (f > 0.001 && parts.screen) {
      const S = tall ? TABLET : LAPTOP;
      const slot = diarySlot(tall);
      screenPoint(slot.x, slot.y, S, 0.02, v.slot);
      parts.screen.localToWorld(v.slot);
      parts.screen.getWorldQuaternion(v.q);
      const e = f * f * (3 - 2 * f);
      o.position.lerp(v.slot, e);
      o.position.y += Math.sin(Math.PI * e) * 0.35;
      const slotW = (slot.w * (S.screenW / S.cssW) * (parts.laptop?.scale.x ?? 1)) / TICKET.w;
      o.scale.setScalar(o.scale.x + (slotW - o.scale.x) * e);
      o.quaternion.slerp(v.q, e);
    }
    const op = rig.ticket.o * (1 - Math.max(0, (f - 0.85) / 0.15));
    paper.opacity = op;
    o.visible = op > 0.01 && base.visible;
    if (ui.current) { ui.current.style.opacity = op.toFixed(3); ui.current.style.visibility = o.visible ? "visible" : "hidden"; }
  });
  return (
    <group ref={(el) => { g.current = el; parts.ticket = el; }} visible={false}>
      <RoundedBox args={[TICKET.w + 0.02, TH + 0.02, 0.02]} radius={0.045} smoothness={4} position={[0, 0, -0.012]} material={paper} />
      <Screen cssW={TICKET.cssW} cssH={TICKET.cssH} worldW={TICKET.w} radius={0.045} zoom={zoom}>
        <div ref={ui} style={{ visibility: "hidden" }}><TicketCard /></div>
      </Screen>
    </group>
  );
}
