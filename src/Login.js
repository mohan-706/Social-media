import React, { useState } from 'react';
import { auth, firestore, storage } from './firebase';
import { Navigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // Upload profile picture to Firebase Storage
      let profilePictureUrl = '';
      if (profilePicture) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`profile_pictures/${userCredential.user.uid}`);
        await fileRef.put(profilePicture);
        profilePictureUrl = await fileRef.getDownloadURL();
      }

      // Set user's display name and photo URL
      await userCredential.user.updateProfile({
        displayName: username,
        photoURL: profilePictureUrl,
      });

      // Save user details to Firestore
      await firestore.collection('users').doc(userCredential.user.uid).set({
        uid: userCredential.user.uid,
        email,
        username,
        profilePicture: profilePictureUrl,
        bio,
      });

      setCurrentUser(userCredential.user);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      setCurrentUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (currentUser) {
    // Redirect to home page after successful login/signup
    console.log(currentUser);
    return <Navigate to="/home" />;
  }

  return (
    <div className="login-container">
      <h1>{showSignup ? 'Sign Up' : 'Login'} Page</h1>
      {showSignup ? (
        <form onSubmit={handleSignup}>
          <div className="input-container">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          </div>
          <div className="input-container">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          </div>
          <div className="input-container">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          <div className="input-container">
            <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
          </div>
          <div className="input-container">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          </div>
          <div className="button-container">
            <button type="submit">Sign Up</button>
          </div>
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => setShowSignup(false)}>
              Login
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          </div>
          <div className="input-container">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          <div className="button-container">
            <button type="submit">Login</button>
          </div>
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => setShowSignup(true)}>
              Register
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
