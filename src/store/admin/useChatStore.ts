// src/store/admin/useChatStore.ts

import type { JSONContent } from '@tiptap/react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

import ENV from '../../config/env';
import {
    getChatHistory,
    sendTextMessage,
    toggleReaction,
    uploadChatMedia,
    type ChatAttachmentType,
} from '../../services/admin/chat';
import type { ChatMessageDto } from '../../services/admin/chatDtos';
import { getUserDirectory } from '../../services/admin/users';
import { useTargetChoirStore } from '../platform/useTargetChoirStore';
import { getActiveTenantChoirId } from '../tenantStoreScope';
import type { User } from '../../types/auth';
import type { ChatMessage, MessageType } from '../../types/chat';
import { normalizeChatMessage } from '../../utils/chat/normalizeChatMessage';

interface ConnectedUser {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly imageUrl?: string;
}

interface SocketTypingEvent {
    readonly username: string;
    readonly isTyping: boolean;
}

interface SessionDisconnectedEvent {
    readonly code?: string;
    readonly message?: string;
}

interface ServerToClientEvents {
    readonly 'new-message': (message: ChatMessageDto) => void;
    readonly 'message-updated': (message: ChatMessageDto) => void;
    readonly 'online-users': (users: readonly ConnectedUser[]) => void;
    readonly 'user-typing': (payload: SocketTypingEvent) => void;
    readonly 'session-disconnected': (payload: SessionDisconnectedEvent) => void;
}

