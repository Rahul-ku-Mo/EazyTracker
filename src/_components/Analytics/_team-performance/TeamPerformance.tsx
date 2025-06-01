import { Avatar } from "@/components/ui/avatar";
import {
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

export const TeamPerformance = ({
  teamMembers,
  velocityData,
  completionRateData,
  timeRange = "week"
}: {
  teamMembers: any;
  velocityData: any;
  completionRateData: any;
  timeRange?: string;
}) => {
  // Determine the correct data key based on time range
  const getDataKey = () => {
    switch (timeRange) {
      case 'day': return 'hour';
      case 'week': return 'week';
      case 'month': return 'month';
      case 'quarter': return 'quarter';
      default: return 'week';
    }
  };

  const dataKey = getDataKey();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Team Member Performance</CardTitle>
          <CardDescription className="text-xs">
            Individual metrics and efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member: any, index: any) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={member.imageUrl || `/placeholder.svg?height=30&width=30`}
                      alt={member.name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {member.avatar || member.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium">{member.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {member.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs">{member.tasksCompleted} tasks</div>
                    <div className="text-[10px] text-muted-foreground">
                      completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">{member.avgTime} hrs</div>
                    <div className="text-[10px] text-muted-foreground">
                      avg. time
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">{member.efficiency}%</span>
                      {member.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <Progress value={member.efficiency} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sprint Velocity</CardTitle>
            <CardDescription className="text-xs">
              Planned vs completed points ({timeRange})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={dataKey} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="planned" fill="#8884d8" name="Planned" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Task Completion Status</CardTitle>
            <CardDescription className="text-xs">
              Distribution by timeliness
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="h-[140px] w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionRateData.map((entry: any, index: any) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{ fontSize: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {completionRateData.map((entry: any, index: any) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  ></div>
                  <div className="text-xs">
                    {entry.name}:{" "}
                    <span className="font-medium">{entry.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
