interface ChatRequest {
    requestMessage: object;
}

interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    system_fingerprint: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        logprobs?: any; // Replace `any` with the appropriate type if available
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        completion_tokens_details: {
            reasoning_tokens: number;
            accepted_prediction_tokens: number;
            rejected_prediction_tokens: number;
        };
    };
};

interface ChatCompletion {
    chat_id?: Number;
    role?: String;
    message?: String;
    used_tokens?: Number;
    reaction_status?: String;
    created_at?: Date;
    updated_at?: Date;
};


interface CalculatedUsedTokens {
    prompt_tokens?: Number;
    completion_tokens?: Number;
    total_tokens?: Number;
}

interface SavedMessages {
    questionId: number,
    responseId: number,
    response: any,
}

interface File {
    fieldname?: string,
    originalname?: string,
    encoding?: string,
    mimetype?: string,
    destination?: string,
    filename?: string,
    path?: string,
    size?: number
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

interface ParsedQuizData {
    /* data: {
    }; */
    questions: QuizQuestion[];
}

interface AudioConversation {
    role: 'user' | 'assistant';
    message: string;
}
