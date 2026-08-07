// src/services/admin/instruments.ts

import api from '../../api/axios';
import type { CreateInstrumentPayload, Instrument } from '../../types/instrument';

const createFormData = (
    payload: CreateInstrumentPayload,
    file?: File,
): FormData => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        category: payload.category ?? '',
        iconKey: payload.iconKey,
        isActive: payload.isActive ?? true,
        order: payload.order ?? 0,
    }));

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getInstruments = async (): Promise<Instrument[]> => {
    const { data } = await api.get<Instrument[]>('/instruments');
    return data;
};

export const getInstrumentById = async (id: string): Promise<Instrument> => {
    const { data } = await api.get<Instrument>(
        `/instruments/${encodeURIComponent(id)}`,
    );
    return data;
};

export const saveInstrument = async (
    payload: CreateInstrumentPayload,
    file?: File,
    id?: string,
): Promise<Instrument> => {
    const formData = createFormData(payload, file);
    const request = id
        ? api.put<Instrument>(`/instruments/${encodeURIComponent(id)}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        : api.post<Instrument>('/instruments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    const { data } = await request;
    return data;
};

export const deleteInstrument = async (id: string): Promise<void> => {
    await api.delete(`/instruments/${encodeURIComponent(id)}`);
};
