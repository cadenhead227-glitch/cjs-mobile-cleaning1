import type { Metadata } from 'next';
import { config } from '@/lib/server';
import { defaults } from '@/lib/business';
import { Shell,PageIntro } from '../site';
import BookingForm from './booking-form';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Book Mobile Exterior Cleaning in Phoenix',description:'Choose an available Phoenix-time appointment or request a quote for mobile exterior cleaning.',alternates:{canonical:'/book'}};
export default async function Page(){let s=defaults;try{s=await config();}catch{}return <Shell settings={s}><PageIntro tag="YOUR FRESH START" title="Let’s find your time.">Choose an open appointment or send a quote request. All times are in Phoenix, Arizona.</PageIntro><BookingForm initialSettings={s}/></Shell>}
