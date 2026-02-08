'use client';

import { useEffect, useState } from 'react';
import { apiService } from '../lib/api';
import { getSocket } from '../lib/socket';
import { OTP, GroupedOTPs } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

interface FlatOTP extends OTP {
  deviceName: string;
  deviceModel: string;
}

export default function OTPFeed() {
  const [groupedOtps, setGroupedOtps] = useState<GroupedOTPs>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOtps = async () => {
      try {
        const response = await apiService.get<GroupedOTPs>('/otps?limit=50&groupByDevice=true');
        if (response.data) {
          setGroupedOtps(response.data);
        }
      } catch (error) {
        console.error('Error fetching OTPs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOtps();

    // Set up Socket.io listener for real-time updates
    const socket = getSocket();
    if (socket) {
      const handleNewOTP = (newOtp: OTP) => {
        setGroupedOtps((prev) => {
          const deviceId = newOtp.deviceId;
          const updated = { ...prev };
          
          if (!updated[deviceId]) {
            updated[deviceId] = {
              device: newOtp.device || {
                deviceId: deviceId,
                name: 'Unknown Device',
                model: 'Unknown',
              },
              otps: [],
            };
          }
          
          // Ensure receivedAt is a number (timestamp)
          const normalizedOtp = {
            ...newOtp,
            receivedAt: typeof newOtp.receivedAt === 'number' 
              ? newOtp.receivedAt 
              : new Date(newOtp.receivedAt).getTime(),
            expiresAt: typeof newOtp.expiresAt === 'number' 
              ? newOtp.expiresAt 
              : new Date(newOtp.expiresAt).getTime(),
          };
          
          // Add new OTP at the beginning and sort by receivedAt
          updated[deviceId].otps = [normalizedOtp, ...updated[deviceId].otps]
            .sort((a, b) => b.receivedAt - a.receivedAt)
            .slice(0, 50);
          
          return updated;
        });
      };

      socket.on('newOTP', handleNewOTP);

      return () => {
        socket.off('newOTP', handleNewOTP);
      };
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Flatten grouped OTPs into a single array with device info
  const flatOtps: FlatOTP[] = Object.entries(groupedOtps)
    .flatMap(([deviceId, { device, otps }]) =>
      otps.map((otp) => ({
        ...otp,
        deviceName: device.name,
        deviceModel: device.model,
      }))
    )
    .sort((a, b) => b.receivedAt - a.receivedAt);

  if (loading) {
    return (
      <div className="bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">OTP Feed</h2>
        </div>
        <div className="px-6 py-8">
          <p className="text-gray-500">Loading OTPs...</p>
        </div>
      </div>
    );
  }

  if (flatOtps.length === 0) {
    return (
      <div className="bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">OTP Feed</h2>
        </div>
        <div className="px-6 py-8">
          <p className="text-gray-500">No OTPs received yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">OTP Feed</h2>
          <span className="text-sm text-gray-500">
            {flatOtps.length} {flatOtps.length === 1 ? 'OTP' : 'OTPs'}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OTP Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flatOtps.map((otp) => {
              const receivedDate = typeof otp.receivedAt === 'number' 
                ? new Date(otp.receivedAt) 
                : new Date(otp.receivedAt);
              
              return (
                <tr key={otp.otpId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {otp.deviceName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {otp.deviceModel}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-indigo-600">
                      {otp.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{otp.sender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={otp.message}>
                      {otp.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(receivedDate, 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(receivedDate, { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => copyToClipboard(otp.code)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

