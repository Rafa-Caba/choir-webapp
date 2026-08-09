// src/services/admin/member.ts

import api from '../../api/axios';
import type {
    CreateMemberPayload,
    Member,
    PaginatedMemberResponse,
} from '../../types/member';

const DEFAULT_PAGE_SIZE = 10;

const appendMemberFields = (
    formData: FormData,
    payload: Partial<CreateMemberPayload>,
): void => {
    if (payload.name !== undefined) {
        formData.append('name', payload.name.trim());
    }

    if (payload.instrumentId !== undefined) {
        formData.append('instrumentId', payload.instrumentId);
    }

    const instrumentLabel = payload.instrumentLabel ?? payload.instrument;

    if (instrumentLabel !== undefined) {
        formData.append('instrumentLabel', instrumentLabel.trim());
    }

    if (payload.voice !== undefined) {
        formData.append('voice', String(payload.voice));
    }
};

export const paginateMembers = (
    members: readonly Member[],
    page: number,
    limit: number,
): PaginatedMemberResponse => {
    const safeLimit = Math.max(1, limit);
    const totalMembers = members.length;
    const totalPages = Math.max(1, Math.ceil(totalMembers / safeLimit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * safeLimit;

    return {
        members: members.slice(startIndex, startIndex + safeLimit),
        currentPage,
        totalPages,
        totalMembers,
    };
};

export const getAllMembers = async (): Promise<Member[]> => {
    const { data } = await api.get<Member[]>('/members');
    return data;
};

export const getPaginatedMembers = async (
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
): Promise<PaginatedMemberResponse> => {
    const members = await getAllMembers();
    return paginateMembers(members, page, limit);
};

export const searchMembers = async (query: string): Promise<Member[]> => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-MX');

    if (!normalizedQuery) {
        return getAllMembers();
    }

    const members = await getAllMembers();

    return members.filter((member) => {
        const searchableText = [
            member.name,
            member.instrumentLabel,
            member.instrument,
        ]
            .filter((value): value is string => Boolean(value))
            .join(' ')
            .toLocaleLowerCase('es-MX');

        return searchableText.includes(normalizedQuery);
    });
};

export const searchPaginatedMembers = async (
    query: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
): Promise<PaginatedMemberResponse> => {
    const members = await searchMembers(query);
    return paginateMembers(members, page, limit);
};

export const getMemberById = async (id: string): Promise<Member> => {
    const { data } = await api.get<Member>(`/members/${encodeURIComponent(id)}`);
    return data;
};

export const createMember = async (
    payload: CreateMemberPayload,
): Promise<Member> => {
    const formData = new FormData();
    appendMemberFields(formData, payload);

    if (payload.file) {
        formData.append('file', payload.file);
    }

    const { data } = await api.post<Member>('/members', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const updateMember = async (
    id: string,
    payload: Partial<CreateMemberPayload>,
): Promise<Member> => {
    const formData = new FormData();
    appendMemberFields(formData, payload);

    if (payload.file) {
        formData.append('file', payload.file);
    }

    const { data } = await api.put<Member>(
        `/members/${encodeURIComponent(id)}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const deleteMember = async (id: string): Promise<void> => {
    await api.delete(`/members/${encodeURIComponent(id)}`);
};
