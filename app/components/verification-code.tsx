'use client';
import {useRef} from 'react';
import s from './auth.module.css';

export default function VerificationCode({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}) {
 const inputs=useRef<(HTMLInputElement|null)[]>([]);
 function focus(index:number){inputs.current[index]?.focus();inputs.current[index]?.select();}
 function enter(index:number,text:string){
  const digits=text.replace(/\D/g,'').slice(0,6);
  if(!digits)return;
  const start=digits.length===6?0:index;
  const next=Array.from({length:6},(_,i)=>value[i]||' ');
  for(let i=0;i<digits.length&&start+i<6;i++)next[start+i]=digits[i];
  onChange(next.join('').trimEnd());
  focus(Math.min(start+digits.length,5));
 }
 return <fieldset className={s.codeFields} disabled={disabled}>
  <legend>6-digit verification code</legend>
  <div className={s.codeBoxes}>{Array.from({length:6},(_,index)=><input
   key={index} ref={element=>{inputs.current[index]=element;}}
   aria-label={`Digit ${index+1} of 6`} type="text" inputMode="numeric"
   autoComplete={index===0?'one-time-code':'off'} pattern="[0-9]" required
   value={value[index]?.trim()||''}
   onFocus={event=>event.currentTarget.select()}
   onChange={event=>{if(event.target.value)enter(index,event.target.value);else{const next=value.padEnd(6,' ').split('');next[index]=' ';onChange(next.join('').trimEnd());}}}
   onPaste={event=>{event.preventDefault();enter(index,event.clipboardData.getData('text'));}}
   onKeyDown={event=>{
    if(event.key==='Backspace'){event.preventDefault();const target=value[index]?.trim()?index:Math.max(0,index-1);const next=value.padEnd(6,' ').split('');next[target]=' ';onChange(next.join('').trimEnd());focus(target);}
    else if(event.key==='ArrowLeft'){event.preventDefault();focus(Math.max(0,index-1));}
    else if(event.key==='ArrowRight'){event.preventDefault();focus(Math.min(5,index+1));}
   }}
  />)}</div>
 </fieldset>;
}
