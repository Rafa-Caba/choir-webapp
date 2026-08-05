// src/services/auth.ts

import api from '../api/axios';
import type {
    AuthSessionResponse,
    ChangePasswordPayload,
    CurrentSessionResponse,
    LogoutPayload,
    PlatformLoginPayload,
    TenantLoginPayload,
    UserProfile,
} from '../types/auth';
import type { ApiMessageResponse, UserResponse } from '../types/api/http';

export const loginTenantUser = async (
    payload: TenantLoginPayload,
): Promise<AuthSessionResponse> => {
    const { data } = await api.post<AuthSessionResponse>('/auth/login', payload);
    return data;
};

export const loginPlatformUser = async (
    payload: PlatformLoginPayload,
): Promise<AuthSessionResponse> => {
    const { data } = await api.post<AuthSessionResponse>('/auth/platform-login', payload);
    return data;
};

export const getCurrentSession = async (): Promise<CurrentSessionResponse> => {
    const { data } = await api.get<CurrentSessionResponse>('/auth/me');
    return data;
};

export const changeAuthenticatedPassword = async (
    payload: ChangePasswordPayload,
): Promise<AuthSessionResponse> => {
    const { data } = await api.post<AuthSessionResponse>('/auth/change-password', payload);
    return data;
};

export const logoutUserSession = async (
    payload: LogoutPayload,
): Promise<ApiMessageResponse> => {
    const { data } = await api.post<ApiMessageResponse>('/auth/logout', payload);
    return data;
};

export const getUserProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get<UserResponse>('/users/me');
    return data.user;
};
