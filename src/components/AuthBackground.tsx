"use client";

import dynamic from "next/dynamic";

const LaserFlow = dynamic(() => import("@/components/LaserFlow"), {
  ssr: false,
});

export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      <div
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <LaserFlow
          color="#6366f1"
          horizontalBeamOffset={0.1}
          verticalBeamOffset={0.0}
          fogIntensity={0.45}
          wispDensity={1}
          wispIntensity={5.0}
          flowSpeed={0.35}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
