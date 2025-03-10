// Script to automatically find and set the local IP address in .env files
const fs = require('fs');
const os = require('os');
const path = require('path');

// Find the local IP address (non-localhost)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = 'localhost';

  // Loop through network interfaces
  Object.keys(interfaces).forEach((ifName) => {
    interfaces[ifName].forEach((iface) => {
      // Skip internal and non-IPv4 addresses
      if (iface.family !== 'IPv4' || iface.internal) {
        return;
      }
      
      // Prefer the first address found with 192.168.x.x format
      if (iface.address.startsWith('192.168.')) {
        ipAddress = iface.address;
        return;
      }
      
      // Fallback to other non-internal addresses
      if (!ipAddress || ipAddress === 'localhost') {
        ipAddress = iface.address;
      }
    });
  });

  return ipAddress;
}

// Update the .env file
function updateEnvFile() {
  const ipAddress = getLocalIpAddress();
  console.log(`Found local IP address: ${ipAddress}`);
  
  // Update frontend .env file
  try {
    const frontendEnvPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(frontendEnvPath) 
      ? fs.readFileSync(frontendEnvPath, 'utf8')
      : '# Frontend Environment Variables\n';
    
    // Replace or add the API URL with the local IP
    if (envContent.includes('REACT_APP_API_URL=')) {
      envContent = envContent.replace(
        /REACT_APP_API_URL=.*/g,
        `REACT_APP_API_URL=http://${ipAddress}:5000/api`
      );
    } else {
      envContent += `\nREACT_APP_API_URL=http://${ipAddress}:5000/api\n`;
    }
    
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log(`Updated frontend .env file with IP: ${ipAddress}`);
  } catch (err) {
    console.error('Error updating frontend .env:', err);
  }
  
  // Update backend .env file if it exists
  try {
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(backendEnvPath)) {
      let backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
      
      // Ensure HOST is set to 0.0.0.0
      if (backendEnvContent.includes('HOST=')) {
        backendEnvContent = backendEnvContent.replace(
          /HOST=.*/g,
          'HOST=0.0.0.0'
        );
      } else {
        backendEnvContent += '\nHOST=0.0.0.0\n';
      }
      
      fs.writeFileSync(backendEnvPath, backendEnvContent);
      console.log('Updated backend .env file to bind to 0.0.0.0');
    }
  } catch (err) {
    console.error('Error updating backend .env:', err);
  }
  
  console.log('\nSetup complete!');
  console.log('----------------------------------------------------');
  console.log('To access your app from other devices on the network:');
  console.log(`1. Frontend: http://${ipAddress}:3000`);
  console.log(`2. Backend API: http://${ipAddress}:5000`);
  console.log('----------------------------------------------------');
  console.log('Make sure your firewall allows incoming connections to these ports.');
}

// Run the update
updateEnvFile(); 