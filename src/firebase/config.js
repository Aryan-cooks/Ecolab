// Mock Firebase services out-of-the-box
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Return unsubscribe function
    return () => {};
  },
};

export const db = {};
