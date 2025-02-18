export const START_RECORDING = 'START_RECORDING';
export const STOP_RECORDING = 'STOP_RECORDING';
export const SET_AUDIO_BLOB = 'SET_AUDIO_BLOB';
export const SET_RESPONSE_TEXT = 'SET_RESPONSE_TEXT';

export const startRecordingAction = () => ({
    type: START_RECORDING,
});

export const stopRecordingAction = () => ({
    type: STOP_RECORDING,
});

export const setAudioBlobAction = (audioBlob) => ({
    type: SET_AUDIO_BLOB,
    payload: audioBlob,
});

export const setResponseTextAction = (responseText) => ({
    type: SET_RESPONSE_TEXT,
    payload: responseText,
});
