import {
  HighPriority,
  LowPriority,
  MediumPriority,
  Priority,
  UrgentPriority,
} from "@/_components/shared/svg/Priority";

export const MemberAvatars = ({ members }: { members: any[] }) => (
  <div className="flex -space-x-2">
    {members?.map((member, i) => (
      <div
        key={i}
        className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold"
      >
        {member.user.imageUrl ? (
          <img
            src={member.user.imageUrl}
            alt={member.user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          member.user.name?.[0] || "?"
        )}
      </div>
    ))}
  </div>
);

// Helper for lead avatar
export const LeadAvatar = ({ lead }: { lead: any }) => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
      {lead?.imageUrl ? (
        <img
          src={lead.imageUrl}
          alt={lead.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        lead?.name?.[0] || "?"
      )}
    </div>
    <span className="text-xs">{lead?.name || "Unassigned"}</span>
  </div>
);

export const getPriorityIcon = (priority?: string, theme?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return <UrgentPriority className="size-4 " />;
    case "high":
      return <HighPriority className="size-4" isDark={theme === "dark"} />;
    case "medium":
      return <MediumPriority className="size-4" isDark={theme === "dark"} />;
    case "low":
      return <LowPriority className="size-4" isDark={theme === "dark"} />;
    default:
      return <Priority className="size-4" />;
  }
};
