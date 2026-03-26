import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const PROJECT_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "parking_lot", label: "Parking Lot" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "done", label: "Done" },
];

const StatusDropdown = ({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: string) => void;
}) => {
  const currentStatus = PROJECT_STATUSES.find(s => s.value === status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="hover:bg-accent/20 rounded-sm p-1 transition-all cursor-pointer">
          <Badge variant="outline" className="text-xs">
            {currentStatus?.label || status}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32" align="start">
        <DropdownMenuGroup>
          {PROJECT_STATUSES.map((statusOption) => (
            <DropdownMenuItem
              key={statusOption.value}
              className="text-sm font-semibold"
              onClick={() => onChange(statusOption.value)}
            >
              {statusOption.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown; 