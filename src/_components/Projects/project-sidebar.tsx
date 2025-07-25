import { Badge } from "@/components/ui/badge";
import { MemberAvatars, LeadAvatar } from "./utils";
import { useTheme } from "@/context/ThemeProvider";
import PriorityDropdown from "./contextMenu/PriorityDropdown";

interface ProjectSidebarProps {
  project?: any;
}

export const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  const { theme } = useTheme();
  return (
    <>
      {/* Properties */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Properties
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          {project.priority && (
            <div className="flex items-center justify-between">
              <span>Priority</span>
              <PriorityDropdown
                priority={project.priority}
                onChange={(priority) => {
                  console.log(priority);
                }}
                isDark={theme === "dark"}
              />
            </div>
          )}
          {project.lead && (
            <div className="flex items-center justify-between">
              <span>Lead</span>
              <LeadAvatar lead={project.lead} />
            </div>
          )}
          {project.members && project.members.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Members</span>
              <span className="flex items-center gap-1">
                <MemberAvatars members={project.members} />{" "}
                {project.members.length}
              </span>
            </div>
          )}
          {project.targetDate && (
            <div className="flex items-center justify-between">
              <span>Target Date</span>
              <span>{new Date(project.targetDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.workspaces && project.workspaces.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Workspaces</span>
              <span>
                {project.workspaces
                  .map(({ workspace }: any) => workspace.title)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {project.cards && project.cards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Progress
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span>Total</span>
            <Badge variant="outline">{project.cards.length}</Badge>
            <span>Completed</span>
            <Badge variant="outline">
              {
                project.cards.filter((c: any) => c.status === "Completed")
                  .length
              }
            </Badge>
          </div>
        </div>
      )}

      {/* Team Members */}
      {project.members && project.members.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Team Members
          </h3>
          <div className="flex flex-col gap-2">
            {project.members.map((member: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
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
                <span>{member.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSidebar;
