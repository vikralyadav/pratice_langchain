//making of rag 



import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();   


// import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
// import { MongoClient } from "mongodb";
import { OllamaEmbeddings } from "@langchain/ollama";




import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";


import { SystemMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const embeddings = new OllamaEmbeddings({
  model: "all-minilm",
});





// const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");

// const collection = client
//   .db(process.env.MONGODB_ATLAS_DB_NAME)
//   .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);



//   const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
//   collection: collection,
//   indexName: "vector_index",
//   textKey: "text",
//   embeddingKey: "embedding",
// });


import { Chroma } from "@langchain/community/vectorstores/chroma";

const vectorStore = new Chroma(embeddings, {
  collectionName: "a-test-collection",
});




const pTagSelector = "p";
const cheerioLoader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  {
    selector: pTagSelector,
  }
);

const docs = await cheerioLoader.load();




console.assert(docs.length === 1);
console.log(`Total characters: ${docs[0].pageContent.length}`);


import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const allSplits = await splitter.splitDocuments(docs);
console.log(`Split blog post into ${allSplits.length} sub-documents.`);


// await vectorStore.addDocuments(allSplits);


// console.log("Added documents to the vector store.");






import * as z from "zod";
import { tool } from "@langchain/core/tools";

const retrieveSchema = z.object({ query: z.string() });

const retrieve = tool(
  async ({ query }) => {
    console.log("retrieve tool called");
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
      )
      .join("\n");
    return [serialized, retrievedDocs];
  },
  {
    name: "retrieve", 
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);






// import { createAgent } from "langchain";

// const tools = [retrieve];
// const systemPrompt = new SystemMessage(
//     "You have access to a tool that retrieves context from a blog post. " +
//     "Use the tool to help answer user queries."
// )

// const agent = createAgent({ model: "openai:gpt-5", tools, systemPrompt });


console.log("Agent created");



import { createAgent } from "langchain";

const tools = [retrieve];

const agent = createAgent({
  model,
  tools,
  messages: [
    {
      role: "system",
      content:
        "You have access to a tool that retrieves context from a blog post. Use the tool to help answer user queries.",
    },
  ],
});

console.log("Agent created");

let inputMessage = `What is the standard method for Task Decomposition?
Once you get the answer, look up common extensions of that method.`;

let agentInputs = { messages: [{ role: "user", content: inputMessage }] };
console.log("streaming started");

const stream = await agent.stream(agentInputs, {
  streamMode: "values",
  recursionLimit: 10,
});

for await (const step of stream) {
  const lastMessage = step.messages[step.messages.length - 1];
  console.log(`[${lastMessage.role}]: ${lastMessage.content}`);
  console.log("-----\n");
}
