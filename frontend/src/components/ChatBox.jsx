import React, { useState, useContext } from 'react';
import axios from 'axios';
import Message from './Message';
import { AuthContext } from '../context/AuthContext';

const ChatBox = () => {
    const { token, removeToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages([...messages, userMessage]);
        setInput('');

        try {
            const response = await axios.post(
                'http://localhost:8000/chat/send_message',
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const botMessage = { sender: 'bot', text: response.data.response };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { sender: 'bot', text: 'Error: Unable to get response.' };
            setMessages([...messages, userMessage, errorMessage]);
        }
    };

    const handleLogout = () => {
        removeToken();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="flex justify-between items-center p-4 bg-white shadow">
                <h1 className="text-xl font-bold">Chat-AI</h1>
                <button 
                    onClick={handleLogout} 
                    className="bg-red-500 text-white px-3 py-1 rounded"
                >
                    Logout
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <Message key={index} sender={msg.sender} text={msg.text} />
                ))}
            </div>
            <div className="p-4 bg-white flex">
                <input 
                    type="text" 
                    className="flex-1 border rounded p-2" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
                    placeholder="Type your message..."
                />
                <button 
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;