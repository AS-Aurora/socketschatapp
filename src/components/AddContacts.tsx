"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AddContacts = ({ onClose, onContactAdded }: { onClose: () => void; onContactAdded: () => void }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {            
            const response = await axios.post("/api/dm/addcontact", { username, email });
            console.log(response.data)
            if (response.data.success) {
                onContactAdded()
                onClose()
            } else {
                setError(response.data.message || "Failed to add contact");
            }
        } catch (error: any) {
            setError(error.response?.data?.error || "An error occurred");
        }

        setLoading(false);
        router.refresh()

    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-xl font-bold mb-4">Add Contact</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded p-2 mt-1 text-black"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded p-2 mt-1 text-black"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContacts;
