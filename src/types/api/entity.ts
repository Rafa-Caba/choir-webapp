// src/types/api/entity.ts

export interface EntityIdentifier {
    readonly id?: string;
    readonly _id?: string;
}

export const resolveEntityId = (entity: EntityIdentifier): string | null => {
    const canonicalId = entity.id?.trim();

    if (canonicalId) {
        return canonicalId;
    }

    const legacyMongoId = entity._id?.trim();
    return legacyMongoId || null;
};
