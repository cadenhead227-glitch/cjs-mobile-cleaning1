import { Pool, types, type QueryResultRow } from 'pg';
types.setTypeParser(20, Number);
export type Executor={query:(sql:string,values?:unknown[])=>Promise<{rows:QueryResultRow[];rowCount?:number|null}>};
// Retain parameter binding and the original query contract while using real Postgres transactions.
export function postgresSQL(sql:string){let index=0;return sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|\?|\bIS\s+NOT\s+(?=\?)|\bend\b/gi,(match)=>{
 if(match.startsWith("'")||match.startsWith('"'))return match;
 if(match==='?')return '$'+(++index);
 if(/^IS\s+NOT/i.test(match))return 'IS DISTINCT FROM ';
 return '"end"';
});}
class Statement {
 constructor(readonly db:Database,readonly sql:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.db,this.sql,values);}
 async execute(executor:Executor=this.db.executor){const result=await executor.query(postgresSQL(this.sql),this.values);return {results:result.rows,meta:{changes:result.rowCount??result.rows.length}};}
 async first<T=Record<string,unknown>>(){return (await this.execute()).results[0] as T|undefined??null;}
 async all<T=Record<string,unknown>>(){const result=await this.execute();return {...result,results:result.results as T[]};}
 run(){return this.execute();}
}
export class Database {
 constructor(readonly executor:Executor,private pool?:Pool){ }
 prepare(sql:string){return new Statement(this,sql);}
 async batch(statements:Statement[]){const client=this.pool?await this.pool.connect():null;const executor=client||this.executor;
  try{await executor.query('BEGIN');const results=[];for(const statement of statements)results.push(await statement.execute(executor));await executor.query('COMMIT');return results;}
  catch(error){await executor.query('ROLLBACK');throw error;}finally{client?.release();}
 }
}
let pool:Pool|undefined,db:Database|undefined;
export function database(){if(db)return db;const value=process.env.DATABASE_URL;if(!value)throw new Error('Storage is unavailable.');
 const connection=new URL(value);if(!['postgres:','postgresql:'].includes(connection.protocol))throw new Error('Invalid database configuration.');
 for(const name of ['sslmode','sslcert','sslkey','sslrootcert'])connection.searchParams.delete(name);
 pool=new Pool({connectionString:connection.toString(),max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:10000,allowExitOnIdle:true,ssl:{rejectUnauthorized:true,...(process.env.DATABASE_CA_CERT?{ca:process.env.DATABASE_CA_CERT.replace(/\\n/g,'\n')}:{})}});
 db=new Database(pool as unknown as Executor,pool);return db;
}
