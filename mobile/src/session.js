// mobile/src/session.js
export const session = {
  user: null,          // Holds {email, role, student_id}
  token: null,         // <--- ADD THIS: Store the DRF Token here after login
  adminPasscode: "1234", // Must match Django ADMIN_PASSCODE in views.py
};