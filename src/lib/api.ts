import type { MagazineEdition } from "./magazine-store";

export interface UserProfile {
    id: number;
    username: string;
    fp_code: string;
    balance: number;
}

export interface SiteSettings {
    entryFee?: number;
    apiKey?: string;
    withdrawUrl?: string;
    currentWeek?: number;
}

export const api = {
    async getSettings(): Promise<SiteSettings> {
        const res = await fetch('/api/admin/settings');
        return res.json();
    },

    async updateSettings(data: SiteSettings): Promise<{ message?: string; settings?: SiteSettings; error?: string }> {
        const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

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

    async cancelEntry(userId: number, entryId: number): Promise<{ message?: string; error?: string }> {
        const res = await fetch(`/api/entries/${entryId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        return res.json();
    },

    async vote(voterId: number, entryId: number, week: number = 1): Promise<{ message?: string; error?: string }> {
        const res = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voter_id: voterId, entry_id: entryId, week_number: week })
        });
        return res.json();
    },

    // --- MAGAZINE EDITION API ---
    async getEditions(): Promise<MagazineEdition[] | { error: string }> {
        const res = await fetch('/api/editions');
        return res.json();
    },

    async getPublishedEdition(): Promise<MagazineEdition | { error: string }> {
        const res = await fetch('/api/editions/published');
        if (!res.ok) return { error: "Failed to fetch published edition" };
        return res.json();
    },

    async saveEdition(edition: MagazineEdition): Promise<MagazineEdition | { error: string }> {
        const res = await fetch('/api/editions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(edition)
        });
        return res.json();
    },

    async publishEdition(id: string): Promise<{ success: boolean; error?: string }> {
        const res = await fetch(`/api/editions/${id}/publish`, {
            method: 'POST'
        });
        return res.json();
    },

    async deleteEdition(id: string): Promise<{ success: boolean; error?: string }> {
        const res = await fetch(`/api/editions/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};
