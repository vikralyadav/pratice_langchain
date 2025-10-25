//making of rag 



import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();   


// import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
// import { MongoClient } from "mongodb";
import ollama from 'ollama'


import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const embeddings  = ollama.embeddings({ 
    model: 'all-minilm', 
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



