import {pipeline,env} from '@huggingface/transformers';import {MODEL,makeMessages,normalizeStory} from '../src/core.js';
env.cacheDir='/tmp/ghostlight-model-cache';env.allowLocalModels=false;
const pipe=await pipeline('text-generation',MODEL,{dtype:'q8',device:'cpu',progress_callback:p=>{if(p.status==='done'||p.status==='ready')console.log(p)}});
const output=await pipe(makeMessages({object:'A brass key',setting:'The closed bookshop',mood:'Tender'}),{max_new_tokens:220,do_sample:false,repetition_penalty:1.13,return_full_text:false});
let story=output[0].generated_text;if(Array.isArray(story))story=story.at(-1).content;console.log(normalizeStory(story));
