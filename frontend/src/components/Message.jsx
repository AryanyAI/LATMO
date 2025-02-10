import React from 'react';

const Message = ({ sender, text }) => {
    const isUser = sender === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`rounded-lg p-2 max-w-md ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                {text}
            </div>
        </div>
    );
};

export default Message;