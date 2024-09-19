'use client'

import React, { useEffect, useState } from 'react';

interface ProfileData {
  display_name: string;
  email: string;
  images: { url: string }[];
  followers: { total: number };
  // Add more fields as needed
}

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/me');
        const result = await response.json();
        if (result.success) {
          setProfileData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch profile data');
      }
    };

    fetchProfileData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {profileData.images && profileData.images.length > 0 && (
        <img src={profileData.images[0].url} alt="Profile" />
      )}
      <p>Name: {profileData.display_name}</p>
      <p>Email: {profileData.email}</p>
      <p>Followers: {profileData.followers.total}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default ProfilePage;