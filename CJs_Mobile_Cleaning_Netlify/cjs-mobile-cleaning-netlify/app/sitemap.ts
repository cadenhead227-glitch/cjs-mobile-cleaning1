import { routes } from '@/lib/business';
import { siteOrigin } from '@/lib/server';
export const dynamic='force-dynamic';
export default function sitemap(){const origin=siteOrigin();return origin?routes.filter(x=>!['/privacy','/service-policies'].includes(x)).map(path=>({url:origin+path,changeFrequency:'monthly' as const,priority:path==='/'?1:0.7})):[];}
