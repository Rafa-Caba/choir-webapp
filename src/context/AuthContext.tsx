// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile } from '../services/auth';
import { useChatStore } from '../store/admin/useChatStore';
import { applyThemeToDocument } from '../utils/applyThemeToDocument';
import type { LoginPayload, RegisterPayload, User, UserRole } from '../types/auth';
import { clearAuthSession, persistAuthSession, readAccessToken } from '../storage/sessionStorage';

interface AuthContextType {
    user: User | null;
    token: string | null;
    role: UserRole | null;
    loading: boolean;

    login: (data: LoginPayload) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateUser: (userData: User) => void;
}

const DEFAULT_CHOIR_CODE = 'eroc1';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(readAccessToken());
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { connect, disconnect } = useChatStore();

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = readAccessToken();
            if (storedToken) {
                setToken(storedToken);
                await checkAuth();
            } else {
                setLoading(false);
            }
        };

        void initAuth();

        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user && user.themeId && typeof user.themeId === 'object') {
            applyThemeToDocument(user.themeId);
        }
    }, [user]);

    const checkAuth = async () => {
        const storedToken = readAccessToken();
        if (!storedToken) {
            setLoading(false);
            return;
        }
        try {
            const userData = await getUserProfile();
            setUser(userData);
            setRole(userData.role);

            connect(storedToken, userData);
        } catch (error) {
            console.error('Auth Check Failed', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: LoginPayload) => {
        try {
            const payload: LoginPayload = {
                ...data,
                choirCode: data.choirCode ?? DEFAULT_CHOIR_CODE,
            };

            const response = await loginUser(payload);

            persistAuthSession(response);

            setToken(response.accessToken);
            setRole(response.user.role);
            setUser(response.user);

            connect(response.accessToken, response.user);
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterPayload) => {
        try {
            const payload: RegisterPayload = {
                ...data,
                choirCode: data.choirCode ?? DEFAULT_CHOIR_CODE,
            };

            const response = await registerUser(payload);

            persistAuthSession(response);

            setToken(response.accessToken);
            setRole(response.user.role);
            setUser(response.user);

            connect(response.accessToken, response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        clearAuthSession();
        setToken(null);
        setUser(null);
        setRole(null);
        disconnect();
    };

    const updateUser = (userData: User) => {
        setUser((currentUser) => currentUser ? { ...currentUser, ...userData } : userData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role,
                loading,
                login,
                register,
                logout,
                checkAuth,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');

    const { user } = context;

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isAdmin = isSuperAdmin || user?.role === 'ADMIN';
    const canEdit = isSuperAdmin || user?.role === 'ADMIN' || user?.role === 'EDITOR';

    const choirId = user?.choirId ?? null;

    return { ...context, isAdmin, canEdit, isSuperAdmin, choirId };
};
