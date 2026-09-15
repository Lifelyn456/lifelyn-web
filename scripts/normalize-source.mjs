import {readFileSync,writeFileSync} from 'node:fs';
const path=new URL('../src/components/wallet-login.tsx',import.meta.url);
const source=readFileSync(path,'utf8');
writeFileSync(path,source.replace('signature:signed.signedMessage','signature:typeof signed.signedMessage===\'string\'?signed.signedMessage:signed.signedMessage.toString(\'base64\')'));
