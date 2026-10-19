import {readFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
export async function resolve(specifier,context,next){if(specifier==='pg')return {url:new URL('./pg.mjs',import.meta.url).href,shortCircuit:true};if(specifier==='next/headers')return {url:new URL('./headers.mjs',import.meta.url).href,shortCircuit:true};if(specifier.startsWith('@/'))specifier=new URL(specifier.slice(2)+'.ts',root).href;else if(specifier.startsWith('.')&&context.parentURL?.endsWith('.ts')&&!/\.[a-z]+$/.test(specifier))specifier+='.ts';return next(specifier,context);}
export async function load(url,context,next){if(url.endsWith('.ts'))return {format:'module',source:ts.transpileModule(await readFile(new URL(url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText,shortCircuit:true};return next(url,context);}
