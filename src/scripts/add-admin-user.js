// Copy and paste this code into your browser console when running the app

// Create admin user
async function createAdminUser() {
  const email = 'brians@wl4wl.org';
  const password = 'Yfhk9r76q@@123456';
  const displayName = 'Brian Stitts';
  
  try {
    // Import Firebase auth
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { getFirestore, doc, setDoc, Timestamp } = await import('firebase/firestore');
    
    // Get auth and firestore instances
    const auth = getAuth();
    const db = getFirestore();
    
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Add user document to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      role: 'admin',
      organizationId: 'wl4wj',
      isActive: true,
      isApproved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      hipaaTrainingCompleted: true,
      hipaaTrainingDate: Timestamp.now()
    });
    
    console.log('Admin user created successfully:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Call the function
createAdminUser().then(user => {
  console.log('Admin user created with UID:', user.uid);
}).catch(error => {
  console.error('Failed to create admin user:', error);
});
