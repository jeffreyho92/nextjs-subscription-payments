import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types_db'
import { supabaseClient } from '@/utils/supabase-client';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { codeBlock, oneLine } from 'common-tags';

import { Document } from 'langchain/document';
import { OpenAIModerationChain, LLMChain } from "langchain/chains";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseHybridSearch,  } from "langchain/retrievers/supabase";
import {
  SupabaseFilterRPCCall,
  SupabaseVectorStore,
} from "langchain/vectorstores/supabase";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";

const modelNameChat = "gpt-3.5-turbo";
const modelNameEmbedding = "text-embedding-ada-002";
const temperature = 0;
const defaultAIMessage = "Sorry, I don't know how to help with that.";

// export async function GET(req: NextRequest, res: NextApiResponse) {
// export async function GET() {
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseClient.storage.from('workspaces').download('f4c812ac-5af5-411e-9ec2-4c80b202cddc/11d80e53-7d0c-4b72-97f7-6670acf1664e')
  console.log('data', data);
  console.log('error', error);

  let question = body?.question;
  let workspace_id = body?.workspace_id;
  console.log('question', question)
  if(!question || !workspace_id){
    return NextResponse.json({ success: false, error: "params missing" }, { status: 400 });
  }else{
    // OpenAI recommends replacing newlines with spaces for best results
    question = question.replace(/\n/g, ' ');
  }

  workspace_id = "f4c812ac-5af5-411e-9ec2-4c80b202cddc";
  question = "ChatGPT understand different topics";
  // question = "I will kill you ";
  question = question.trim();

  let streaming = (body?.streaming === true) || false;
  console.log('streaming', streaming)

  var checkModerationResult: string = await checkModeration(question);
  if(checkModerationResult){
    return NextResponse.json({ success: false, error: checkModerationResult }, { status: 400 });
  }

  //get file_id from workspace_id
  var files = await getFilesByWorkspace_id(workspace_id);
  console.log('files', files)
  // const metadata = {"file_id":"d1848e4e-0da3-4c9e-bf76-e1cef882e72e"};
  // const files = ["d1848e4e-0da3-4c9e-bf76-e1cef882e72e", "11d80e53-7d0c-4b72-97f7-6670acf1664e"];
  let contextText = "";
  const arrRelevant = await findRelevantDocuments(question, files);
  // const arrRelevant = [<Document>{
  //   pageContent: 'work? A2: It uses a lot of text it learned from the internet to understand and generate human-like conversations. Q3: Can ChatGPT understand different topics? A3: Yes, it can chat about many topics',
  //   // metadata: { loc: [Object] }
  // }];
  console.log(arrRelevant);
  if(arrRelevant.length > 0){
    contextText = generateContext(arrRelevant);
  }

  if(!contextText){
    return NextResponse.json({ response: { text: defaultAIMessage } });
  }

  const prompt = generatePrompt();
  const promptInput = {
    context: contextText,
    question,
  };
  console.log('promptInput', promptInput);

  // const supabase = createRouteHandlerClient<Database>({cookies});
  // const {
  //   data: { user }
  // } = await supabase.auth.getUser();
  // console.log('user', user)

  // //mock response
  // return NextResponse.json({ response: { text: "This is a response from AI!" } });

  //mock stream
  return mockStreamResponse();

  if (streaming) {
    // For a streaming response we need to use a TransformStream to
    // convert the LLM's callback-based API into a stream-based API.
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const llm = new ChatOpenAI({
      modelName: modelNameChat,
      temperature,
      streaming,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: async (token) => {
          await writer.ready;
          await writer.write(encoder.encode(`data: ${token}\n\n`));
        },
        handleLLMEnd: async () => {
          await writer.ready;
          await writer.close();
        },
        handleLLMError: async (e) => {
          await writer.ready;
          await writer.abort(e);
        },
      }),
    });
    const chain = new LLMChain({ prompt, llm });
    // We don't need to await the result of the chain.run() call because
    // the LLM will invoke the callbackManager's handleLLMEnd() method
    chain.call(promptInput).catch((e) => console.error(e));

    return new Response(stream.readable, {
      // headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      headers: { "Content-Type": "text/event-stream" },
    });
  } else {
    // For a non-streaming response we can just await the result of the
    // chain.run() call and return it.
    const llm = new ChatOpenAI({ modelName: modelNameChat, temperature });
    const chain = new LLMChain({ prompt, llm });
    const response = await chain.call(promptInput);

    // return new Response(JSON.stringify(response), {
    //   // headers: { ...corsHeaders, "Content-Type": "application/json" },
    //   headers: { "Content-Type": "application/json" },
    // });
    return NextResponse.json({ response });
  }
}

