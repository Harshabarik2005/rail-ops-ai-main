import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Train, MapPin } from "lucide-react";

export const TrainTimeline = () => {
  const timeSlots = [
    { time: "14:00", trains: [] },
    { time: "14:15", trains: [
      { number: "12002", name: "Shatabdi", station: "New Delhi", status: "on-time" }
    ]},
    { time: "14:30", trains: [
      { number: "22470", name: "Rajdhani", station: "Gwalior", status: "delayed" },
      { number: "16032", name: "Andaman", station: "Mathura", status: "on-time" }
    ]},
    { time: "14:45", trains: [] },
    { time: "15:00", trains: [
      { number: "54783", name: "Freight", station: "Etawah", status: "holding" }
    ]},
    { time: "15:15", trains: [
      { number: "12280", name: "Taj Express", station: "Agra", status: "on-time" }
    ]},
    { time: "15:30", trains: [] },
    { time: "15:45", trains: [
      { number: "12004", name: "Lucknow Sht", station: "Kanpur", status: "on-time" }
    ]},
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time": return "bg-operational";
      case "delayed": return "bg-warning";
      case "holding": return "bg-muted-foreground";
      case "critical": return "bg-critical";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <Card className="shadow-control">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Train Movement Timeline
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Live View</Button>
            <Button variant="outline" size="sm">Simulate</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            {timeSlots.map((slot, index) => (
              <div key={index} className="relative flex items-start">
                {/* Time marker */}
                <div className="flex items-center justify-center w-16 h-8 bg-muted rounded-md border border-border text-sm font-medium text-foreground">
                  {slot.time}
                </div>
                
                {/* Timeline dot */}
                <div className={`absolute left-8 top-3 w-2 h-2 rounded-full border-2 border-background z-10 ${
                  slot.trains.length > 0 ? "bg-primary" : "bg-muted-foreground"
                }`}></div>
                
                {/* Trains at this time */}
                <div className="ml-8 flex-1">
                  {slot.trains.length > 0 ? (
                    <div className="space-y-2">
                      {slot.trains.map((train, trainIndex) => (
                        <div key={trainIndex} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg border border-border">
                          <div className="flex items-center space-x-3">
                            <Train className="w-4 h-4 text-primary" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">{train.number}</span>
                                <span className="text-sm text-muted-foreground">{train.name}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 mr-1" />
                                {train.station}
                              </div>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(train.status)}`}></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic ml-4">No scheduled movements</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-operational rounded-full"></div>
                <span className="text-muted-foreground">On Time</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">Delayed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <span className="text-muted-foreground">Holding</span>
              </div>
            </div>
            <span className="text-muted-foreground">Updated: 30s ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};