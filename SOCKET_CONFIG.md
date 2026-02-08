# Socket.io Configuration for Domain Deployment

## How Socket.io Works with Domains

When deploying the dashboard to a domain (e.g., `https://dashboard.example.com`), Socket.io needs to connect to your backend server. Here's how it works:

## Configuration

### Environment Variables

Create a `.env.local` file in the `bot_dashboard` directory:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=https://api.example.com/api

# Socket.io URL (optional - will be derived from API URL if not set)
NEXT_PUBLIC_SOCKET_URL=https://api.example.com
```

### How It Works

1. **Automatic URL Derivation**: If `NEXT_PUBLIC_SOCKET_URL` is not set, the socket client automatically derives the socket URL from `NEXT_PUBLIC_API_URL` by removing the `/api` suffix.

   Example:
   - API URL: `https://api.example.com/api`
   - Socket URL: `https://api.example.com` (automatically derived)

2. **Manual Configuration**: You can explicitly set `NEXT_PUBLIC_SOCKET_URL` if your socket server is on a different domain or port.

## Backend Configuration

Make sure your backend `.env` file includes your dashboard domain in `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://dashboard.example.com,https://www.dashboard.example.com
```

This allows Socket.io connections from your dashboard domain.

## Production Setup

### Example Configuration

**Dashboard `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

**Backend `.env`:**
```env
CORS_ORIGINS=https://dashboard.yourdomain.com
PORT=3001
NODE_ENV=production
```

## Connection Flow

1. User opens dashboard at `https://dashboard.example.com`
2. Dashboard reads `NEXT_PUBLIC_API_URL` from environment
3. Socket client connects to `https://api.example.com` (derived or explicit)
4. Backend validates CORS origin against `CORS_ORIGINS`
5. Socket connection established with JWT token authentication
6. Real-time updates flow through Socket.io

## Troubleshooting

### Socket Not Connecting

1. **Check CORS Configuration**: Ensure your dashboard domain is in `CORS_ORIGINS`
2. **Check Environment Variables**: Verify `NEXT_PUBLIC_API_URL` is set correctly
3. **Check Browser Console**: Look for Socket.io connection errors
4. **Check Network Tab**: Verify WebSocket connection is being attempted

### CORS Errors

If you see CORS errors:
- Add your dashboard domain to backend `CORS_ORIGINS`
- Ensure both HTTP and HTTPS versions are included if needed
- Restart backend server after changing CORS_ORIGINS

### HTTPS/HTTP Mismatch

- If backend is HTTPS, dashboard must also be HTTPS (or use same protocol)
- Mixed content (HTTP dashboard → HTTPS socket) may be blocked by browsers

## Testing

After deployment, check browser console for:
```
Socket.io connected to: https://api.example.com
```

If you see connection errors, check:
1. Backend is running and accessible
2. CORS_ORIGINS includes your dashboard domain
3. Environment variables are set correctly
4. Firewall/security groups allow WebSocket connections

