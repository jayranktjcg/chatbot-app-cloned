// Third-party Imports
import { createSlice } from '@reduxjs/toolkit';

const initialDirectoryState = {
    directories: [],
    modalDirectories: [],
    isLoading: false
};

const DirectorySlice = createSlice({
    name: 'directory',
    initialState: initialDirectoryState,
    reducers: {
        setDirectories(state, action) {
            state.directories = action.payload?.data || [];
        },      
        setModalDirectories(state, action) {
            state.directories = action.payload?.data || [];
        },      
        addDirectory(state, action) {
            state.directories.push(action.payload);
        },
        updateDirectory(state, action) {
            const index = state.directories.findIndex(dir => dir.id === action.payload.id);
            if (index !== -1) {
                state.directories[index] = { ...state.directories[index], ...action.payload };
            }
        },
        removeDirectory(state, action) {
            state.directories = state.directories.filter((dir) => dir.id !== action.payload);
        },      
        setLoading(state, action) {
            state.isLoading = action.payload;
        }
    }
});

export const { setDirectories, setModalDirectories, addDirectory, updateDirectory, removeDirectory, setLoading } = DirectorySlice.actions;

export default DirectorySlice.reducer;
