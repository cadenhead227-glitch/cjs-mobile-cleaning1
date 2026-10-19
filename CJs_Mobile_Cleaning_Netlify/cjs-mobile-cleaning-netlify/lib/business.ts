export const brand = 'CJ’s Mobile Cleaning';
export const defaults = { phone: '', email: '', sedanPrice: 80, suvPrice: 100, largePrice: 120, areas: 'South Phoenix, South Mountain', hours: 'By appointment', exteriorSedanPrice:60, exteriorSuvPrice:70, exteriorLargePrice:85, exteriorApproved:false, intro: 'Two local owners. One careful clean.', about: 'We’re Caden and a friend, building a local mobile car-cleaning business around careful work, straightforward pricing, and respect for your time.', faq: [
{q:'What do I need to provide?',a:'A working water tap and grounded electrical outlet within reach, safe parking, and permission to wash there. Tell us about any property restrictions before booking.'},
{q:'What is included?',a:'A pre-rinse, foam application, gentle microfiber hand wash, wheels and tires, tire dressing, exterior glass, and microfiber drying.'},
{q:'Do you offer interiors or coatings?',a:'We are starting with exterior cleaning. Interior cleaning, paint correction, polishing, and ceramic coating are not currently offered.'},
{q:'What about a very dirty vehicle?',a:'Excessive mud or contamination may require an adjusted quote or work outside our scope. We agree any change with you before starting.'},
{q:'How long should I allow?',a:'We reserve a two-hour window. Actual cleaning time depends on vehicle size and condition. All times use America/Phoenix.'},
{q:'How should I prepare?',a:'Arrange safe parking, water, electricity, and property permission. We may reschedule for unsafe heat, weather, or unsuitable access.'} ] };
export type Settings = typeof defaults;
export const formatTime = (iso: string) => new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',hour:'numeric',minute:'2-digit'}).format(new Date(iso));
export const formatDate = (iso: string) => new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',weekday:'short',month:'short',day:'numeric'}).format(new Date(iso));
export const vehicleTypes=['Sedan / coupe','Small SUV / crossover','Large SUV / truck'];
export const exteriorIncluded=['Exterior pre-rinse','Foam cannon application','Gentle microfiber hand wash','Wheels and tires cleaned','Tire dressing','Exterior glass cleaning','Microfiber hand drying'];
export const serviceCatalog=[{id:'exterior',name:'Exterior cleaning',enabled:true},{id:'interior',name:'Interior cleaning',enabled:false}];
export const routes=['/','/exterior-cleaning','/pricing','/results','/service-area','/about','/book','/guides','/privacy','/service-policies'];