interface ClientToServerEvents {
    readonly typing: (isTyping: boolean) => void;
}

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface ChatState {
    readonly messages: ChatMessage[];
    readonly currentChoirId: string | null;
    readonly connected: boolean;
    readonly socket: ChatSocket | null;
    readonly loading: boolean;
    readonly isSending: boolean;
    readonly hasMoreMessages: boolean;
    readonly onlineUsers: ConnectedUser[];
    readonly allUsers: ConnectedUser[];
    readonly typingUsers: string[];
    readonly connect: (token: string, user: User) => void;
    readonly disconnect: () => void;
    readonly sendMessage: (
        content: JSONContent,
        file?: File,
        type?: ChatAttachmentType,
        replyToId?: string,
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

const mapDirectoryUser = (user: User): ConnectedUser => ({
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

const isCurrentChatChoir = (choirId: string): boolean => (
    choirId === getActiveTenantChoirId()
    && choirId === useChatStore.getState().currentChoirId
);

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    currentChoirId: null,
    onlineUsers: [],
    allUsers: [],
    typingUsers: [],
    connected: false,
    socket: null,
    loading: false,
    isSending: false,
    hasMoreMessages: true,

    loadHistory: async () => {
        const choirId = get().currentChoirId;

        if (!choirId || choirId !== getActiveTenantChoirId()) {
            return;
        }

        set({ loading: true, hasMoreMessages: true });

        try {
            const history = await getChatHistory(50);

            if (isCurrentChatChoir(choirId)) {
                set({ messages: history.map(normalizeChatMessage) });
            }
        } finally {
            if (isCurrentChatChoir(choirId)) {
                set({ loading: false });
            }
        }
    },

    loadMoreMessages: async () => {
        const { messages, loading, currentChoirId } = get();

        if (loading || messages.length === 0 || !currentChoirId) {
            return false;
        }

        set({ loading: true });

        try {
            const oldestMessage = messages[0];
            const moreMessages = await getChatHistory(50, oldestMessage.createdAt);

            if (!isCurrentChatChoir(currentChoirId)) {
                return false;
            }

            if (moreMessages.length === 0) {
                set({ hasMoreMessages: false });
                return false;
            }

            const normalizedMessages = moreMessages.map(normalizeChatMessage);
            set((state) => ({ messages: [...normalizedMessages, ...state.messages] }));
            return true;
        } finally {
            if (isCurrentChatChoir(currentChoirId)) {
                set({ loading: false });
            }
        }
    },

    fetchDirectory: async () => {
        const choirId = get().currentChoirId;

        if (!choirId || choirId !== getActiveTenantChoirId()) {
            return;
        }

        const users = await getUserDirectory();

        if (isCurrentChatChoir(choirId)) {
            set({ allUsers: users.map(mapDirectoryUser) });
        }
    },

    connect: (token, user) => {
        const chatChoirId = resolveChatChoirId(user);

        if (!token || !chatChoirId || chatChoirId !== getActiveTenantChoirId()) {
            get().disconnect();
            return;
        }

        const state = get();

        if (state.socket?.connected && state.currentChoirId === chatChoirId) {
            return;
        }

        state.socket?.disconnect();
        set({
            messages: [],
            hasMoreMessages: true,
            currentChoirId: chatChoirId,
            onlineUsers: [],
            allUsers: [],
            typingUsers: [],
        });

        const socket: ChatSocket = io(ENV.API_ORIGIN, {
            path: '/socket.io',
            auth: buildSocketAuth(token, user),
            transports: ['websocket'],
            reconnection: true,
        });

        socket.on('connect', () => {
            if (isCurrentChatChoir(chatChoirId)) {
                set({ connected: true });
            } else {
                socket.disconnect();
            }
        });
        socket.on('disconnect', () => {
            if (get().currentChoirId === chatChoirId) {
                set({ connected: false, onlineUsers: [] });
            }
        });
        socket.on('new-message', (incoming) => {
            const message = normalizeChatMessage(incoming);

            if (
                !isCurrentChatChoir(chatChoirId)
                || (message.choirId && message.choirId !== chatChoirId)
            ) {
                return;
            }

            set((current) => ({
                messages: mergeMessage(current.messages, message),
            }));
        });
        socket.on('message-updated', (incoming) => {
            const message = normalizeChatMessage(incoming);

            if (
                !isCurrentChatChoir(chatChoirId)
                || (message.choirId && message.choirId !== chatChoirId)
            ) {
                return;
            }

            set((current) => ({
                messages: mergeMessage(current.messages, message),
            }));
        });
        socket.on('online-users', (users) => {
            if (!isCurrentChatChoir(chatChoirId)) {
                return;
            }

            const uniqueUsers = users.filter((userEntry, index, entries) => (
                entries.findIndex((candidate) => candidate.id === userEntry.id) === index
            ));
            set({ onlineUsers: [...uniqueUsers] });
        });
        socket.on('user-typing', ({ username, isTyping }) => {
            if (!isCurrentChatChoir(chatChoirId)) {
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
        socket.on('session-disconnected', () => {
            socket.disconnect();

            if (get().currentChoirId === chatChoirId) {
                set({
                    connected: false,
                    socket: null,
                    onlineUsers: [],
                    typingUsers: [],
                });
            }
        });

        set({ socket, currentChoirId: chatChoirId });
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
        const choirId = get().currentChoirId;

        if (!choirId || !isCurrentChatChoir(choirId)) {
            return;
        }

        const updatedMessage = normalizeChatMessage(
            await toggleReaction(messageId, emoji),
        );

        if (isCurrentChatChoir(choirId)) {
            set((current) => ({
                messages: mergeMessage(current.messages, updatedMessage),
            }));
        }
    },

    sendMessage: async (content, file, attachmentType, replyToId) => {
        const { socket, currentChoirId } = get();

        if (!socket?.connected || !currentChoirId || !isCurrentChatChoir(currentChoirId)) {
            throw new Error('No active chat socket connection');
        }

        set({ isSending: true });

        try {
            get().sendTyping(false);
            const upload = file && attachmentType
                ? await uploadChatMedia(file, attachmentType)
                : null;
            const sentMessage = normalizeChatMessage(await sendTextMessage({
                content,
                type: toMessageType(attachmentType),
                ...(upload ? { mediaAssetId: upload.assetId } : {}),
                ...(replyToId ? { replyToId } : {}),
            }));

            if (isCurrentChatChoir(currentChoirId)) {
                set((current) => ({
                    messages: mergeMessage(current.messages, sentMessage),
                }));
            }
        } finally {
            if (isCurrentChatChoir(currentChoirId)) {
                set({ isSending: false });
            }
        }
    },
}));
