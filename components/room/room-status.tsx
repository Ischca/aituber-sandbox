import { Badge } from "@/components/ui/badge";
import type { RoomStatus } from "@/types/room";

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const variants: Record<RoomStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    idle: { label: "待機中", variant: "secondary" },
    active: { label: "配信中", variant: "default" },
    stopped: { label: "停止", variant: "destructive" },
  };

  const { label, variant } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
