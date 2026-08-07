// src/store/admin/useChatStore.ts

import type { JSONContent } from '@tiptap/react';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
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
                set({ loading: true, hasMoreMessages: true });

                try {
                    const history = await getChatHistory(50);
                    set({ messages: history.map(normalizeChatMessage) });
                } catch (error) {
                    console.error('Failed to load chat history', error);
                    set({ messages: [] });
                } finally {
                    set({ loading: false });
                }
            },

            loadMoreMessages: async () => {
                const { messages, loading } = get();

                if (loading || messages.length === 0) {
                    return false;
                }

                set({ loading: true });

                try {
                    const oldestMessage = messages[0];
                    const moreMessages = await getChatHistory(50, oldestMessage.createdAt);

                    if (moreMessages.length === 0) {
                        set({ hasMoreMessages: false });
                        return false;
                    }

                    const normalizedMessages = moreMessages.map(normalizeChatMessage);
                    set({ messages: [...normalizedMessages, ...messages] });
                    return true;
                } catch (error) {
                    console.error('Failed to load more messages', error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            fetchDirectory: async () => {
                try {
                    const users = await getUserDirectory();
                    set({ allUsers: users.map(mapDirectoryUser) });
                } catch (error) {
                    console.error('Directory fetch failed', error);
                    set({ allUsers: [] });
                }
            },

            connect: (token, user) => {
                const chatChoirId = resolveChatChoirId(user);

                if (!token || !chatChoirId) {
                    get().disconnect();
                    return;
                }

                const state = get();

                if (state.socket?.connected && state.currentChoirId === chatChoirId) {
                    return;
                }

                state.socket?.disconnect();

                if (state.currentChoirId !== chatChoirId) {
                    set({
                        messages: [],
                        hasMoreMessages: true,
                        currentChoirId: chatChoirId,
                        onlineUsers: [],
                        typingUsers: [],
                    });
                }

                const socket: ChatSocket = io(ENV.API_ORIGIN, {
                    path: '/socket.io',
                    auth: buildSocketAuth(token, user),
                    transports: ['websocket'],
                    reconnection: true,
                });

                socket.on('connect', () => set({ connected: true }));
                socket.on('disconnect', () => set({ connected: false, onlineUsers: [] }));

                socket.on('new-message', (incoming) => {
                    const message = normalizeChatMessage(incoming);

                    if (message.choirId && message.choirId !== chatChoirId) {
                        return;
                    }

                    set((current) => ({
                        messages: mergeMessage(current.messages, message),
                    }));
                });

                socket.on('message-updated', (incoming) => {
                    const message = normalizeChatMessage(incoming);

                    if (message.choirId && message.choirId !== chatChoirId) {
                        return;
                    }

                    set((current) => ({
                        messages: mergeMessage(current.messages, message),
                    }));
                });

                socket.on('online-users', (users) => {
                    const uniqueUsers = users.filter((userEntry, index, entries) => (
                        entries.findIndex((candidate) => candidate.id === userEntry.id) === index
                    ));
                    set({ onlineUsers: [...uniqueUsers] });
                });

                socket.on('user-typing', ({ username, isTyping }) => {
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
                    set({
                        connected: false,
                        socket: null,
                        onlineUsers: [],
                        typingUsers: [],
                    });
                });

                set({ socket, currentChoirId: chatChoirId });
            },

            disconnect: () => {
                get().socket?.disconnect();
                set({
                    connected: false,
                    socket: null,
                    onlineUsers: [],
                    typingUsers: [],
                    messages: [],
                    currentChoirId: null,
                    hasMoreMessages: true,
                });
            },

            sendTyping: (isTyping) => {
                const { socket } = get();

                if (socket?.connected) {
                    socket.emit('typing', isTyping);
                }
            },

            reactToMessage: async (messageId, emoji) => {
                try {
                    const updatedMessage = normalizeChatMessage(
                        await toggleReaction(messageId, emoji),
                    );
                    set((current) => ({
                        messages: mergeMessage(current.messages, updatedMessage),
                    }));
                } catch (error) {
                    console.error('Reaction failed', error);
                }
            },

            sendMessage: async (content, file, attachmentType, replyToId) => {
                const { socket } = get();

                if (!socket?.connected) {
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

                    set((current) => ({
                        messages: mergeMessage(current.messages, sentMessage),
                    }));
                } catch (error) {
                    console.error('Send Error:', error);
                    throw error;
                } finally {
                    set({ isSending: false });
                }
            },
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                messages: state.messages,
                currentChoirId: state.currentChoirId,
            }),
        },
    ),
);
