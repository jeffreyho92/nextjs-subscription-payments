import { Document } from 'langchain/document';
// import * as fs from 'fs/promises';
// import { CustomWebLoader } from '@/utils/custom_web_loader';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Embeddings } from 'langchain/embeddings';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
// import { SupabaseVectorStore } from 'langchain/vectorstores';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabaseClient } from '@/utils/supabase-client';
// import { urls } from '@/config/notionurls';

let txt = `OpenAI Privacy Policy 1. Personal information we collect
We collect personal information relating to you (“Personal Information”) as follows:
Personal Information You Provide: We collect Personal Information if you create an account to use our Services or communicate with us as follows:
• Account Information: When you create an account with us, we will collect information associated with your account, including your name, contact information, account credentials, payment card information, and transaction history, (collectively, “Account Information”).
• User Content: When you use our Services, we collect Personal Information that is included in the input, file uploads, or feedback that you provide to our Services (“Content”).
• Communication Information: If you communicate with us, we collect your name, contact information, and the contents of any messages you send (“Communication Information”).
• Social Media Information: We have pages on social media sites like Instagram, Facebook, Medium, Twitter, YouTube and LinkedIn. When you interact with our social media pages, we will collect Personal Information that you elect to provide to us, such as your contact details (collectively, “Social Information”). In addition, the companies that host our social media pages may provide us with aggregate information and analytics about our social media activity.
`;
// let txt = `
// ChatGPT Q&A
// Commonly asked questions about ChatGPT
// Q1: What is ChatGPT?
// A1: ChatGPT is a computer program that can talk to you like a friendly and helpful person.
// Q2: How does ChatGPT work?
// A2: It uses a lot of text it learned from the internet to understand and generate human-like conversations.
// Q3: Can ChatGPT understand different topics?
// A3: Yes, it can chat about many topics because it learned from a wide range of information.
// `;
/*
Q4: Is ChatGPT like a real person?
A4: Not exactly, but it tries its best to understand and respond like a real person would.
Q5: Where can I find ChatGPT?
A5: You might find it on websites, apps, or platforms that use it for talking to users.
Q6: Can ChatGPT help me with information?
A6: Yes, it can provide information on various topics based on what it learned.
Q7: Does ChatGPT have feelings?
A7: No, it doesn't have feelings. It processes text to give responses, but it doesn't feel emotions.
Q8: Can I have a conversation with ChatGPT anytime?
A8: Yes, if the platform it's on is available, you can chat with it whenever you want.
Q9: Does ChatGPT learn from our conversations?
A9: ChatGPT doesn't remember specific conversations, but it learns from the text it was trained on.
Q10: Is ChatGPT always accurate?
A10: It tries its best, but it might make mistakes or give incorrect information sometimes.
Remember, while ChatGPT is designed to be helpful, it's always a good idea to verify important information from reliable sources!
*/

// async function extractDataFromUrl(url: string): Promise<Document[]> {
//   try {
//     const loader = new CustomWebLoader(url);
//     const docs = await loader.load();
//     return docs;
//   } catch (error) {
//     console.error(`Error while extracting data from ${url}: ${error}`);
//     return [];
//   }
// }

// async function extractDataFromUrls(urls: string[]): Promise<Document[]> {
//   console.log('extracting data from urls...');
//   const documents: Document[] = [];
//   for (const url of urls) {
//     const docs = await extractDataFromUrl(url);
//     documents.push(...docs);
//   }
//   console.log('data extracted from urls');
//   const json = JSON.stringify(documents);
//   await fs.writeFile('franknotion.json', json);
//   console.log('json file containing data saved on disk');
//   return documents;
// }

async function embedDocuments(
  client: SupabaseClient,
  docs: Document[],
  embeddings: Embeddings,
) {
  console.log('creating embeddings...');
  // await SupabaseVectorStore.fromDocuments(client, docs, embeddings);
  await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client, 
    tableName: "documents",
    queryName: "match_documents",
  });
  console.log('embeddings successfully stored in supabase');
}

async function splitDocsIntoChunks(text: string[]): Promise<Document[]> {
// async function splitDocsIntoChunks(docs: [string]): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    // chunkSize: 1000,
    // chunkOverlap: 200,
    chunkSize: 200,
    chunkOverlap: 20,
  });
  const metadatas = [{file_id:'11d80e53-7d0c-4b72-97f7-6670acf1664e'}];
  // return await textSplitter.splitDocuments(docs);
  return await textSplitter.createDocuments(text, metadatas);
}

// (async function run() {
//   try {
//     const rawDocs: Document[] = [];
//     rawDocs.push(...txt);
//     //split docs into chunks for openai context window
//     const docs = await splitDocsIntoChunks(rawDocs);
//     //embed docs into supabase
//     await embedDocuments(supabaseClient, docs, new OpenAIEmbeddings());
//   } catch (error) {
//     console.log('error occured:', error);
//   }
// })();

export default async function run() {
  try {
    const rawText: string[] = [txt];
    // const rawText: [string] = [txt];
    // console.log('rawText',rawText)
    // rawText.push(...txt);
    //split docs into chunks for openai context window
    const docs = await splitDocsIntoChunks(rawText);
    // console.log('docs',docs)
    //embed docs into supabase
    await embedDocuments(supabaseClient, docs, new OpenAIEmbeddings({modelName: "text-embedding-ada-002"}));
  } catch (error: unknown) {
    console.log('Embedding error', error);
  }
};