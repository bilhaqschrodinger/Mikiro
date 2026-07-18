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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="absolute inset-0 overflow-hidden">
        <LaserFlow
          color="#6366f1"
          horizontalBeamOffset={0.5}
          verticalBeamOffset={-0.2}
          fogIntensity={0.3}
          wispDensity={0.8}
          wispIntensity={3.0}
          flowSpeed={0.3}
        />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
