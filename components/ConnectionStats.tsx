'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function ConnectionStats() {
  const { peerConnection, connectionStats, setConnectionStats } = useStore();
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!peerConnection || !showStats) return;

    const interval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        let bitrate = 0;
        let packetsLost = 0;
        let jitter = 0;
        let rtt = 0;

        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
            if (report.bytesReceived || report.bytesSent) {
              bitrate += (report.bytesReceived || report.bytesSent || 0) * 8 / 1000; // kbps
            }
            if (report.packetsLost) {
              packetsLost += report.packetsLost;
            }
            if (report.jitter) {
              jitter += report.jitter;
            }
          }
          if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
            rtt = report.currentRoundTripTime * 1000; // ms
          }
        });

        setConnectionStats({
          bitrate: Math.round(bitrate),
          packetsLost,
          jitter: Math.round(jitter * 1000), // ms
          rtt: Math.round(rtt),
        });
      } catch (error) {
        console.error('Error getting connection stats:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [peerConnection, showStats, setConnectionStats]);

  const getQualityColor = (value: number, thresholds: { good: number; medium: number }) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.medium) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-4 right-4 z-30">
      <button
        onClick={() => setShowStats(!showStats)}
        className="glass-dark rounded-lg px-3 py-2 text-white text-sm hover:bg-white/20 transition-colors mb-2"
      >
        {showStats ? '📊 Hide Stats' : '📊 Show Stats'}
      </button>

      {showStats && connectionStats && (
        <div className="glass-dark rounded-lg p-4 space-y-2 min-w-[200px]">
          <h3 className="text-white text-sm font-semibold mb-2">Connection Quality</h3>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Bitrate:</span>
              <span className={getQualityColor(connectionStats.bitrate || 0, { good: 500, medium: 200 })}>
                {connectionStats.bitrate || 0} kbps
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">RTT:</span>
              <span className={getQualityColor(connectionStats.rtt || 0, { good: 100, medium: 200 })}>
                {connectionStats.rtt || 0} ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Jitter:</span>
              <span className={getQualityColor(connectionStats.jitter || 0, { good: 30, medium: 50 })}>
                {connectionStats.jitter || 0} ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Packets Lost:</span>
              <span className={connectionStats.packetsLost === 0 ? 'text-green-400' : 'text-red-400'}>
                {connectionStats.packetsLost || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

