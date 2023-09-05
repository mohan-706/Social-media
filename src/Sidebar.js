import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/home" className="sidebar-link">
        Home
      </Link>
      <Link to="/personalized-feed" className="sidebar-link">
        Personalized Feed
      </Link>
      <Link to={`/user/${currentUser.uid}`} className="sidebar-link">
        Your Profile
      </Link>
    </div>
  );
};

export default Sidebar;
