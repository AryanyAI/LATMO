import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import ChatBox from './components/ChatBox';

function App() {
    const { token } = useContext(AuthContext);

    return token ? <ChatBox /> : <Login />;
}

const AppWrapper = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AppWrapper;