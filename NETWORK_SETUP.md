# Network Setup Instructions

This guide will help you set up the app to be accessible from other devices on your network.

## Quick Setup

1. Run the setup script to automatically configure your environment:
   ```bash
   node setup-env.js
   ```

2. Restart both backend and frontend servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm start
   ```

3. Other devices can now access your app using your computer's IP address:
   - Frontend: `http://<YOUR_IP>:3000`
   - Backend API: `http://<YOUR_IP>:5000`

## Manual Setup (If the script doesn't work)

### 1. Find Your Network IP Address

#### On Windows:
1. Open Command Prompt
2. Type `ipconfig`
3. Look for "IPv4 Address" under your network adapter (usually starts with 192.168.x.x)

#### On Mac/Linux:
1. Open Terminal
2. Type `ifconfig` or `ip addr`
3. Look for "inet" followed by your IP address (usually starts with 192.168.x.x)

### 2. Configure the Frontend

1. Create or edit `.env` file in the project root:
   ```
   REACT_APP_API_URL=http://<YOUR_IP>:5000/api
   ```
   Replace `<YOUR_IP>` with your actual IP address.

### 3. Configure the Backend

1. Edit `backend/.env` file:
   ```
   HOST=0.0.0.0
   PORT=5000
   ```

2. Make sure your firewall allows incoming connections to ports 3000 and 5000.

## Troubleshooting

### Users Can't Connect

1. **Check Firewall Settings**: Make sure Windows Firewall or other security software isn't blocking connections to your app.
   - Go to Control Panel > Windows Defender Firewall > Allow an app through the firewall
   - Add exceptions for Node.js applications on ports 3000 and 5000

2. **Verify Network Settings**: Ensure all devices are on the same network.

3. **Test API Connection**: Have users try accessing `http://<YOUR_IP>:5000` directly to see if they can reach your API server.

4. **Check Browser Console**: Ask users to open the browser developer tools and check for any errors in the console.

### CORS Errors

If you see CORS errors in the console, double-check the CORS configuration in `backend/src/server.js`.

## Additional Notes

- This setup is for development only. For production, you should use a proper deployment setup.
- Your IP address might change if you reconnect to the network, requiring you to update your configuration.
- For security, disable this configuration when not needed for network testing. 