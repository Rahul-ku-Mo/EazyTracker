
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export default function LeadCommandDropdown({
  currentLead,
  onLeadChange,
  teamId,
}: {
  currentLead: { id: string; name: string; imageUrl?: string } | null;
  onLeadChange: (leadId: string | null) => void;
  teamId: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/${teamId}/members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!teamId && !!Cookies.get("accessToken"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const teamMembers: TeamMember[] = teamData?.members || [];
  const currentLeadMember = currentLead
    ? teamMembers.find((member) => member.id === currentLead.id)
    : null;

  const handleLeadSelect = (memberId: string) => {
    if (currentLead?.id === memberId) {
      onLeadChange(null);
    } else {
      onLeadChange(memberId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {currentLeadMember ? (
          <div className="flex items-center gap-2 w-full justify-center">
            <Avatar className="size-6 transition-all-linear cursor-pointer hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b] rounded-sm p-0.5 group">
              <AvatarImage src={currentLeadMember.imageUrl} />
              <AvatarFallback className="text-xs rounded-sm p-0.5 group-hover:bg-[#ebebeb] dark:group-hover:bg-[#2b2b2b]">
                {currentLeadMember.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full">
            <div className="size-6 rounded-sm hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b] flex items-center justify-center">
              <Minus className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search users..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-8 text-xs"
          />
          <CommandList className="max-h-48">
            <CommandEmpty className="text-xs py-2.5 text-center">No members found.</CommandEmpty>
            <CommandGroup>
              {teamMembers
                .filter(
                  (member) =>
                    member.name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()) ||
                    member.email
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                )
                .map((member) => {
                  const isSelected = currentLead?.id === member.id;
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={() => handleLeadSelect(member.id)}
                      className="text-xs"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="text-xs">
                            {member.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {member.name}
                          </div>
                         
                        </div>
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
