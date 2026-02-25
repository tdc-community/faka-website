import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const SHARED_API_KEY = "vashiat_super_taen_klyuch_tuka";
const GAME_SERVER_WITHDRAW_URL = "http://ip_na_survura/api/withdraw"; // Mock URL
const ENTRY_FEE = 1000.0;

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store in the Vite public directory so the frontend can serve it directly via /uploads/
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- UTILS ---
function generateFpCode(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- API ENDPOINTS ---

// 0. GET USER INFO
app.get("/api/user/:username", async (req, res) => {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
        id: user.id,
        username: user.username,
        fp_code: user.fpCode,
        balance: user.balance
    });
});

// 1. REGISTER
app.post("/api/register", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    // Check if taken
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return res.status(400).json({ error: "Username already exists" });
    }

    // Generate unique code loop
    let fpCode = "";
    let isUnique = false;
    while (!isUnique) {
        fpCode = generateFpCode();
        const existingCode = await prisma.user.findUnique({ where: { fpCode } });
        if (!existingCode) isUnique = true;
    }

    const newUser = await prisma.user.create({
        data: {
            username,
            fpCode,
            balance: 0.0
        }
    });

    return res.status(201).json({
        message: "User registered successfully",
        fp_code: newUser.fpCode
    });
});

// 2. DEPOSIT (Webhook from Game Server)
app.post("/api/deposit", async (req, res) => {
    const { amount, code, apiKey } = req.body;

    if (!apiKey || apiKey !== SHARED_API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!amount || !code) {
        return res.status(400).json({ error: "Missing amount or code" });
    }

    const user = await prisma.user.findUnique({ where: { fpCode: code } });

    if (!user) {
        return res.status(404).json({ error: "User code not found" });
    }

    try {
        // Transaction to safely update both balance and log
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { increment: parseFloat(amount) } }
            });

            await tx.transaction.create({
                data: {
                    userId: user.id,
                    txType: "deposit",
                    amount: parseFloat(amount),
                    status: "completed"
                }
            });
        });

        return res.status(200).json({ message: "Deposit successful", status: "success" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
    }
});

// 3. WITHDRAW (From Frontend to Game Server)
app.post("/api/frontend/withdraw", async (req, res) => {
    const { user_id, amount, iban } = req.body;
    const amountToWithdraw = parseFloat(amount || "0");

    const user = await prisma.user.findUnique({ where: { id: parseInt(user_id) } });

    if (!user || user.balance < amountToWithdraw || amountToWithdraw <= 0) {
        return res.status(400).json({ error: "Insufficient funds or invalid user" });
    }

    const withdrawId = uuidv4();

    // Create pending transaction
    const pendingTx = await prisma.transaction.create({
        data: {
            userId: user.id,
            txType: "withdraw",
            amount: amountToWithdraw,
            status: "pending",
            externalId: withdrawId
        }
    });

    const payload = {
        amount: amountToWithdraw,
        withdrawId,
        iban: iban,
        apiKey: SHARED_API_KEY
    };

    try {
        // We simulate the fetch here, normally it would be something like:
        // const response = await fetch(GAME_SERVER_WITHDRAW_URL, { method: "POST", body: JSON.stringify(payload) });

        // Simulating a game server failure as in the test
        const response = { ok: false, status: 503 };

        if (response.ok) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { balance: { decrement: amountToWithdraw } }
                }),
                prisma.transaction.update({
                    where: { id: pendingTx.id },
                    data: { status: "completed" }
                })
            ]);

            const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
            return res.status(200).json({ message: "Withdraw successful", new_balance: updatedUser?.balance });
        } else {
            await prisma.transaction.update({
                where: { id: pendingTx.id },
                data: { status: "failed" }
            });
            return res.status(400).json({ error: "Game server rejected the transaction (Simulated)" });
        }
    } catch (err) {
        await prisma.transaction.update({
            where: { id: pendingTx.id },
            data: { status: "failed" }
        });
        return res.status(503).json({ error: "Could not connect to game server" });
    }
});

// 4. UPLOAD CAR ENTRY
app.post("/api/entries", upload.single('image'), async (req, res) => {
    const { user_id, description } = req.body;
    const file = req.file;

    if (!user_id || !file) {
        return res.status(400).json({ error: "User ID and Image are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(user_id) } });

    if (!user || user.balance < ENTRY_FEE) {
        return res.status(400).json({ error: `Insufficient balance. Entry fee is $${ENTRY_FEE}.` });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Deduct fee
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: ENTRY_FEE } }
            });

            // 2. Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    txType: "entry_fee",
                    amount: ENTRY_FEE,
                    status: "completed"
                }
            });

            // 3. Create entry (Week 1 hardcoded for now)
            await tx.entry.create({
                data: {
                    userId: user.id,
                    imageUrl: `/uploads/${file.filename}`, // Relative path for Vite
                    description: description || "",
                    weekNumber: 1
                }
            });
        });

        return res.status(201).json({ message: "Entry successfully submitted!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to submit entry." });
    }
});

// 5. GET ENTRIES (Gallery)
app.get("/api/entries", async (req, res) => {
    const weekNumber = parseInt((req.query.week as string) || "1");
    const entries = await prisma.entry.findMany({
        where: { weekNumber },
        include: {
            user: {
                select: { username: true }
            },
            votes: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const formatted = entries.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        description: e.description,
        ownerUsername: e.user.username,
        votesCount: e.votes.length,
        createdAt: e.createdAt
    }));

    res.status(200).json(formatted);
});

// 6. VOTE
app.post("/api/vote", async (req, res) => {
    const { voter_id, entry_id, week_number } = req.body;

    if (!voter_id || !entry_id) {
        return res.status(400).json({ error: "Voter ID and Entry ID required." });
    }

    const existingVote = await prisma.vote.findFirst({
        where: { voterId: parseInt(voter_id), weekNumber: parseInt(week_number || "1") }
    });

    if (existingVote) {
        return res.status(400).json({ error: "You have already voted this week." });
    }

    try {
        const newVote = await prisma.vote.create({
            data: {
                voterId: parseInt(voter_id),
                entryId: parseInt(entry_id),
                weekNumber: parseInt(week_number || "1")
            }
        });
        return res.status(201).json({ message: "Vote cast successfully!", vote: newVote });
    } catch (err) {
        return res.status(500).json({ error: "Failed to cast vote." });
    }
});

// --- INIT ---
app.listen(PORT, () => {
    console.log(`Faka Performance API server is running on http://localhost:${PORT}`);
});
