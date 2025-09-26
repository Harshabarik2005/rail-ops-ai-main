import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { useOptimizationUpdates } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: "optimization",
      priority: "high",
      title: "Reroute Freight 54783",
      description: "Divert via alternate route to reduce passenger train delays",
      impact: "Save 8min avg delay",
      confidence: 95,
      action: "Apply"
    },
    {
      id: 2,
      type: "scheduling",
      priority: "medium",
      title: "Platform Reallocation",
      description: "Move Train 22470 to Platform 3 for faster turnaround",
      impact: "Reduce conflict risk",
      confidence: 87,
      action: "Schedule"
    },
    {
      id: 3,
      type: "maintenance",
      priority: "low",
      title: "Preventive Maintenance",
      description: "Schedule track maintenance during 2:00-4:00 AM window",
      impact: "Optimize downtime",
      confidence: 78,
      action: "Plan"
    }
  ]);

  // Load recommendations from API
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await apiClient.getRecommendations();
        if (response.success) {
          setRecommendations(response.data);
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      }
    };

    loadRecommendations();
  }, []);

  // Use WebSocket for real-time optimization updates
  useOptimizationUpdates((optimizationData) => {
    // Refresh recommendations when optimization completes
    if (optimizationData?.status === 'completed') {
      // Reload recommendations
    }
  });

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "bg-critical text-critical-foreground", icon: AlertTriangle };
      case "medium":
        return { color: "bg-warning text-warning-foreground", icon: Clock };
      case "low":
        return { color: "bg-muted text-muted-foreground", icon: CheckCircle };
      default:
        return { color: "bg-muted text-muted-foreground", icon: CheckCircle };
    }
  };

  return (
    <Card className="shadow-operational">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Brain className="w-5 h-5 mr-2 text-primary" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => {
          const priorityConfig = getPriorityConfig(rec.priority);
          const PriorityIcon = priorityConfig.icon;
          
          return (
            <div key={rec.id} className="p-4 rounded-lg border border-border bg-gradient-card hover:shadow-control transition-control">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <PriorityIcon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">{rec.title}</h4>
                </div>
                <Badge className={`${priorityConfig.color} text-xs`}>
                  {rec.priority.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {rec.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    {rec.impact}
                  </span>
                  <span>{rec.confidence}% confidence</span>
                </div>
                <Button 
                  size="sm" 
                  variant={rec.priority === "high" ? "default" : "outline"}
                  className={rec.priority === "high" ? "bg-gradient-primary text-primary-foreground" : ""}
                >
                  {rec.action}
                </Button>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              AI Analysis: <span className="text-operational font-medium">Active</span>
            </div>
            <Button variant="outline" size="sm">
              View All Insights
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};