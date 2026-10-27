'use client';
import {useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {BrandLogo} from '../components/brand';
import {authRequest} from '../components/auth-client';
import {BrandLoader} from '../components/brand-loader';

const card:React.CSSProperties={maxWidth:520,margin:'60px auto',padding:'36px 32px',background:'#fff',border:'1px solid #e7ebe8',borderRadius:20,boxShadow:'0 24px 60px -30px rgba(3,16,22,.35)',textAlign:'center'};
const primary:React.CSSProperties={display:'inline-block',width:'100%',padding:'14px 20px',marginTop:22,background:'#b4ef42',color:'#11241a',border:0,borderRadius:999,fontWeight:600,fontSize:14,cursor:'pointer',textDecoration:'none'};
const field:React.CSSProperties={display:'block',width:'100%',padding:12,margin:'10px 0',border:'1px solid #d8dfda',borderRadius:8};
const codeField:React.CSSProperties={...field,textAlign:'center',fontSize:26,letterSpacing:10,fontWeight:700,fontFamily:'Consolas,Menlo,monospace'};
const chip:React.CSSProperties={display:'inline-block',background:'#eefadf',color:'#3d7a17',borderRadius:999,padding:'6px 12px',fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase'};
const copy:React.CSSProperties={color:'#5d6b64',lineHeight:1.7};
const secondary:React.CSSProperties={padding:'12px 18px',background:'#f0f3f6',border:0,borderRadius:8,cursor:'pointer'};
function subscribe(callback:()=>void){window.addEventListener('popstate',callback);return()=>window.removeEventListener('popstate',callback);}
function readEmail(){return new URLSearchParams(window.location.search).get('email')||'';}

export default function VerifyEmail(){
 // Signup links here with ?email=…, so the address is prefilled without an effect.
 const fromUrl=useSyncExternalStore(subscribe,readEmail,()=>'');
 const [typedEmail,setTypedEmail]=useState('');
 const email=typedEmail||fromUrl;
 const [code,setCode]=useState('');
 const [verifying,setVerifying]=useState(false);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [verified,setVerified]=useState('');
 async function verify(e:React.FormEvent){
  e.preventDefault();setVerifying(true);setError('');
  try{
   const result=await authRequest<{message:string;email:string}>('verify-email',{code});
   setVerified(result.email);setMessage(result.message);
   window.history.replaceState(null,'',window.location.pathname);
  }catch(e){setError(e instanceof Error?e.message:'Verification failed. Request a new code.');}
  finally{setVerifying(false);}
 }
 async function resend(){
  setSending(true);setError('');
  try{const result=await authRequest<{message:string}>('resend-verification',{email});setMessage(result.message);}
  catch(e){setError(e instanceof Error?e.message:'Unable to send a new code. Please try again.');}
  finally{setSending(false);}
 }
 if(verifying)return <main aria-busy="true"><BrandLoader label="Confirming your email…"/></main>;
 const status=<><p role="status" style={{marginTop:16,color:'#33774d',fontSize:13}}>{message}</p><p role="alert" style={{marginTop:16,color:'#b52f3b',fontSize:13}}>{error}</p></>;
 return <main style={{padding:'40px 16px'}}><div style={card}>
  <div style={{display:'flex',justifyContent:'center',marginBottom:18}}><BrandLogo/></div>
  {verified?<>
   <span style={chip}>Email verified</span>
   <h1 style={{fontSize:24,margin:'14px 0 10px'}}>Your email is verified</h1>
   <p style={copy}>{message} {verified} can now sign in and shop on Barwaqt.</p>
   <Link href="/" style={primary}>START SHOPPING</Link>
  </>:<>
   <span style={chip}>Signup verification</span>
   <h1 style={{fontSize:24,margin:'14px 0 10px'}}>Confirm your email address</h1>
   <p style={copy}>Enter the 6-digit code we emailed{email?<> to <b>{email}</b></>:<> you</>}. The code is single-use and expires in 15 minutes.</p>
   <form onSubmit={verify}>
    <label style={{display:'block',marginTop:20,textAlign:'left',fontSize:12}}>Verification code
     <input aria-label="6-digit verification code" style={codeField} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000"/>
    </label>
    <button type="submit" style={primary} disabled={code.length!==6}>VERIFY MY EMAIL</button>
   </form>
   <div style={{marginTop:26,paddingTop:20,borderTop:'1px solid #eef2f6',textAlign:'left'}}>
    <p style={{...copy,fontSize:13}}>Didn&apos;t get a code? Send a new one to the address you signed up with.</p>
    <label style={{display:'block',fontSize:12}}>Email address<input style={field} type="email" required value={email} onChange={e=>setTypedEmail(e.target.value)} placeholder="you@example.com"/></label>
    <button type="button" style={secondary} disabled={sending||!email} onClick={()=>void resend()}>{sending?'SENDING…':'SEND NEW CODE'}</button>
   </div>
  </>}
  {status}
  <Link href="/" style={{display:'block',marginTop:20,fontSize:13}}>Back to the store →</Link>
 </div></main>;
}
