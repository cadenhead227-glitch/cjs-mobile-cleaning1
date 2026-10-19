import{spawnSync}from'node:child_process';
const r=spawnSync(process.execPath,['--import','./tests/register.mjs','./tests/integration.mjs'],{stdio:'inherit'});process.exitCode=r.status??1;
