// src/types/instrument.ts

export interface InstrumentAuthor {
    id: string;
    name: string;
    username?: string;
}

export interface Instrument {
    id: string;
    name: string;
    slug: string;
    category: string;
    iconKey: string;

    iconUrl?: string;
    iconPublicId?: string;

    isActive: boolean;
    order: number;

    choirId?: string | null;

    createdAt?: string;
    updatedAt?: string;

    createdBy?: InstrumentAuthor | string;
    updatedBy?: InstrumentAuthor | string;
}

export interface CreateInstrumentPayload {
    name: string;
    slug: string;
    category?: string;
    iconKey: string;
    isActive?: boolean;
    order?: number;

}
