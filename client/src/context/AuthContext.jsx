import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("ripple_token");
        if (!token) {
            setLoading(false);
            return;
        }
        client
            .get("/auth/me")
            .then((res) => setUser(res.data.user))
            .catch(() => localStorage.removeItem("ripple_token"))
            .finally(() => setLoading(false));
    }, []);

    async function login(username, password) {
        const res = await client.post("/auth/login", { username, password });
        localStorage.setItem("ripple_token", res.data.token);
        setUser(res.data.user);
    }

    async function register(username, email, password) {
        const res = await client.post("/auth/register", { username, email, password });
        localStorage.setItem("ripple_token", res.data.token);
        setUser(res.data.user);
    }

    function logout() {
        localStorage.removeItem("ripple_token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
