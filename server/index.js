import express from 'express';
import cors from 'cors';
import nacl from 'tweetnacl';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

let storedSeed = null; // Store seed temporarily (for demo purposes only)

// Endpoint to create a wallet
app.post('/home', (req, res) => {
    try {
        const mnemonic = generateMnemonic();
        const seed = mnemonicToSeedSync(mnemonic);
        storedSeed = seed; // Store the seed temporarily
        const publicKeys = [];

        // Generate a single keypair initially
        const path = `m/44'/501'/0'/0'`;
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();
        publicKeys.push(publicKey);

        res.status(201).json({
            message: 'Wallet created successfully',
            mnemonic: mnemonic, // Return mnemonic for now (consider removing in production)
            publicKeys: publicKeys,
        });
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to validate `count`
const validateCount = (req, res, next) => {
    const count = req.body.count;
    if (typeof count !== 'number' || count <= 0 || count > 10) {
        return res.status(400).json({ message: 'Count must be a number between 1 and 10.' });
    }
    next();
};

// Endpoint to create additional accounts
app.put('/home1', validateCount, (req, res) => {
    try {
        if (!storedSeed) {
            return res.status(400).json({ message: 'Seed not found. Create a wallet first.' });
        }

        const { count } = req.body;
        const publicKeys = [];

        for (let i = 0; i < count; i++) {
            const path = `m/44'/501'/${i + 1}'/0'`;
            const derivedSeed = derivePath(path, storedSeed.toString('hex')).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();
            publicKeys.push(publicKey);
        }

        res.status(200).json({
            message: 'Accounts created successfully',
            publicKeys: publicKeys,
            count: publicKeys.length,
        });
    } catch (error) {
        console.error('Error creating accounts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
