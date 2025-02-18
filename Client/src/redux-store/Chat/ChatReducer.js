// Third party Imports
import { createSlice } from '@reduxjs/toolkit';

const initialChatState = {
    messages: [],
    history: {},
    pagination: {},
    isLoading: false
};

const ChatSlice = createSlice({
    name: 'chat',
    initialState: initialChatState,
    reducers: {
        setMessages(state, action) {
            state.messages = action.payload
        },
        setHistory(state, action) {
            state.history = { ...state.history, ...action.payload }
        },
        setPagination(state, action) {
            state.pagination = action.payload
        },
        setLoading(state, action) {
            state.isLoading = action.payload
        },
        deleteChat(state, action) {
            Object.keys(state.history).forEach((day) => {
                state.history[day] = state.history[day].filter((chat) => chat?.chat_id !== action.payload)
            })
        },
    }
})

export const { setMessages, setHistory, setPagination, deleteChat, setLoading } = ChatSlice.actions

export default ChatSlice.reducer;