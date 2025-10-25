//making of rag 



import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();   

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const embeddings  = ollama.embeddings({ 
    model: 'all-minilm', 
});



