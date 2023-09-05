import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, firestore, storage } from './firebase'; // Correct the import path as needed
import Post from './Post';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore.collection('users').doc(userId).onSnapshot((snapshot) => {
      if (snapshot.exists) {
        setUser(snapshot.data());
        setIsCurrentUser(userId === auth.currentUser?.uid);
        setNewBio(snapshot.data().bio);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('posts')
      .where('authorId', '==', userId)
      .onSnapshot((snapshot) => {
        const userPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(userPosts);
      });

    return () => unsubscribe();
  }, [userId]);

  const handleBioEdit = async () => {
    if (editingProfile && newBio.trim() !== '') {
      try {
        await firestore.collection('users').doc(userId).update({ bio: newBio });
        setEditingProfile(false);
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    } else {
      setNewBio(user.bio);
      setEditingProfile(true);
    }
  };

  const handleProfilePictureEdit = async () => {
    if (editingProfile && newProfilePicture) {
      try {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`profile_pictures/${userId}`);
        await fileRef.put(newProfilePicture);
        const downloadUrl = await fileRef.getDownloadURL();
        await firestore.collection('users').doc(userId).update({ profilePicture: downloadUrl });
        setEditingProfile(false);
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    } else {
      setNewProfilePicture(null);
      setEditingProfile(true);
    }
  };

  const handleProfilePictureChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  };

  return (
    <div className="user-profile">
      {user && (
        <div>
          <h1>{user.username}'s Profile</h1>
          <div className="profile-picture-container">
            <img src={user.profilePicture} alt="Profile" className="profile-picture" />
            {isCurrentUser && (
              <button onClick={() => setEditingProfile(!editingProfile)}>
                {editingProfile ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            )}
          </div>
          {editingProfile && isCurrentUser && (
            <div>
              <input type="file" onChange={handleProfilePictureChange} />
              <button onClick={handleProfilePictureEdit}>Save Profile Picture</button>
            </div>
          )}
          <p>
            <strong>Bio:</strong>
            {editingProfile ? (
              <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} />
            ) : (
              <span>{user.bio}</span>
            )}
            {isCurrentUser && editingProfile &&(
              <button onClick={handleBioEdit}>
                Save Bio
              </button>
            )}
          </p>
          <h2>Posts</h2>
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
