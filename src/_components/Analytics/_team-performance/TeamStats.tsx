import { CardHeader, Card, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Zap, CheckCircle2, Clock, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TeamStatsProps {
  data?: {
    velocity: number;
    velocityTrend: number;
    completionRate: number;
    completionRateTrend: number;
    avgCompletionTime: number;
    avgCompletionTimeTrend: number;
    teamEfficiency: number;
    teamEfficiencyTrend: number;
  };
}

export const TeamStats = ({ data }: TeamStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Team Velocity
          </CardTitle>
          <CardDescription className="text-xs">
            Cards completed vs planned
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">
            {data?.velocity || 88}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              points
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className={`${(data?.velocityTrend || 0) >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
              {(data?.velocityTrend || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(data?.velocityTrend || 12)}% from last sprint
            </span>
          </div>
          <Progress value={data?.velocity || 88} className="h-1.5" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Completion Rate
          </CardTitle>
          <CardDescription className="text-xs">
            Tasks completed on time
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">
            {data?.completionRate || 92}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              %
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className={`${(data?.completionRateTrend || 0) >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
              {(data?.completionRateTrend || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(data?.completionRateTrend || 5)}% from last sprint
            </span>
          </div>
          <Progress value={data?.completionRate || 92} className="h-1.5" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Avg. Completion Time
          </CardTitle>
          <CardDescription className="text-xs">
            Hours per card
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">
            {data?.avgCompletionTime || 2.1}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              hours
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className={`${(data?.avgCompletionTimeTrend || 0) >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
              {(data?.avgCompletionTimeTrend || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(data?.avgCompletionTimeTrend || 8)}% from target
            </span>
          </div>
          <Progress value={data?.avgCompletionTime ? (data.avgCompletionTime / 3 * 100) : 78} className="h-1.5" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-500" />
            Team Efficiency
          </CardTitle>
          <CardDescription className="text-xs">
            Overall performance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">
            {data?.teamEfficiency || 85}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              %
            </span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className={`${(data?.teamEfficiencyTrend || 0) >= 0 ? 'text-green-500' : 'text-red-500'} inline-flex items-center`}>
              {(data?.teamEfficiencyTrend || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(data?.teamEfficiencyTrend || 3)}% from last sprint
            </span>
          </div>
          <Progress value={data?.teamEfficiency || 85} className="h-1.5" />
        </CardContent>
      </Card>
    </div>
  );
};
