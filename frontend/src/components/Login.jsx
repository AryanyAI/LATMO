import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { saveToken } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        try {
            const response = await axios.post(`http://localhost:8000/auth/${endpoint}`, {
                username,
                password
            });
            if (isLogin) {
                saveToken(response.data.access_token);
            } else {
                setIsLogin(true);
                setError('Registration successful! Please log in.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form 
                className="bg-white p-6 rounded shadow-md w-80" 
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl mb-4 text-center">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <div className="mb-4">
                    <label className="block mb-1">Username</label>
                    <input 
                        type="text" 
                        className="w-full border rounded p-2" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Password</label>
                    <input 
                        type="password" 
                        className="w-full border rounded p-2" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
                <p className="mt-4 text-center">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'} 
                    <button 
                        className="text-blue-500 ml-2" 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        type="button"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </form>
        </div>
    );
};

export default Login;