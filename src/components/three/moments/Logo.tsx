"use client";
import LogoMark3D from "@/components/brand/LogoMark3D";
import ViewFrame from "../kit/ViewFrame";

// The 3D logo in its own View (Studio hero, 404): the reference camera (z 7.2, fov 30), its own lights.
export default function Logo({ fit = 1 }: { fit?: number }) {
  return <ViewFrame camera={[0, 0, 7.2]} fov={30} lights={false}><LogoMark3D fit={fit} /></ViewFrame>;
}
