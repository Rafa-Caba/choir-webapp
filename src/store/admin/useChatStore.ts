// src/store/admin/useChatStore.ts

import type { JSONContent } from '@tiptap/react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

import ENV from '../../config/env';
import { authBridge } from '../../api/authTokenBridge';
import {
    getChatHistory,
    sendTextMessage,
    toggleReaction,
    uploadChatMedia,
    type ChatAttachmentType,
} from '../../services/admin/chat';
import { getUserDirectory } from '../../services/admin/users';
import {
    readChatCache,
    writeChatCache,
} from '../../storage/chatStorage';
import { useTargetChoirStore } from '../platform/useTargetChoirStore';
import { getActiveTenantChoirId } from '../tenantStoreScope';
import type { User } from '../../types/auth';
import type {
    ChatClientToServerEvents,
    ChatConnectedUser,
    ChatMessage,
    ChatServerToClientEvents,
    MessageType,
} from '../../types/chat';
import { normalizeChatMessage } from '../../utils/chat/normalizeChatMessage';
import { normalizeOutgoingChatContent } from '../../utils/chat/normalizeOutgoingChatContent';

type ChatSocket = Socket<ChatServerToClientEvents, ChatClientToServerEvents>;

interface ChatState {
    readonly messages: ChatMessage[];
    readonly currentChoirId: string | null;
    readonly currentUserId: string | null;
    readonly connected: boolean;
    readonly socket: ChatSocket | null;
    readonly loading: boolean;
    readonly isSending: boolean;
    readonly hasMoreMessages: boolean;
    readonly onlineUsers: ChatConnectedUser[];
    readonly allUsers: ChatConnectedUser[];
    readonly typingUsers: string[];
    readonly connect: (token: string, user: User) => void;
    readonly disconnect: () => void;
    readonly sendMessage: (
        content: JSONContent,
        file?: File,
        type?: ChatAttachmentType,
        replyTo?: string,
    ) => Promise<void>;
    readonly sendTyping: (isTyping: boolean) => void;
    readonly reactToMessage: (messageId: string, emoji: string) => Promise<void>;
    readonly loadHistory: () => Promise<void>;
    readonly loadMoreMessages: () => Promise<boolean>;
    readonly fetchDirectory: () => Promise<void>;
}

const resolveChatChoirId = (user: User): string | null => {
    if (user.role === 'SUPER_ADMIN') {
        return useTargetChoirStore.getState().selectedChoir?.id ?? null;
    }

    return user.choirId;
};

const buildSocketAuth = (
    accessToken: string,
    user: User,
): { readonly accessToken: string; readonly targetChoirId?: string } => {
    const targetChoirId = user.role === 'SUPER_ADMIN'
        ? useTargetChoirStore.getState().selectedChoir?.id
        : undefined;

    return {
        accessToken,
        ...(targetChoirId ? { targetChoirId } : {}),
    };
};

const mapDirectoryUser = (user: User): ChatConnectedUser => ({
    id: user.id,
    name: user.name,
    username: user.username,
    imageUrl: user.imageUrl,
});

const toMessageType = (attachmentType: ChatAttachmentType | undefined): MessageType => {
    switch (attachmentType) {
        case 'image':
            return 'IMAGE';
        case 'video':
            return 'VIDEO';
        case 'audio':
            return 'AUDIO';
        case 'file':
            return 'FILE';
        default:
            return 'TEXT';
    }
};

const mergeMessage = (
    messages: readonly ChatMessage[],
    nextMessage: ChatMessage,
): ChatMessage[] => {
    const existingIndex = messages.findIndex((message) => message.id === nextMessage.id);

    if (existingIndex < 0) {
        return [...messages, nextMessage];
    }

    return messages.map((message, index) => (
        index === existingIndex ? nextMessage : message
    ));
};

const isCurrentChatSession = (choirId: string, userId: string): boolean => {
    const state = useChatStore.getState();

    return choirId === getActiveTenantChoirId()
        && choirId === state.currentChoirId
        && userId === state.currentUserId;
};

