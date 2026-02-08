export interface Device {
  deviceId: string;
  name: string;
  model: string;
  createdAt: any;
  lastActive: any;
}

export interface DeviceInfo {
  deviceId: string;
  name: string;
  model: string;
}

export interface OTP {
  otpId: string;
  deviceId: string;
  code: string;
  sender: string;
  message: string;
  receivedAt: number;
  expiresAt: number;
  device?: DeviceInfo;
}

export interface GroupedOTPs {
  [deviceId: string]: {
    device: DeviceInfo;
    otps: OTP[];
  };
}

