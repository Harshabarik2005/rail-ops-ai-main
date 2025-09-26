import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, Target, Zap } from "lucide-react";

export const PerformanceMetrics = () => {
  const metrics = [
    {
      label: "Punctuality Rate",
      value: 87,
      target: 90,
      trend: "up",
      change: "+2.3%"
    },
    {
      label: "Throughput Efficiency",
      value: 92,
      target: 95,
      trend: "up",
      change: "+5.1%"
    },
    {
      label: "Average Transit Time",
      value: 78,
      target: 85,
      trend: "down",
      change: "-3.2%"
    },
    {
      label: "Resource Utilization",
      value: 85,
      target: 80,
      trend: "up",
      change: "+1.8%"
    }
  ];

  return (
    <Card className="shadow-control">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Performance KPIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{metric.label}</span>
              <div className="flex items-center space-x-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-operational" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-critical" />
                )}
                <span className={`text-xs font-medium ${
                  metric.trend === "up" ? "text-operational" : "text-critical"
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Progress 
                value={metric.value} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{metric.value}%</span>
                <span>Target: {metric.target}%</span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI Optimization Score</span>
            </div>
            <div className="text-2xl font-bold text-primary">94.2</div>
            <div className="text-xs text-muted-foreground">Excellent Performance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};