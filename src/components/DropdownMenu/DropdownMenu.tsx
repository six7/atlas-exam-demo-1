"use client";

import { ReactNode } from "react";
import {
  DropdownMenu as ShadDropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/src/components/ui/dropdown-menu";

export interface DropdownItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface DropdownGroup {
  label?: string;
  items: DropdownItem[];
}

interface DropdownMenuProps {
  trigger: ReactNode;
  groups: DropdownGroup[];
  align?: "start" | "center" | "end";
}

export function DropdownMenu({ trigger, groups, align = "end" }: DropdownMenuProps) {
  return (
    <ShadDropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {groups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <DropdownMenuSeparator />}
            {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
            {group.items.map((item, ii) => (
              <DropdownMenuItem
                key={ii}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.label}
                {item.shortcut && (
                  <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </ShadDropdownMenu>
  );
}

// Re-export primitives for advanced usage
export {
  ShadDropdownMenu as DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
};
