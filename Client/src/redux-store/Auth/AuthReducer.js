// ** Third party Imports
import { createSlice } from '@reduxjs/toolkit';

const initialAuthState = {
    authData: {},
    isLoading: false,
    isRecording: false,
    audioBlob: null,
    responseText: '',
};

const AuthSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        onSuccessfulAuthentication(state, action) {
            state.authData = action.payload;
        },
        changeLoadingState(state, action) {
            state.isLoading = action.payload;
        },
        startRecording(state) {
            state.isRecording = true;
        },
        stopRecording(state) {
            state.isRecording = false;
        },
        setAudioBlob(state, action) {
            state.audioBlob = action.payload;
        },
        setResponseText(state, action) {
            state.responseText = action.payload;
        },

    }
});

export const {
    onSuccessfulAuthentication,
    changeLoadingState,
    onSuccessfulLogout,
    startRecording,
    stopRecording,
    setAudioBlob,
    setResponseText,
} = AuthSlice.actions;


export default AuthSlice.reducer;

export const authData = (state) => state.auth.authData;
export const isRecording = (state) => state.auth.isRecording;
export const audioBlob = (state) => state.auth.audioBlob;
export const responseText = (state) => state.auth.responseText;