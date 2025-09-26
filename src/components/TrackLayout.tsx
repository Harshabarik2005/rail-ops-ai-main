import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';
import { useRealTimeTrains } from '@/hooks/useWebSocket';
import trackData from '@/data/track_map_raw.json';

interface TrackElement {
  type: string;
  start?: number[];
  end?: number[];
  layer: string;
}

interface Train {
  id: string;
  name: string;
  position: [number, number];
  direction: number;
  speed: number;
  color: string;
  status: 'moving' | 'stopped' | 'delayed';
}

const TrackLayout = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [trains, setTrains] = useState<Train[]>([]);

  // Use WebSocket for real-time train updates
  useRealTimeTrains((trainData) => {
    if (Array.isArray(trainData)) {
      setTrains(trainData.map(train => ({
        id: train.id,
        name: train.name || `Train ${train.id}`,
        position: train.position,
        direction: train.heading || 0,
        speed: train.speed,
        color: getTrainColor(train.status),
        status: train.status
      })));
    }
  });

  const getTrainColor = (status: string) => {
    switch (status) {
      case 'on-time': return '#10b981';
      case 'delayed': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'stopped': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  // Initialize with default trains if no real-time data
  useEffect(() => {
    if (trains.length === 0) {
      setTrains([
        {
          id: '12002',
          name: 'Shatabdi Express',
          position: [100, 220],
          direction: 0,
          speed: 2,
          color: '#10b981',
          status: 'moving'
        },
        {
          id: '22470',
          name: 'Rajdhani Express',
          position: [200, 194],
          direction: 0,
          speed: 1.5,
          color: '#f59e0b',
          status: 'delayed'
        },
        {
          id: '16032',
          name: 'Andaman Express',
          position: [150, 173],
          direction: 0,
          speed: 2.2,
          color: '#3b82f6',
          status: 'moving'
        }
      ]);
    }
  }, [trains.length]);

  // Calculate canvas bounds from track data
  const getBounds = () => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    trackData.forEach((element: TrackElement) => {
      if (element.type === 'LINE' && element.start && element.end) {
        minX = Math.min(minX, element.start[0], element.end[0]);
        maxX = Math.max(maxX, element.start[0], element.end[0]);
        minY = Math.min(minY, element.start[1], element.end[1]);
        maxY = Math.max(maxY, element.start[1], element.end[1]);
      }
    });
    
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  const drawTrack = (ctx: CanvasRenderingContext2D) => {
    const bounds = getBounds();
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set up transformation
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Center the track layout
    const centerX = (ctx.canvas.width / scale - bounds.width) / 2 - bounds.minX;
    const centerY = (ctx.canvas.height / scale - bounds.height) / 2 - bounds.minY;
    ctx.translate(centerX, centerY);
    
    // Draw track lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3 / scale;
    ctx.lineCap = 'round';
    
    trackData.forEach((element: TrackElement) => {
      if (element.type === 'LINE' && element.start && element.end) {
        ctx.beginPath();
        ctx.moveTo(element.start[0], element.start[1]);
        ctx.lineTo(element.end[0], element.end[1]);
        ctx.stroke();
      }
    });
    
    // Draw junction points
    ctx.fillStyle = '#6b7280';
    trackData.forEach((element: TrackElement) => {
      if (element.type === 'POINT') {
        // For points without coordinates, we'll skip them for now
        // In a real implementation, you'd extract coordinates from context
      }
    });
    
    // Draw trains
    trains.forEach(train => {
      ctx.fillStyle = train.color;
      ctx.beginPath();
      ctx.arc(train.position[0], train.position[1], 8 / scale, 0, 2 * Math.PI);
      ctx.fill();
      
      // Train label
      ctx.fillStyle = '#ffffff';
      ctx.font = `${12 / scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(train.id, train.position[0], train.position[1] - 15 / scale);
    });
    
    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      setTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          position: [
            train.position[0] + (train.status === 'moving' ? train.speed : 0),
            train.position[1]
          ] as [number, number]
        }))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    drawTrack(ctx);
  }, [scale, offset, trains]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const toggleSimulation = () => setIsSimulating(prev => !prev);

  return (
    <Card className="shadow-control">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Track Layout & Train Positions</CardTitle>
            <p className="text-sm text-muted-foreground">Live track visualization with active trains</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={isSimulating ? "bg-operational/10 text-operational border-operational/20" : "bg-muted/10"}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isSimulating ? 'bg-operational animate-pulse' : 'bg-muted-foreground'}`}></div>
              {isSimulating ? 'Live' : 'Static'}
            </Badge>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleSimulation}>
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border-t border-border bg-background"
            style={{ width: '100%', height: '384px' }}
          />
          
          {/* Train Legend */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Active Trains</h4>
            <div className="space-y-1">
              {trains.map(train => (
                <div key={train.id} className="flex items-center space-x-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: train.color }}
                  ></div>
                  <span className="text-foreground">{train.id}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {train.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackLayout;