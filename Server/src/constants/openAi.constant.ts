import { PROMPT } from "./prompts.constant"

export const OPENAI_ROLES = {
    SYSTEM: "developer",
    USER: "user",
    ASSISTANT: "assistant",
    TOOLS: "tools"
}

export const OPENAI_KEY = {
    MODEL :"model",
    MESSAGES : "messages",
    TEMPERATURE : "temperature",
    MAX_TOKEN : "max_completion_tokens",
    STREAM : "stream"
}

export const OPENAI = {
    GENERAL : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    SUMMARY : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.Summary
    },
    MINDMAP : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.Mindmap
    },
    FLASHCARD : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.Flashcard
    },
    ESSAY_CHECKER : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    QUICK_TEST : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    QUICK_TEST_RESULT : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    AUDIO_TO_TEXT : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    IMAGE_TO_TEXT : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    GRAPH_ANALYSIS : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    DIAGRAM_RECOGNITION : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    STEP_BY_STEP_SOLUTION : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    SIMPLIFIED_TEXT_MODE : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
    CONCEPT_EXPLANATION : {
        model : "gpt-4o-mini",
        token : 1000,
        temperature : 0.7,
        prompt : PROMPT.General
    },
}