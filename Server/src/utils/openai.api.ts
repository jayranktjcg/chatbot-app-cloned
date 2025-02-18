import openai from "@Config/openAi";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

export const MODEL = "gpt-4o-mini"
import { GENERATE_TITLE_DESCRIPTION, GET_INTENT_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from "@Constant/prompts.constant";
import { saveMessages } from "@Modules/chats/chats.service";

export const calculateUsedTokens = async (requestMessage: any, response: any) => {
    requestMessage.push({ role: "assistant", content: response })
    const finalResponse: any = await openai.chat.completions.create({
        model: MODEL,
        messages: requestMessage,
        max_completion_tokens: 1, // Smallest possible value to get the usage data
    });
    
    return {
        prompt_tokens: finalResponse.usage.prompt_tokens,
        completion_tokens: finalResponse.usage.completion_tokens,
        total_tokens: finalResponse.usage.total_tokens
    };
};


export const getIntent = async (question: string): Promise<{ content: string; total_tokens: number }> => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: GET_INTENT_SYSTEM_PROMPT,
                },
                { role: "user", content: question },
            ],
            temperature: 1,
        });

        if (response.choices?.[0]?.message?.content) {
            return {
                content: response.choices[0].message.content.trim(),
                total_tokens: response.usage?.total_tokens || 0,
            };
        } else {
            throw new Error("No valid response from OpenAI.");
        }
    } catch (error) {
        console.log("Error determining intent:", error);
        throw new Error("Failed to determine user intent.");
    }
};


type voiceType = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
export const generateAudio = async (inputText: string, model: string, voice: voiceType): Promise<any> => {
    try {
        
        const response = await openai.audio.speech.create({
            model: model,      
            voice: voice,      
            input: inputText,    
        });

        return response.body;
    } catch (error: any) {
        console.error("Error generating audio:", error.message);
        throw new Error("Failed to generate audio");
    }
};

export const generateChatCompletion = async ( model: string, systemMessage: string, userMessage: string, temperature: number, maxTokens: number = 2500): Promise<any> => {
    try {
        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            temperature,
            max_completion_tokens: maxTokens,
        });
        return response;
    } catch (error: any) {
        throw new Error(`OpenAI Chat Completion Error: ${error.message}`);
    }
};

export const generateTranscript = async (filePath: any) => {
    try {
        const audio_file = fs.createReadStream(filePath);
    
        // Step 1: Transcribe the audio using Whisper
        const response: any = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: audio_file,
        });
    
        return response;
    } catch (error: any) {
        throw new Error(`OpenAI Chat Completion Error: ${error.message}`);
    }
}
export const generateSummary = async (requestMessage: any) => {
    // const systemPrompt = `You are a summarization assistant specializing in creating concise and detailed summaries of conversations. Your task is to summarize the entire conversation provided below. The summary must:\n- Plain text \n- Retain key points, including user queries and assistant responses.\n- Focus on the main topics discussed without including redundant or irrelevant details.\n- Be in plain text and formatted as a single paragraph.\n- Provide enough detail to maintain continuity for future conversations, while being concise and token-efficient.\n- Avoid listing points or using headings; integrate all information seamlessly into a narrative.`;

    const summaryRequest: any = [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: `Here is the conversation includes previous conversation summary in this :\n${requestMessage}` },
    ];

    const response: any = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: summaryRequest,
        temperature: 1,
        max_completion_tokens: 2048,
    });


    return response;
};

export const generateTitleAndDescription = async (requestMessage: any) => {
    const summaryRequest: any = [
        { role: 'system', content: GENERATE_TITLE_DESCRIPTION },
        { role: 'user', content: requestMessage },
    ];
    /* console.log('summaryRequest :: ',summaryRequest);
    return false; */
    const response: any = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: summaryRequest,
        temperature: 1,
        max_completion_tokens: 100,
    });

    return {
        content: response?.choices[0]?.message?.content || "",
        total_tokens: response?.usage?.total_tokens || 0
    };
};
