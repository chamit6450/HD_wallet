import React, { useState } from 'react';
import axios from 'axios';

const WalletCreator = () => {
    const [walletInfo, setWalletInfo] = useState(null);
    const [error, setError] = useState(null);
    const [walletCreated, setWalletCreated] = useState(false);
    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);

    const createWallet = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/home', {});
            setWalletInfo(response.data);
            setError(null);
            setWalletCreated(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating wallet');
            console.error('Error creating wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async () => {
        setLoading(true);
        try {
            const response = await axios.put('http://localhost:3000/home1', { count });
            setWalletInfo((prev) => ({
                ...prev,
                publicKeys: [ ...response.data.publicKeys] // Assuming the response contains new public keys
          
            }));
            setCount(count + 1); // Increment count after successful account creation
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
            console.error('Error creating account:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={createWallet} disabled={loading}>
                {loading ? 'Creating Wallet...' : 'Create Wallet'}
            </button>
            {walletInfo && (
                <div>
                    <h3>Wallet Created:</h3>
                    <p>Mnemonic: {walletInfo.mnemonic}</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {walletCreated && (
                <div>
                    <button onClick={createAccount} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <h4>Public Keys:</h4>
                    <ul>
                        {walletInfo.publicKeys?.map((key, index) => (
                            <li key={index}>{key}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WalletCreator;
