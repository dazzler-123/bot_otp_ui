'use client';

import { useEffect, useState } from 'react';
import { apiService } from '../lib/api';
import { getSocket } from '../lib/socket';
import { Device } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await apiService.get<Device[]>('/devices');
        if (response.data) {
          setDevices(response.data);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    // Set up Socket.io listener for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on('deviceUpdated', () => {
        fetchDevices();
      });
    }

    return () => {
      if (socket) {
        socket.off('deviceUpdated');
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Registered Devices</h2>
        <p className="text-gray-500">Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Registered Devices</h2>
      {devices.length === 0 ? (
        <p className="text-gray-500">No devices registered yet</p>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.model}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ID: {device.deviceId.substring(0, 8)}...
                  </p>
                </div>
                <div className="text-right">
                  {device.lastActive && (
                    <p className="text-xs text-gray-500">
                      Active{' '}
                      {formatDistanceToNow(
                        new Date(device.lastActive),
                        { addSuffix: true }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

