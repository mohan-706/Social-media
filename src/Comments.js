import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebase';
import './Comments.css';
import { Link } from 'react-router-dom';
const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const currentUser = auth.currentUser;
  const [users, setUsers] = useState({});
  useEffect(() => {
    const unsubscribe = firestore
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });


    return () => unsubscribe();
  }, [postId]);
  useEffect(() => {
    const unsubscribe = firestore.collection('users').onSnapshot((snapshot) => {
        const usersData = {};
        snapshot.docs.forEach((doc) => {
          usersData[doc.id] = doc.data();
        });
        setUsers(usersData);
      });
      

    return () => unsubscribe();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    try {
      if (currentUser) {
        const userId = currentUser.uid;
        await firestore.collection('posts').doc(postId).collection('comments').add({
          comment: newComment,
          userId: userId,
          timestamp: Date.now(),
        });
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="comments-container">
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <Link to={`/user/${comment.userId}`} className="user-profile-link">
                {users[comment.userId].username}
              </Link>
            <span>{comment.comment}</span>
          </li>
        ))}
      </ul>
      {currentUser && (
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button type="submit">Post</button>
        </form>
      )}
    </div>
  );
};

export default Comments;
