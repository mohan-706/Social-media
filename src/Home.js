import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore, storage } from './firebase';
import './Home.css'; // Import the CSS file
import Post from './Post';

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postPicture, setPostPicture] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userRef = firestore.collection('users').doc(currentUser.uid);
      const unsubscribe = userRef.onSnapshot((snapshot) => {
        setUserData(snapshot.data());
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = firestore.collection('posts').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); 
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePostFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (postPicture && caption) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`post_pictures/${currentUser.uid}/${Date.now()}`);
        await fileRef.put(postPicture);
        const downloadUrl = await fileRef.getDownloadURL();

        const post = {
          caption,
          imageURL: downloadUrl,
          timestamp: Date.now(),
          authorId: currentUser.uid,
        };

        await firestore.collection('posts').add(post);

        setShowPostForm(false);
        setPostPicture(null);
        setPreviewImage(null);
        setCaption('');
      }
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostPicture(file);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="main">
      <div className='header'>
        {currentUser && userData && (
          <div className="user-info">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" className="user-avatar" />
            ) : (
              <div className="default-avatar">No Profile Picture</div>
            )}
            <Link to={`/user/${currentUser.uid}`} className="user-name">
              {userData.username}
            </Link>
          </div>
        )}
        {!currentUser && (
          <Link to={"/login"} className="user-name">
            Login
          </Link>
        )}
        <div className="header-buttons">
          {currentUser && userData && (
            <>
              <Link to="/personalized-feed" className="your-feed-button">
                Your Feed
              </Link>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
              <button className="upload-button" onClick={() => setShowPostForm(true)}>
                Upload Post
              </button>
            </>
          )}
        </div>
      </div>
      {currentUser && showPostForm && (
        <form className="post-form" >
          {previewImage && <img src={previewImage} alt="Preview" className="post-preview-image" />}
          <input type="file" onChange={handleImageChange} required />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            required
          />
          <button type="submit" onClick={handlePostFormSubmit} className="upload-post-button">
            Upload
          </button>
          <button onClick={() => setShowPostForm(false)} className="upload-cancel-button">
            Cancel
          </button>
        </form>
      )}

      <div className="post-container">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <Post key={post.id} post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
