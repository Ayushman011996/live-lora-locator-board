
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Radio, Wifi, WifiOff, Clock } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';
import { LoRaDataDisplay } from '@/components/LoRaDataDisplay';
import { useWebSocket } from '@/hooks/useWebSocket';

interface GPSData {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface LoRaPacket {
  id: string;
  data: string;
  rssi?: number;
  snr?: number;
  timestamp: Date;
}

const Index = () => {
  const [gpsData, setGpsData] = useState<GPSData | null>(null);
  const [loraPackets, setLoraPackets] = useState<LoRaPacket[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:8080', // Replace with your ESP32 IP
    onMessage: (data) => {
      const timestamp = new Date();
      setLastUpdate(timestamp);

      if (data.type === 'gps' && data.latitude && data.longitude) {
        setGpsData({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp
        });
      } else if (data.type === 'lora' && data.packet) {
        const newPacket: LoRaPacket = {
          id: Math.random().toString(36).substr(2, 9),
          data: data.packet,
          rssi: data.rssi,
          snr: data.snr,
          timestamp
        };
        setLoraPackets(prev => [newPacket, ...prev.slice(0, 49)]); // Keep last 50 packets
      }
    },
    reconnectInterval: 3000
  });

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ESP32 Dashboard</h1>
            <p className="text-gray-600">Real-time GPS & LoRa Data Monitor</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Last Update: {formatTimestamp(lastUpdate)}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="xl:col-span-2">
            <Card className="h-[500px] shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  GPS Location
                </CardTitle>
                {gpsData && (
                  <div className="text-sm text-gray-600">
                    Lat: {gpsData.latitude.toFixed(6)}, Lng: {gpsData.longitude.toFixed(6)}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 h-[400px]">
                <MapComponent 
                  latitude={gpsData?.latitude} 
                  longitude={gpsData?.longitude}
                  isConnected={isConnected}
                />
              </CardContent>
            </Card>
          </div>

          {/* LoRa Data Section */}
          <div className="xl:col-span-1">
            <Card className="h-[500px] shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-green-600" />
                  LoRa Packets
                  <Badge variant="secondary" className="ml-auto">
                    {loraPackets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 h-[400px]">
                <LoRaDataDisplay packets={loraPackets} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">GPS Status</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {gpsData ? 'Active' : 'Waiting...'}
                  </p>
                </div>
                <MapPin className={`h-8 w-8 ${gpsData ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">LoRa Packets</p>
                  <p className="text-2xl font-bold text-green-600">{loraPackets.length}</p>
                </div>
                <Radio className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connection</p>
                  <p className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
                {isConnected ? 
                  <Wifi className="h-8 w-8 text-green-600" /> : 
                  <WifiOff className="h-8 w-8 text-red-600" />
                }
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Signal</p>
                  <p className="text-sm font-bold text-gray-900">
                    {loraPackets.length > 0 ? loraPackets[0].rssi + ' dBm' : 'N/A'}
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-full ${
                  loraPackets.length > 0 && loraPackets[0].rssi && loraPackets[0].rssi > -80 
                    ? 'bg-green-500' 
                    : loraPackets.length > 0 && loraPackets[0].rssi && loraPackets[0].rssi > -100
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
