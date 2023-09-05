import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore, auth } from './firebase';
import './Post.css';
import Comments from './Comments';

const Post = ({ post }) => {
  const [author, setAuthor] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = firestore.collection('users').doc(post.authorId).onSnapshot((snapshot) => {
      if (snapshot.exists) {
        setAuthor(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [post.authorId]);

  useEffect(() => {
    const unsubscribe = firestore.collection('posts').doc(post.id).collection('likes').onSnapshot((snapshot) => {
      setLikesCount(snapshot.size);
      if (currentUser) {
        setLikedByCurrentUser(snapshot.docs.some((doc) => doc.data().userId === currentUser.uid));
      }
    });

    return () => unsubscribe();
  }, [post.id, currentUser]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('users')
      .doc(currentUser?.uid)
      .collection('friends')
      .doc(post.authorId)
      .onSnapshot((snapshot) => {
        setIsFollowing(snapshot.exists);
      });

    return () => unsubscribe();
  }, [post.authorId, currentUser]);

  const handleLikePost = async () => {
    if (currentUser) {
      try {
        const likeRef = firestore.collection('posts').doc(post.id).collection('likes').doc(currentUser.uid);

        if (!likedByCurrentUser) {
          // If the current user has not liked the post, increment the likesCount and add the user to the likes subcollection
          await firestore.collection('posts').doc(post.id).update({ likesCount: likesCount + 1 });
          await likeRef.set({ userId: currentUser.uid });
        } else {
          // If the current user has already liked the post, decrement the likesCount and remove the user from the likes subcollection
          await firestore.collection('posts').doc(post.id).update({ likesCount: likesCount - 1 });
          await likeRef.delete();
        }
      } catch (error) {
        console.error('Error liking post:', error);
      }
    }
  };

  const handleFollowUser = async () => {
    if (currentUser) {
      try {
        const friendRef = firestore.collection('users').doc(currentUser.uid).collection('friends').doc(post.authorId);
        if (!isFollowing) {
          // If the current user is not following the post author, add them as friends
          await friendRef.set({ userId: post.authorId });
        } else {
          // If the current user is already following the post author, unfollow them
          await friendRef.delete();
        }
      } catch (error) {
        console.error('Error following user:', error);
      }
    }
  };

  const handleDeletePost = async () => {
    if (currentUser && currentUser.uid === post.authorId) {
      try {
        const shouldDelete = window.confirm('Are you sure you want to delete this post?');
        
        if (shouldDelete) {
          // First, delete the comments within the post's comments subcollection
          const commentsSnapshot = await firestore.collection('posts').doc(post.id).collection('comments').get();
          const batch = firestore.batch();
          commentsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });

          // Delete the likes subcollection
          const likesSnapshot = await firestore.collection('posts').doc(post.id).collection('likes').get();
          likesSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });

          // Then, delete the post document itself
          batch.delete(firestore.collection('posts').doc(post.id));
          await batch.commit();

          // Show a confirmation message after successful deletion
          alert('Post deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };


  return (
    <div className="post-container">
      {author && (
        <div className="user-info">
          {author.profilePicture ? (
            <img src={author.profilePicture} alt="Profile" className="user-avatar" />
          ) : (
            <div className="default-avatar">No Profile Picture</div>
          )}

          <div className="user-details">
            <Link to={`/user/${post.authorId}`} className="user-profile-link">
              <span className="username">{author.username}</span>
            </Link>
            {currentUser && currentUser.uid !== post.authorId && (
              <button className={`follow-button ${isFollowing ? 'following' : ''}`} onClick={handleFollowUser}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {currentUser && currentUser.uid === post.authorId && (
              <button className="delete-button" onClick={handleDeletePost}>
                Delete Post
              </button>
            )}
          </div>
        </div>
      )}
      <img src={post.imageURL} alt="Post" className="post-image" />
      {currentUser&&(
        <div className="post-actions">
        <button className={`like-button ${likedByCurrentUser ? 'liked' : ''}`} onClick={handleLikePost}>
          {likedByCurrentUser ? '❤️' : '🤍'}
        </button>
        <span className="likes-count">{likesCount} likes</span>
      </div>
      )}
      
      <p className="post-caption">{post.caption}</p>
      <Comments postId={post.id} />
    </div>
  );
};

export default Post;
