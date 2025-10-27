import { BitProgressProps, Progress } from "@/components/ui/8bit/progress";

interface ManaBarProps extends React.ComponentProps<"div"> {
  className?: string;
  props?: BitProgressProps;
  variant?: "retro" | "default";
  value?: number;
  label?: string;
}

function HealthBar({
  className,
  variant,
  value,
  label,
  ...props
}: ManaBarProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="font-mono text-xs text-foreground min-w-[2.5rem]">
          {label}
        </span>
      )}
      <Progress
        {...props}
        value={value}
        variant={variant}
        className={className}
        progressBg="bg-primary"
      />
      {label && value !== undefined && (
        <span className="font-mono text-xs text-foreground min-w-[2rem] text-right">
          {value}
        </span>
      )}
    </div>
  );
}

export { HealthBar };
