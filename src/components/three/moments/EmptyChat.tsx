"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { PhoneBody } from "@/components/story/Phone";
import PhoneScreens from "@/components/story/ui/PhoneScreens";
import ViewFrame, { useActive } from "../kit/ViewFrame";

// The 404: the story's phone, showing an empty chat. It turns slowly, as if waiting.
function Scene() {
  const g = useRef<Group>(null);
  const active = useActive();
  useFrame((st) => {
    if (!g.current || !active.current) return;
    const t = st.clock.elapsedTime;
    g.current.rotation.y = -0.25 + Math.sin(t * 0.5) * 0.12;
    g.current.position.y = Math.sin(t * 0.8) * 0.04;
  });
  return (
    <group ref={g}>
      <PhoneBody portal={false}><PhoneScreens media={{ ad: false, adVideo: false, hero: false, cut: false, colour: false }} mode="empty" /></PhoneBody>
    </group>
  );
}

export default function EmptyChat() {
  return <ViewFrame camera={[0, 0, 3.6]} fov={30} spot={30}><Scene /></ViewFrame>;
}
