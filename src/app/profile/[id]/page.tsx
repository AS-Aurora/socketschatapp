"use client";

import Logout from "@/src/components/Logout";
import axios from "axios";
import React, { use, useEffect, useRef, useState } from "react";
import ProfileImageUpload from "../../../components/ProfileImageUpload";
import { useRouter } from "next/navigation";

const Profile = (context: { params: Promise<{ id: string }> }) => {
  const [user, setUser] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newUsername, setNewUsername] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const params = use(context.params);
  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, loggedInResponse] = await Promise.all([
          axios.get(`/api/profile/${id}`),
          axios.get("/api/users/me"),
        ]);
        setUser(profileResponse.data);
        setLoggedInUser(loggedInResponse.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdateUsername = async () => {
    if (loggedInUser?._id !== id) return;

    try {
      const response = await axios.put(`/api/profile/${id}`, {
        username: newUsername,
      });
      setUser(response.data);
      setEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-100 p-6 shadow-md">
        <div className="flex items-center mb-4">
          <button
            className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={handleBack}
          >
            Back
          </button>
          <h2 className="text-lg font-semibold text-black mx-3">Profile</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="flex flex-col space-y-4">
            {loggedInUser?._id === id ? (
              <ProfileImageUpload
                currImgId={user?.profilePicture || "/default.img"}
                userId={id}
                onSuccess={(imageUrl) => {
                  setUser((prev: any) => ({
                    ...prev,
                    profilePicture: imageUrl,
                  }));
                }}
              />
            ) : (
              <img
                src={
                  user?.profilePicture ||
                  "https://static.vecteezy.com/system/resources/thumbnails/024/983/914/small/simple-user-default-icon-free-png.png"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            )}

            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-black">
                Username: {user?.username}
              </h1>
              {loggedInUser?._id === id && (
                <button onClick={() => setEditing(!editing)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-500 hover:text-blue-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
              )}
            </div>

            {editing && loggedInUser?._id === id && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full text-black"
                  placeholder="Enter new username"
                />
                <button
                  onClick={handleUpdateUsername}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Enter
                </button>
              </div>
            )}
          </div>
        )}
        {loggedInUser?._id === id && <Logout />}
      </div>
    </div>
  );
};

export default Profile;
