"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

/**
 * Renders a lucide-react icon by its string name.
 * Falls back to a generic circle if the name isn't found.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // lucide exports icons as PascalCase names
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!IconComponent) {
    // Fallback: render a plain circle
    const Circle = LucideIcons.Circle;
    return <Circle {...props} />;
  }
  return <IconComponent {...props} />;
}
