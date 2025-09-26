import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionOverview } from "@/components/SectionOverview";
import { TrainStatusCard } from "@/components/TrainStatusCard";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { AIRecommendations } from "@/components/AIRecommendations";
import { TrainTimeline } from "@/components/TrainTimeline";
import TrackLayout from "@/components/TrackLayout";
import { Settings, Power, AlertTriangle, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Railway Traffic Control AI</h1>
                  <p className="text-sm text-muted-foreground">Section Controller Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-operational/10 text-operational border-operational/20">
                <div className="w-2 h-2 bg-operational rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section Overview */}
            <SectionOverview />
            
            {/* Train Timeline */}
            <TrainTimeline />
            
            {/* Track Layout */}
            <TrackLayout />
            
            {/* Active Trains */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Trains</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrainStatusCard 
                  trainNumber="12002"
                  trainName="Shatabdi Express"
                  currentStation="New Delhi"
                  nextStation="Kanpur Central"
                  status="on-time"
                  delay={0}
                  priority="high"
                />
                <TrainStatusCard 
                  trainNumber="22470"
                  trainName="Rajdhani Express"
                  currentStation="Gwalior"
                  nextStation="Jhansi"
                  status="delayed"
                  delay={15}
                  priority="high"
                />
                <TrainStatusCard 
                  trainNumber="16032"
                  trainName="Andaman Express"
                  currentStation="Mathura"
                  nextStation="Agra"
                  status="on-time"
                  delay={0}
                  priority="medium"
                />
                <TrainStatusCard 
                  trainNumber="54783"
                  trainName="Freight Service"
                  currentStation="Holding at Etawah"
                  nextStation="Kanpur Central"
                  status="holding"
                  delay={25}
                  priority="low"
                />
              </div>
            </div>
          </div>

          {/* Right Column - AI & Metrics */}
          <div className="space-y-6">
            <AIRecommendations />
            <PerformanceMetrics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;