
export interface PollOption {
    option_id: number;
    text: string;
    votes: number;
}

export interface Poll {
    poll_id: number;
    title: string;
    creator: string;
    description: string;
    created_at: string;
    expiration_date: string;
    status: string;
    options: PollOption[];
    users_voted: string[];
}
