import { Home } from './site';
import { config } from '@/lib/server';
import { defaults } from '@/lib/business';
export const dynamic = 'force-dynamic';
export default async function Page(){let s=defaults;try{s=await config();}catch{}return <Home settings={s}/>;}
