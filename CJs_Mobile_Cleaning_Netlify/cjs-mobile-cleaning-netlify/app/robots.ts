import { siteOrigin } from '@/lib/server';
export const dynamic='force-dynamic';
export default function robots(){const origin=siteOrigin();return {rules:{userAgent:'*',allow:origin?'/':undefined,disallow:origin?['/owner','/api/','/cdn-cgi/']:['/']},...(origin?{sitemap:origin+'/sitemap.xml'}:{})};}
