import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import UserBalance from "../components/UserBalance";
const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();

    try {
      await signOut();
      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred."); // Catch unexpected errors
    }
  };
  console.log(session);
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome, {session?.user?.user_metadata?.name}</h2>
      <p>{session?.user?.id}</p>
      
      <UserBalance session={session} />

      <div>
        <p
          onClick={handleSignOut}
          className="hover:cursor-pointer  border inline-block px-4 py-3 mt-4 "
        >
          Sign out
        </p>
      </div>
    </div>



  );
};

export default Dashboard;
