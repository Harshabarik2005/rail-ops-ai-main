import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, MapPin, Clock, AlertCircle, TrendingUp } from "lucide-react";

export const SectionOverview = () => {
  return (
    <Card className="shadow-elevated bg-gradient-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">Section Status Overview</CardTitle>
          <Badge className="bg-operational text-operational-foreground">
            Delhi-Kanpur Section
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Train className="w-8 h-8 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">24</div>
            <div className="text-sm text-muted-foreground">Active Trains</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-operational/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-operational" />
            </div>
            <div className="text-2xl font-bold text-foreground">87%</div>
            <div className="text-sm text-muted-foreground">Track Utilization</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground">12.3</div>
            <div className="text-sm text-muted-foreground">Avg Delay (min)</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-critical/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-critical" />
            </div>
            <div className="text-2xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Conflicts</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-primary text-primary-foreground shadow-control">
                <TrendingUp className="w-4 h-4 mr-2" />
                Optimize Now
              </Button>
              <Button variant="outline">
                Emergency Protocol
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-operational rounded-full animate-pulse"></div>
              Last updated: 2 seconds ago
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};