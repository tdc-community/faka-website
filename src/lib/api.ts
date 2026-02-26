import type { MagazineEdition } from "./magazine-store";

export interface Role {
    id: number;
    name: string;
    color: string;
    permissions: string;
    createdAt: string;
    _count?: { users: number };
}

export interface UserProfile {
    id: number;
    username: string;
    fp_code: string;
    balance: number;
    iban?: string | null;
    roles?: Role[];
    createdAt?: string;
    _count?: { entries: number; votes: number; transactions: number };
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

    async register(username: string, password: string): Promise<{ message?: string; fp_code?: string; error?: string }> {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    async login(username: string, password: string): Promise<UserProfile | { error: string }> {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    async saveIban(username: string, iban: string): Promise<{ message?: string; error?: string }> {
        const res = await fetch(`/api/user/${username}/iban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iban })
        });
        return res.json();
    },

    async getUser(username: string): Promise<UserProfile | { error: string }> {
        const res = await fetch(`/api/user/${username}`);
        return res.json();
    },

    async withdraw(userId: number, amount: number): Promise<{ message?: string; new_balance?: number; error?: string }> {
        const res = await fetch('/api/frontend/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, amount })
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
    },

    // --- ROLE & USER MANAGEMENT API ---
    async adminLogin(password: string): Promise<{ message?: string; token?: string; error?: string }> {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        return res.json();
    },

    async getRoles(): Promise<Role[] | { error: string }> {
        const res = await fetch('/api/admin/roles');
        return res.json();
    },

    async createRole(data: Partial<Role>): Promise<Role | { error: string }> {
        const res = await fetch('/api/admin/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateRole(id: number, data: Partial<Role>): Promise<Role | { error: string }> {
        const res = await fetch(`/api/admin/roles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteRole(id: number): Promise<{ success: boolean; error?: string }> {
        const res = await fetch(`/api/admin/roles/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async getUsers(): Promise<UserProfile[] | { error: string }> {
        const res = await fetch('/api/admin/users');
        return res.json();
    },

    async updateUserRoles(userId: number, roleIds: number[]): Promise<UserProfile | { error: string }> {
        const res = await fetch(`/api/admin/users/${userId}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleIds })
        });
        return res.json();
    }
};
