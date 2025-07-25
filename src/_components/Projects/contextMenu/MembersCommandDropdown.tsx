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
import { Check } from "lucide-react";
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

export default function MembersCommandDropdown({
  currentMembers,
  onMembersChange,
  teamId,
}: {
  currentMembers: { id: string; name: string; imageUrl?: string }[];
  onMembersChange: (
    members: { id: string; name: string; imageUrl?: string }[]
  ) => void;
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

  const handleMemberSelect = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const isSelected = currentMembers.some((m) => m.id === member.id);

    if (isSelected) {
      onMembersChange(currentMembers.filter((m) => m.id !== member.id));
    } else {
      onMembersChange([
        ...currentMembers,
        { id: member.id, name: member.name, imageUrl: member.imageUrl },
      ]);
    }
  };

  const isSelected = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? currentMembers.some((m) => m.id === member.id) : false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {currentMembers.length > 0 ? (
          <div className="flex items-center gap-2 w-full justify-center">
            <div className="flex -space-x-1">
              {currentMembers.slice(0, 3).map((member, index) => (
                <Avatar
                  key={index}
                  className="size-6 transition-all-linear cursor-pointer p-0.5 group"
                >
                  <AvatarImage src={member.imageUrl} className="rounded-full" />
                  <AvatarFallback className="text-xs rounded-sm p-0.5 group-hover:bg-[#ebebeb] dark:group-hover:bg-[#2b2b2b]">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {currentMembers.length > 3 && (
                <div className="size-6 rounded-sm border-2 border-background bg-muted flex items-center justify-center text-xs font-medium transition-all-linear cursor-pointer hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b]">
                  +{currentMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full">
            <div className="size-6 rounded-sm hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b] flex items-center justify-center transition-all-linear">
              <svg
                
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="lch(62.6% 1.35 272 / 1)"
                role="img"
                focusable="false"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                style={{ "--icon-color": "lch(62.6% 1.35 272 / 1)" } as React.CSSProperties}
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.91406 9.04883C10.3644 8.95062 10.8332 8.96679 11.2773 9.09766L12.6084 9.49023L12.7666 9.54199C13.5444 9.82319 14.1582 10.4414 14.4307 11.2285L14.8994 12.585L14.9434 12.7305C14.9808 12.8772 15 13.0288 15 13.1807C14.9997 14.1856 14.1847 15 13.1797 15H7.77148C6.7935 15 6.00022 14.2074 6 13.2295C6 12.9946 6.03944 12.761 6.11621 12.5391L6.56934 11.2285L6.62891 11.0732C6.94603 10.3093 7.59255 9.72571 8.3916 9.49023L9.72266 9.09766L9.91406 9.04883ZM10.3223 10.498L10.1465 10.5361L8.81543 10.9287C8.42809 11.0429 8.11944 11.3372 7.9873 11.7188L7.5332 13.0293C7.51101 13.0935 7.5 13.1615 7.5 13.2295C7.50022 13.379 7.62193 13.5 7.77148 13.5H13.1797C13.3562 13.5 13.4997 13.3572 13.5 13.1807C13.5 13.1628 13.4981 13.1445 13.4951 13.127L13.4824 13.0752L13.0127 11.7188C12.8971 11.3848 12.6465 11.1175 12.3262 10.9795L12.1846 10.9287L10.8535 10.5361C10.6806 10.4852 10.4993 10.4726 10.3223 10.498Z"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.12988 6.16406C4.68177 5.96734 5.28256 5.9518 5.84375 6.12012L7.21582 6.53223C7.61223 6.65141 7.83761 7.06928 7.71875 7.46582C7.59959 7.86231 7.18077 8.08767 6.78418 7.96875L5.41309 7.55762C5.15797 7.48108 4.88467 7.48772 4.63379 7.57715L3.77148 7.88477C3.41432 8.01218 3.13381 8.29496 3.00977 8.65332L2.5332 10.0293C2.51103 10.0935 2.5 10.1616 2.5 10.2295C2.50029 10.3789 2.62197 10.5 2.77148 10.5H4L4.07715 10.5039C4.45499 10.5425 4.7498 10.862 4.75 11.25C4.7498 11.638 4.45497 11.9575 4.07715 11.9961L4 12H2.77148C1.79354 12 1.00029 11.2074 1 10.2295C1 9.99464 1.03946 9.76101 1.11621 9.53906L1.59277 8.16211L1.64746 8.0166C1.94289 7.29751 2.5308 6.73446 3.26758 6.47168L4.12988 6.16406Z"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.5 4C11.6046 4 12.5 4.89543 12.5 6C12.5 7.10457 11.6046 8 10.5 8C9.39543 8 8.5 7.10457 8.5 6C8.5 4.89543 9.39543 4 10.5 4Z"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.25 1C6.35457 1 7.25 1.89543 7.25 3C7.25 4.10457 6.35457 5 5.25 5C4.14543 5 3.25 4.10457 3.25 3C3.25 1.89543 4.14543 1 5.25 1Z"
                ></path>
              </svg>
            </div>
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search members..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-8 text-xs"
          />
          <CommandList className="max-h-48">
            <CommandEmpty className="text-xs py-2.5 text-center">
              No members found.
            </CommandEmpty>
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
                  const selected = isSelected(member.id);
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={() => handleMemberSelect(member.id)}
                      className="text-xs"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-4 w-4 rounded-full">
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
                        {selected && <Check className="w-3 h-3 text-primary" />}
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
