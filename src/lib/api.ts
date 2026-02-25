export interface UserProfile {
    id: number;
    username: string;
    fp_code: string;
    balance: number;
}

export const api = {
    async register(username: string): Promise<{ message?: string; fp_code?: string; error?: string }> {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        return res.json();
    },

    async getUser(username: string): Promise<UserProfile | { error: string }> {
        const res = await fetch(`/api/user/${username}`);
        return res.json();
    },

    async withdraw(userId: number, amount: number, iban: string): Promise<{ message?: string; new_balance?: number; error?: string }> {
        const res = await fetch('/api/frontend/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, amount, iban })
        });
        return res.json();
    },

    async uploadEntry(userId: number, file: File, description: string): Promise<{ message?: string; error?: string }> {
        const formData = new FormData();
        formData.append("user_id", userId.toString());
        formData.append("image", file);
        formData.append("description", description);

        const res = await fetch('/api/entries', {
            method: 'POST',
            body: formData // Note: Content-Type is auto-set to multipart/form-data by fetch when using FormData
        });
        return res.json();
    },

    async getEntries(week: number = 1): Promise<any> {
        const res = await fetch(`/api/entries?week=${week}`);
        return res.json();
    },

    async vote(voterId: number, entryId: number, week: number = 1): Promise<{ message?: string; error?: string }> {
        const res = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voter_id: voterId, entry_id: entryId, week_number: week })
        });
        return res.json();
    }
};
