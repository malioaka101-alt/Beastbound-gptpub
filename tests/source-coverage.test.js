'use strict';
// This verifies that the audit actually inventories all 57 Master sections,
// references real source files and does not call the prototype feature-complete.
const A=require('node:assert/strict'),FS=require('node:fs'),Path=require('node:path');
const root=Path.join(__dirname,'..');
const m=JSON.parse(FS.readFileSync(Path.join(root,'docs/SOURCE_PARITY_MANIFEST.json'),'utf8'));
const prompt=FS.readFileSync(Path.join(root,m.authority[0]),'utf8');
A.equal(m.sections.length,57);
A.deepEqual(m.sections.map(x=>x.id),Array.from({length:57},(_,i)=>i+1));
let validations=0;
for(const section of m.sections){
 const title=prompt.match(new RegExp('^## '+section.id+'\\. (.*)$','m'))?.[1];
 A.equal(section.title,title,'Section '+section.id+' must match the actual source heading');validations++;
 A.ok(section.unfulfilled&&section.unfulfilled.length>25);
 A.ok(section.evidence.length>=1);
 for(const file of section.evidence){A.ok(!file.includes('..'));A.ok(FS.existsSync(Path.join(root,file)),`${section.id}: missing ${file}`);validations++;}
 A.ok(!/complete|full implementation/i.test(section.implementation));
}
const core=FS.readFileSync(Path.join(root,'scripts/chat-turn.js'),'utf8');
A.match(core,/Prototype automatic power training\/evolution is retired/);
const policy=FS.readFileSync(Path.join(root,'docs/PROJECT_CHAT_INSTRUCTIONS.md'),'utf8');
A.match(policy,/lived-in fantasy world first/i);
const evolution=FS.readFileSync(Path.join(root,'rules/progress.js'),'utf8');
A.match(evolution,/validateFormProfile\(r\.formProfile,r\.grade\)/);
console.log('Source section coverage audit passed: '+validations+' section/source checks plus safety contracts');