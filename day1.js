// import * as z from "zod";

// import { createAgent, tool } from "langchain";


// const weatherTool = new tool(   ({ city }) => `It's always sunny in ${city}!`,
// {
  
//     name : "weather tool",
//     description : "get the current weather conditions for a given city",

//     schema : z.object({
//         city : z.string()
//     })


// })


// const agent = createAgent({
//   model: "anthropic:claude-sonnet-4-5",
//   tools: [weatherTool],
// });


// console.log(
//   await agent.invoke({
//     messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
//   })
// );



import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, createMiddleware } from "langchain";
import { config } from "dotenv";
config();

// Define your tools (or an empty array if none)
const tools = [];

const basicModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  temperature: 0.7,
  model: "gemini-1.5-flash",
});

const advancedModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  temperature: 0.9,
  model: "gemini-1.5-pro",
});

const dynamicModelSelection = createMiddleware({
  name: "DynamicModelSelection",
  wrapModelCall: (request, handler) => {
    const messageCount = request.messages.length;
    return handler({
      ...request,
      model: messageCount > 10 ? advancedModel : basicModel,
    });
  },
});

const agent = createAgent({
  model: basicModel, // Directly pass the model instance
  tools,
  middleware: [dynamicModelSelection],
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Hello! Tell me a fun fact." }],
});

console.log(result);