const mockStreamResponse = () => {
  const iterator = makeIterator()
  const stream = iteratorToStream(iterator)
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
  function iteratorToStream(iterator: any) {
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await iterator.next()
  
        if (done) {
          controller.close()
        } else {
          controller.enqueue(value)
        }
      },
    })
  }
  
  function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  async function* makeIterator() {
    const encoder = new TextEncoder()
    for (let i = 0; i < 10; i++) {
      yield encoder.encode(`data: ${i}\n\n`); 
      await sleep(500)
    }
  }
}

const generatePrompt = () => {
  // const template = "You are a helpful assistant that translates {input_language} to {output_language}.";
  const template = codeBlock`
    ${oneLine`
      You are a very friendly customer service who loves
      to help people! Answer the question based on the context below.
      If you are unsure and the answer is not explicitly written in the context,
      say ${defaultAIMessage}
    `}
    Context:
    {context}
  `;
  /*
    Question: """
    {question}
    """
  */
  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(template);
  const humanTemplate = "{question}";
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(humanTemplate);
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
  // const prompt = await chatPrompt.formatMessages({
  //   context: contextText,
  //   question,
  // });
  // console.log('prompt', prompt);
  return chatPrompt;
}
  
const generateContext = (arrRelevant: Document[]): string => {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  let tokenCount = 0
  let contextText = ''
  
  for (let i = 0; i < arrRelevant.length; i++) {
    const pageSection = arrRelevant[i]
    const content = pageSection.pageContent
    const encoded = tokenizer.encode(content)
    tokenCount += encoded.text.length
  
    if (tokenCount >= 1500) {
      break
    }
  
    contextText += `${content.trim()}\n---\n`
  }

  return contextText;
}

const findRelevantDocuments = async (question: string, files: string[]): Promise<Document[]> => {
  const embeddings = new OpenAIEmbeddings({modelName: modelNameEmbedding});
  // const retriever = new SupabaseHybridSearch(embeddings, {
  //   client: supabaseClient,
  //   //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
  //   similarityK: 2,
  //   keywordK: 2,
  //   tableName: "documents",
  //   similarityQueryName: "match_documents",
  //   // keywordQueryName: "kw_match_documents",
  //   metadata,
  // });
  // const results = await retriever.getRelevantDocuments(question);

  let filterFile = files.join('","');
  filterFile = `("${filterFile}")`;
  console.log('filterFile', filterFile)

  const funcFilter: SupabaseFilterRPCCall = (rpc) =>
  rpc
    // .filter("metadata->>file_id", "eq", '("11d80e53-7d0c-4b72-97f7-6670acf1664e","d1848e4e-0da3-4c9e-bf76-e1cef882e72e")');
    .filter("metadata->>file_id", "in", filterFile);
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    // filter: metadata,
    filter: funcFilter,
  });
  const match_count = 2;
  const results = await vectorStore.similaritySearch(question, match_count);

  // const funcFilterA: SupabaseFilterRPCCall = (rpc) =>
  // rpc
  //   .filter("metadata->b::int", "lt", 3)
  //   .filter("metadata->c::int", "gt", 7)
  //   .textSearch("content", `'multidimensional' & 'spaces'`, {
  //     config: "english",
  //   });

  // const results = await retriever.similaritySearch("quantum", 4, funcFilterA);

  return results;
}

// type File = Database['public']['Tables']['files']['Row'];
const getFilesByWorkspace_id = async (workspace_id: string): Promise<string[]> => {
  console.log('workspace_id', workspace_id)
  let { data: files, error } = await supabaseClient
  .from('files')
  .select('id')
  .eq('workspace_id', workspace_id)
  .is('deleted_at', null);

  if(error) console.log('error', error);

  var result = [];
  if(files){
    result = files.map((item)=> {  return item.id; });
  }

  return result;
}

const checkModeration = async (text: string): Promise<string> => {
  var result = false;
  var msg = "Detected dangerous, hateful, or violent content!";
  try {
    // Moderate the content to comply with OpenAI T&C
    const moderation = new OpenAIModerationChain({
      throwError: false, // If set to true, the call will throw an error when the moderation chain detects violating content. If set to false, violating content will return "Text was found that violates OpenAI's content policy.".
    });
    const { output: badResult } = await moderation.call({
      input: text,
    });
    if(badResult != text){
      console.log('checkModeration badResult', badResult);
      msg = badResult;
      result = true;
    }
  } catch (error: unknown) {
    console.log('checkModeration error', error)
    result = true;
  }

  if(result){
    return msg;
  }else{
    return "";
  }
}
