
import axios from 'axios';

const BASE_URL = 'http://localhost:9090/gotogether';

// 1. REGISTER
export const registerUser = (data) => axios.post(`${BASE_URL}/users/register`, data);

// 2. GET USER PROFILE
export const getUserProfile = (userId) => axios.get(`${BASE_URL}/users/${userId}`);

// 3. UPDATE PROFILE
export const updateUserProfile = (userId, data) => axios.put(`${BASE_URL}/users/${userId}`, data);

// 4. DELETE ACCOUNT
export const deleteUserAccount = (userId) => axios.delete(`${BASE_URL}/users/${userId}`);

// 5. CHANGE PASSWORD
export const changeUserPassword = (userId, data) => axios.patch(`${BASE_URL}/users/${userId}/password`, data);

// 6. LOGIN
export const loginUser = (credentials) => axios.post(`${BASE_URL}/users/login`, credentials);

// 6.1 REFRESH ACCESS TOKEN
export const refreshAccessToken = (refreshToken) => axios.post(`${BASE_URL}/users/refresh-token`, { refreshToken });

// 6.2 REVOKE REFRESH TOKEN (LOGOUT)
export const revokeRefreshToken = (userId, refreshToken) => axios.post(`${BASE_URL}/users/${userId}/revoke-token`, { refreshToken });

// 7. LOGOUT
export const logoutUser = () => axios.post(`${BASE_URL}/users/logout`);

// 8. VERIFY PHONE (send OTP)
export const sendPhoneOTP = (userId) => axios.get(`${BASE_URL}/users/${userId}/verify-phone`);

// 9. VERIFY EMAIL (send verification email)
export const sendEmailVerification = (userId) => axios.post(`${BASE_URL}/users/${userId}/verify-email`);

// 10. UPLOAD DOCS
export const uploadIdentityDocuments = (userId, documents) => axios.post(`${BASE_URL}/users/${userId}/verify-identity`, documents);

// 11. GET VERIFICATION STATUS
export const getVerificationStatus = (userId) => axios.get(`${BASE_URL}/users/${userId}/verification-status`);

// 12. GET TOP RATED DRIVERS
export const getTopRatedDrivers = () => axios.get(`${BASE_URL}/users/top-rated`);

// 13. UPDATE PREFERENCES
export const updateUserPreferences = (userId, preferences) => axios.put(`${BASE_URL}/users/${userId}/preferences`, preferences);

// 14. VERIFY OTP
export const verifyPhoneOTP = (userId, otp) => axios.post(`${BASE_URL}/users/${userId}/verify-otp?otp=${encodeURIComponent(otp)}`);

// 15. CONFIRM EMAIL VERIFICATION
export const verifyEmailToken = (token) => axios.get(`${BASE_URL}/users/verify-email-confirm?token=${encodeURIComponent(token)}`);

// 16. UPLOAD PROFILE IMAGE (to S3)
export const uploadProfileImage = (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${BASE_URL}/users/${userId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
