import type { Metadata } from 'next';
import { siteOrigin } from '@/lib/server';
import { brand } from '@/lib/business';
import './globals.css';
export async function generateMetadata():Promise<Metadata>{const origin=siteOrigin();return {
 ...(origin?{metadataBase:new URL(origin),alternates:{canonical:origin}}:{}),
 title:{default:`${brand} | Mobile Car Cleaning Phoenix`,template:`%s | ${brand}`},
 description:'Convenient mobile exterior car cleaning in South Phoenix and South Mountain. A careful hand wash delivered to your driveway.',
 openGraph:{title:brand,description:'A cleaner car. Without leaving home. Mobile exterior car cleaning in Phoenix.',type:'website',...(origin?{url:origin,images:[{url:origin+'/caden-washing-1440.webp',width:1440,height:810,alt:'Caden washing a dark-colored car in a residential driveway'}]}:{})},
 twitter:{card:'summary_large_image',title:brand,description:'Mobile exterior car cleaning in Phoenix.'},
 icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},manifest:'/manifest.webmanifest',
};}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
