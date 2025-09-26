import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, Clock, MapPin, AlertTriangle, CheckCircle, Pause } from "lucide-react";

interface TrainStatusCardProps {
  trainNumber: string;
  trainName: string;
  currentStation: string;
  nextStation: string;
  status: "on-time" | "delayed" | "holding" | "critical";
  delay: number;
  priority: "high" | "medium" | "low";
}

export const TrainStatusCard = ({
  trainNumber,
  trainName,
  currentStation,
  nextStation,
  status,
  delay,
  priority
}: TrainStatusCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "on-time":
        return {
          icon: CheckCircle,
          color: "bg-operational text-operational-foreground",
          iconColor: "text-operational"
        };
      case "delayed":
        return {
          icon: Clock,
          color: "bg-warning text-warning-foreground",
          iconColor: "text-warning"
        };
      case "holding":
        return {
          icon: Pause,
          color: "bg-muted text-muted-foreground",
          iconColor: "text-muted-foreground"
        };
      case "critical":
        return {
          icon: AlertTriangle,
          color: "bg-critical text-critical-foreground",
          iconColor: "text-critical"
        };
      default:
        return {
          icon: CheckCircle,
          color: "bg-operational text-operational-foreground",
          iconColor: "text-operational"
        };
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high": return "border-l-critical";
      case "medium": return "border-l-warning";
      case "low": return "border-l-muted-foreground";
      default: return "border-l-muted-foreground";
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`shadow-control transition-control hover:shadow-elevated border-l-4 ${getPriorityColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Train className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">{trainNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{trainName}</p>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status === "on-time" ? "On Time" : 
             status === "delayed" ? `+${delay}m` : 
             status === "holding" ? "Holding" : "Critical"}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-foreground">At: {currentStation}</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Next: {nextStation}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Priority: {priority.toUpperCase()}
          </Badge>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              Track
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              Control
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};