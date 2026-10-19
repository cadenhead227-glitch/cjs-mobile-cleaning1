import Link from 'next/link';
import type {Metadata} from 'next';
import {isOwner} from '@/lib/server';
import {authSettings} from '@/lib/owner-auth';
import Dashboard from './dashboard';
import OwnerLogin from './login';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Owner Dashboard',robots:{index:false,follow:false}};
export default async function Page(){if(!await isOwner())return <main className="owner-login"><span className="monogram">CJ<span>’s</span></span><p className="eyebrow">CJ’S MOBILE CLEANING · OWNER ACCESS</p><h1>Your business,<br/>protected.</h1>{authSettings()?<OwnerLogin/>:<p>Owner login must be configured before launch. Administrative access is locked.</p>}<Link href="/">Back to the website</Link></main>;return <Dashboard/>;}
