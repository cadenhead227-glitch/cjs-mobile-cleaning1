import {state,locked,acquire} from './state.mjs';
export const types={setTypeParser(){}};
export class Pool{
 constructor(){ }
 async query(sql,values=[]){return locked(async()=>{const r=await state.database.query(sql,values);return {...r,rowCount:r.affectedRows??r.rows.length};});}
 async connect(){const release=await acquire();return {query:async(sql,values=[])=>{const r=await state.database.query(sql,values);return {...r,rowCount:r.affectedRows??r.rows.length};},release};}
}
