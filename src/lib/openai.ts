import OpenAI from 'openai'
import { observeOpenAI,Langfuse } from "langfuse";

const setUpLangFuse=()=>{
    const langfuse = new Langfuse();
 
    const trace = langfuse.trace({
      name: "LLM-Playground",
    });
}
export const openaiInstance =()=>{
    return new OpenAI()
}