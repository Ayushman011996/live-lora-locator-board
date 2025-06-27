
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Signal, Clock } from 'lucide-react';

interface LoRaPacket {
  id: string;
  data: string;
  rssi?: number;
  snr?: number;
  timestamp: Date;
}

interface LoRaDataDisplayProps {
  packets: LoRaPacket[];
}

export const LoRaDataDisplay = ({ packets }: LoRaDataDisplayProps) => {
  const getSignalStrength = (rssi?: number): { color: string; label: string } => {
    if (!rssi) return { color: 'bg-gray-500', label: 'Unknown' };
    if (rssi > -50) return { color: 'bg-green-500', label: 'Excellent' };
    if (rssi > -70) return { color: 'bg-blue-500', label: 'Good' };
    if (rssi > -85) return { color: 'bg-yellow-500', label: 'Fair' };
    return { color: 'bg-red-500', label: 'Poor' };
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatData = (data: string) => {
    // Try to format as JSON if possible, otherwise return as-is
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  if (packets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Waiting for LoRa packets...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-3">
        {packets.map((packet, index) => {
          const signalInfo = getSignalStrength(packet.rssi);
          
          return (
            <Card key={packet.id} className={`transition-all duration-300 ${
              index === 0 ? 'ring-2 ring-green-500 ring-opacity-50' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${signalInfo.color}`} />
                    <span className="text-xs font-medium text-gray-900">
                      Packet #{packets.length - index}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTime(packet.timestamp)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-gray-50 rounded p-2">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
                      {formatData(packet.data)}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {packet.rssi && (
                        <Badge variant="outline" className="text-xs">
                          <Signal className="h-3 w-3 mr-1" />
                          {packet.rssi} dBm
                        </Badge>
                      )}
                      {packet.snr && (
                        <Badge variant="outline" className="text-xs">
                          SNR: {packet.snr} dB
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${signalInfo.color} text-white`}
                    >
                      {signalInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
