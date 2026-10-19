import {AsyncLocalStorage} from 'node:async_hooks';
export const context=new AsyncLocalStorage();
let gate=Promise.resolve();
export async function acquire(){const previous=gate;let release;gate=new Promise(r=>{release=r;});await previous;return release;}
export async function locked(fn){const release=await acquire();try{return await fn();}finally{release();}}
export const state={database:null};
