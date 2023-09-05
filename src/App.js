
import React, { useEffect, useState } from 'react';
import { BrowserRouter , Route, Navigate, Routes } from 'react-router-dom';
import { auth } from './firebase';
import Login from './Login';
import Home from './Home';
import UserProfile from './UserProfile';
import PersonalizedFeed from './PersonalizedFeed';
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);
  return (
    <BrowserRouter>
      <div className='App'>
        <Routes>
          <Route exact path="/" Component={Home}/>
          <Route exact path="/login" Component={Login}/>
          <Route exact path="/home" Component={Home}/>
          <Route path="/user/:userId" Component={UserProfile} />
          <Route exact path="/personalized-feed" Component={PersonalizedFeed} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
