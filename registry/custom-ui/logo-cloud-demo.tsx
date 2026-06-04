import type * as React from "react";

import {
  LogoCloud,
  type LogoCloudItem,
} from "@/components/custom-ui/logo-cloud";

const logos: LogoCloudItem[] = [
  { name: "Northstar", logo: <Wordmark>NORTHSTAR</Wordmark> },
  { name: "Mercury", logo: <Wordmark>MERCURY</Wordmark> },
  { name: "Monarch", logo: <Wordmark>Monarch</Wordmark> },
  { name: "Juniper", logo: <Wordmark>JUNIPER</Wordmark> },
  { name: "Sable", logo: <Wordmark>Sable</Wordmark> },
  { name: "Orchid", logo: <Wordmark>ORCHID</Wordmark> },
  { name: "Atlas", logo: <Wordmark>Atlas</Wordmark> },
  { name: "Kepler", logo: <Wordmark>KEPLER</Wordmark> },
  { name: "Aster", logo: <Wordmark>Aster</Wordmark> },
  { name: "Lumina", logo: <Wordmark>LUMINA</Wordmark> },
  { name: "Cobalt", logo: <Wordmark>Cobalt</Wordmark> },
  { name: "Nova", logo: <Wordmark>NOVA</Wordmark> },
];

export default function LogoCloudDemo() {
  return <LogoCloud logos={logos} />;
}

function Wordmark({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground text-sm font-semibold tracking-tight">
      {children}
    </span>
  );
}
