'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useUserStore } from '@/store/userStore';
import PollCard from '@/components/polls/PollCard';
import Modal from '@/components/Modal';
import { Poll } from '@/types/poll';


function Page() {
    const { username } = useUserStore((state) => state);

    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pollToDelete, setPollToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await axiosInstance.get('api/polls/0');
                const userPolls = response.data.filter((poll: Poll) => poll.creator === username);
                setPolls(userPolls);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error fetching polls:', error.message);
                    setModalMessage({ type: 'error', text: 'Failed to fetch polls.' });
                } else {
                    console.error('An unknown error occurred:', error);
                    setModalMessage({ type: 'error', text: 'An unexpected error occurred.' });
                }
                setIsMessageModalOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, [username]);

    const handleDelete = async () => {
        if (pollToDelete !== null) {
            try {
                await axiosInstance.delete(`api/polls/${pollToDelete}`);
                setPolls((prev) => prev.filter((poll) => poll.poll_id !== pollToDelete));
                setModalMessage({ type: 'success', text: 'Poll deleted successfully!' });
            } catch (error) {
                if (error instanceof Error) {
                    const message = error.message || 'Failed to delete poll.';
                    console.error('Error deleting poll:', message);
                    setModalMessage({ type: 'error', text: message });
                } else {
                    setModalMessage({ type: 'error', text: 'An unexpected error occurred.' });
                }
            } finally {
                setIsMessageModalOpen(true);
                setIsConfirmModalOpen(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-custom-gray">
            <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Manage Your Polls</h1>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[10rem]">
                        <p className="text-gray-700">Loading polls...</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {polls.map((poll) => (
                            <PollCard
                                key={poll.poll_id}
                                poll={poll}
                                buttonLabel="Delete"
                                buttonAction={() => {
                                    setPollToDelete(poll.poll_id);
                                    setIsConfirmModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
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
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            No, Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Message Modal */}
            {modalMessage && (
                <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
                    <div className={`p-6 text-center rounded-xl ${modalMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                        {modalMessage.text}
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default Page;
