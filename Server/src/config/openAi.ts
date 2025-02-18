import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string, // Ensure this is set in your environment variables
});

export default openai;