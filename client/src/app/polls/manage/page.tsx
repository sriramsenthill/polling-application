'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useUserStore } from '@/store/userStore';
import PollCard from '@/components/polls/PollCard'; // Assuming you already have a PollCard component
import Modal from '@/components/Modal'; // Assuming the Modal component is available

function Page() {
    const { username } = useUserStore((state) => state);

    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pollToDelete, setPollToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await axiosInstance.get('api/polls/0'); // Fetch polls
                const userPolls = response.data.filter((poll: any) => poll.creator === username); // Filter polls by logged-in user
                setPolls(userPolls);
                setLoading(false);
            } catch (error) {
                setModalMessage({ type: 'error', text: 'Failed to fetch polls.' });
                setIsMessageModalOpen(true);
                setLoading(false);
            }
        };

        fetchPolls();
    }, [username]);

    const handleDelete = async () => {
        if (pollToDelete !== null) {
            try {
                await axiosInstance.delete(`api/polls/${pollToDelete}`);
                setPolls(polls.filter((poll) => poll.poll_id !== pollToDelete)); // Remove the deleted poll from the list
                setModalMessage({ type: 'success', text: 'Poll deleted successfully!' });
            } catch (error) {
                setModalMessage({ type: 'error', text: 'Failed to delete poll.' });
            } finally {
                setIsMessageModalOpen(true);
                setTimeout(() => {
                    setIsMessageModalOpen(false);
                }, 2000);
                setIsConfirmModalOpen(false); // Close confirmation modal
            }
        }
    };

    const handleOpenConfirmModal = (pollId: number) => {
        setPollToDelete(pollId);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setPollToDelete(null);
        setIsConfirmModalOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-custom-gray">
            <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Manage Your Polls</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {polls.map((poll) => (
                            <div key={poll.poll_id} className="relative">
                                <PollCard
                                    key={poll.poll_id}
                                    poll={poll}
                                    buttonLabel="Delete"
                                    buttonAction={() => handleOpenConfirmModal(poll.poll_id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <Modal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal}>
                    <div className="p-6 text-center">
                        <p className="text-lg font-semibold text-gray-800 mb-4">
                            Are you sure you want to delete this poll?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-custom-pink text-white rounded-lg hover:bg-pink-800"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={handleCloseConfirmModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Message Modal */}
            {modalMessage && (
                <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
                    <div
                        className={`p-20 text-center rounded-xl ${modalMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                            }`}
                    >
                        {modalMessage.text}
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default Page;
