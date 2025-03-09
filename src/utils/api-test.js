// API integration test helper
// You can use this in the browser console to test API calls

import { 
  registerUser, 
  loginUser, 
  getAllGames, 
  getGameContent, 
  submitGameResults 
} from '../services/api';

// Test user registration
const testRegister = async () => {
  try {
    const response = await registerUser({
      username: "testuser" + Math.floor(Math.random() * 1000),
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      password: "password123",
      displayName: "Test User"
    });
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    return null;
  }
};

// Test user login
const testLogin = async (email = "test@example.com", password = "password123") => {
  try {
    const response = await loginUser({ email, password });
    console.log("Login successful:", response.data);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return null;
  }
};

// Test getting all games
const testGetGames = async () => {
  try {
    const response = await getAllGames();
    console.log("Games retrieved:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to get games:", error.response?.data || error.message);
    return null;
  }
};

// Test submitting game results
const testSubmitResults = async (gameId) => {
  try {
    const response = await submitGameResults(gameId, {
      score: 100,
      timeSpent: 60,
      accuracy: 85,
      xpEarned: 10
    });
    console.log("Results submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to submit results:", error.response?.data || error.message);
    return null;
  }
};

// Run a complete test flow
const runFullTest = async () => {
  // Register or login
  let userData = await testRegister();
  if (!userData) {
    userData = await testLogin();
    if (!userData) {
      console.error("Both registration and login failed. Cannot proceed with tests.");
      return;
    }
  }
  
  // Get games
  const gamesData = await testGetGames();
  if (!gamesData || !gamesData.data || !gamesData.data.games.length) {
    console.error("No games found in the database.");
    return;
  }
  
  // Submit game results for each game type
  for (const game of gamesData.data.games) {
    console.log(`Testing result submission for ${game.name} (${game.type})`);
    await testSubmitResults(game._id);
  }
  
  console.log("All tests completed!");
};

// Export the test functions
export {
  testRegister,
  testLogin,
  testGetGames,
  testSubmitResults,
  runFullTest
};

// To use in console, import this script and call the functions
// Example: import * as ApiTest from './utils/api-test'; ApiTest.runFullTest(); 