const persistChatMessages = (
    choirId: string,
    userId: string,
    messages: readonly ChatMessage[],
): void => {
    if (isCurrentChatSession(choirId, userId)) {
        writeChatCache(choirId, userId, messages);
    }
};

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    currentChoirId: null,
    currentUserId: null,
    onlineUsers: [],
    allUsers: [],
    typingUsers: [],
    connected: false,
    socket: null,
    loading: false,
    isSending: false,
    hasMoreMessages: true,

    loadHistory: async () => {
        const { currentChoirId: choirId, currentUserId: userId } = get();

        if (!choirId || !userId || !isCurrentChatSession(choirId, userId)) {
            return;
        }

        set({ loading: true, hasMoreMessages: true });

        try {
            const history = await getChatHistory(50);

            if (isCurrentChatSession(choirId, userId)) {
                const messages = history.map(normalizeChatMessage);
                set({ messages });
                persistChatMessages(choirId, userId, messages);
            }
        } finally {
            if (isCurrentChatSession(choirId, userId)) {
                set({ loading: false });
            }
        }
    },

    loadMoreMessages: async () => {
        const {
            messages,
            loading,
            currentChoirId,
            currentUserId,
        } = get();

        if (
            loading ||
            messages.length === 0 ||
            !currentChoirId ||
            !currentUserId ||
            !isCurrentChatSession(currentChoirId, currentUserId)
        ) {
            return false;
        }

        set({ loading: true });

        try {
            const oldestMessage = messages[0];
            const moreMessages = await getChatHistory(50, oldestMessage.createdAt);

            if (!isCurrentChatSession(currentChoirId, currentUserId)) {
                return false;
            }

            if (moreMessages.length === 0) {
                set({ hasMoreMessages: false });
                return false;
            }

            const normalizedMessages = moreMessages.map(normalizeChatMessage);
            const nextMessages = [...normalizedMessages, ...get().messages];
            set({ messages: nextMessages });
            persistChatMessages(currentChoirId, currentUserId, nextMessages);
            return true;
        } finally {
            if (isCurrentChatSession(currentChoirId, currentUserId)) {
                set({ loading: false });
            }
        }
    },

    fetchDirectory: async () => {
        const { currentChoirId: choirId, currentUserId: userId } = get();

        if (!choirId || !userId || !isCurrentChatSession(choirId, userId)) {
            return;
        }

        const users = await getUserDirectory();

        if (isCurrentChatSession(choirId, userId)) {
            set({ allUsers: users.map(mapDirectoryUser) });
        }
    },

    connect: (token, user) => {
        const chatChoirId = resolveChatChoirId(user);
        const chatUserId = user.id;

        if (
            !token ||
            !chatChoirId ||
            !chatUserId ||
            chatChoirId !== getActiveTenantChoirId()
        ) {
            get().disconnect();
            return;
        }

        const state = get();

        if (
            state.socket?.connected &&
            state.currentChoirId === chatChoirId &&
            state.currentUserId === chatUserId
        ) {
            return;
        }

        state.socket?.disconnect();
        set({
            messages: readChatCache(chatChoirId, chatUserId),
            hasMoreMessages: true,
            currentChoirId: chatChoirId,
            currentUserId: chatUserId,
            onlineUsers: [],
            allUsers: [],
            typingUsers: [],
            connected: false,
        });

        const socket: ChatSocket = io(ENV.API_ORIGIN, {
            path: '/socket.io',
            auth: buildSocketAuth(token, user),
            transports: ['websocket'],
            reconnection: true,
        });

        socket.on('connect', () => {
            if (isCurrentChatSession(chatChoirId, chatUserId)) {
                set({ connected: true });
            } else {
                socket.disconnect();
            }
        });
        socket.on('disconnect', () => {
            if (isCurrentChatSession(chatChoirId, chatUserId)) {
                set({ connected: false, onlineUsers: [] });
            }
        });
        socket.on('new-message', (incoming) => {
            const message = normalizeChatMessage(incoming);

            if (
                !isCurrentChatSession(chatChoirId, chatUserId) ||
                (message.choirId && message.choirId !== chatChoirId)
            ) {
                return;
            }

            const messages = mergeMessage(get().messages, message);
            set({ messages });
            persistChatMessages(chatChoirId, chatUserId, messages);
        });
        socket.on('message-updated', (incoming) => {
            const message = normalizeChatMessage(incoming);

            if (
                !isCurrentChatSession(chatChoirId, chatUserId) ||
                (message.choirId && message.choirId !== chatChoirId)
            ) {
                return;
            }

            const messages = mergeMessage(get().messages, message);
            set({ messages });
            persistChatMessages(chatChoirId, chatUserId, messages);
        });
        socket.on('online-users', (users) => {
            if (!isCurrentChatSession(chatChoirId, chatUserId)) {
                return;
            }

            const uniqueUsers = users.filter((userEntry, index, entries) => (
                entries.findIndex((candidate) => candidate.id === userEntry.id) === index
            ));
            set({ onlineUsers: [...uniqueUsers] });
        });
        socket.on('user-typing', ({ username, isTyping }) => {
            if (!isCurrentChatSession(chatChoirId, chatUserId)) {
                return;
            }

            set((current) => ({
                typingUsers: isTyping
                    ? current.typingUsers.includes(username)
                        ? current.typingUsers
                        : [...current.typingUsers, username]
                    : current.typingUsers.filter((entry) => entry !== username),
            }));
        });
        socket.on('session-disconnected', (payload) => {
            const shouldExpireCurrentSession = isCurrentChatSession(
                chatChoirId,
                chatUserId,
            );

            socket.disconnect();

            if (!shouldExpireCurrentSession) {
                return;
            }

            set({
                connected: false,
                socket: null,
                onlineUsers: [],
                typingUsers: [],
            });

            void authBridge.expireSession({
                code: payload?.code ?? 'SESSION_REVOKED',
                message: payload?.message,
            });
        });

        set({
            socket,
            currentChoirId: chatChoirId,
            currentUserId: chatUserId,
        });
    },

    disconnect: () => {
        get().socket?.disconnect();
        set({
            connected: false,
            socket: null,
            onlineUsers: [],
            allUsers: [],
            typingUsers: [],
            messages: [],
            currentChoirId: null,
            currentUserId: null,
            hasMoreMessages: true,
            loading: false,
            isSending: false,
        });
    },

    sendTyping: (isTyping) => {
        const { socket } = get();

        if (socket?.connected) {
            socket.emit('typing', isTyping);
        }
    },

    reactToMessage: async (messageId, emoji) => {
        const {
            currentChoirId: choirId,
            currentUserId: userId,
        } = get();

        if (!choirId || !userId || !isCurrentChatSession(choirId, userId)) {
            return;
        }

        const updatedMessage = normalizeChatMessage(
            await toggleReaction(messageId, emoji),
        );

        if (isCurrentChatSession(choirId, userId)) {
            const messages = mergeMessage(get().messages, updatedMessage);
            set({ messages });
            persistChatMessages(choirId, userId, messages);
        }
    },

    sendMessage: async (content, file, attachmentType, replyTo) => {
        const {
            socket,
            currentChoirId,
            currentUserId,
        } = get();

        if (
            !socket?.connected ||
            !currentChoirId ||
            !currentUserId ||
            !isCurrentChatSession(currentChoirId, currentUserId)
        ) {
            throw new Error('No active chat socket connection');
        }

        set({ isSending: true });

        try {
            get().sendTyping(false);
            const upload = file && attachmentType
                ? await uploadChatMedia(file, attachmentType)
                : null;
            const sentMessage = normalizeChatMessage(await sendTextMessage({
                content: normalizeOutgoingChatContent(content),
                type: toMessageType(attachmentType),
                ...(upload ? { mediaAssetId: upload.assetId } : {}),
                ...(replyTo ? { replyTo } : {}),
            }));

            if (isCurrentChatSession(currentChoirId, currentUserId)) {
                const messages = mergeMessage(get().messages, sentMessage);
                set({ messages });
                persistChatMessages(currentChoirId, currentUserId, messages);
            }
        } finally {
            if (isCurrentChatSession(currentChoirId, currentUserId)) {
                set({ isSending: false });
            }
        }
    },
}));
