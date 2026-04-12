import { ReactNode } from "react";
import {
  Card as ShadCard,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ header, footer, children, className }: CardProps) {
  return (
    <ShadCard className={cn(className)}>
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent className={cn(!header && "pt-6")}>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </ShadCard>
  );
}

export { CardHeader, CardContent, CardFooter };
