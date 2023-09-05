import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebase';
import Post from './Post';
import "./PersonalizedFeed.css"

const PersonalizedFeed = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = firestore
        .collection('users')
        .doc(currentUser.uid)
        .collection('friends')
        .onSnapshot((snapshot) => {
          const followedUserIds = snapshot.docs.map((doc) => doc.id);
          setFollowedUsers(followedUserIds);
        });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (followedUsers.length > 0) {
      const unsubscribe = firestore
        .collection('posts')
        .where('authorId', 'in', followedUsers)
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
          const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setFeedPosts(postsData);
        });

      return () => unsubscribe();
    }
    else {
      setFeedPosts([]);
    }
  }, [followedUsers]);

  return (
    <div className="personalized-feed-container">
      <h1>Your Personalized Feed</h1>
      {feedPosts.map((post) => (
        <div className="personalized-feed-post" key={post.id}>
          <Post post={post} />
        </div>
      ))}
    </div>
  );
};

export default PersonalizedFeed;
