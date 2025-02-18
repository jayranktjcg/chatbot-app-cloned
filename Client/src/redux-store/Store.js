// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit';

// ** Slice Import
import AuthSlice from './Auth/AuthReducer';
import ChatSlice from './Chat/ChatReducer';
import DirectorySlice from './Directory/DirectoryReducer'

export const store = configureStore({
    reducer: {
        auth: AuthSlice,
        chat: ChatSlice,
        directory: DirectorySlice,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({ serializableCheck: false })
});
