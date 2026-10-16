'use client';
import {useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {BrandLogo} from '../components/brand';
import {authRequest} from '../components/auth-client';
import {BrandLoader} from '../components/brand-loader';

function subscribe(callback:()=>void){window.addEventListener('hashchange',callback);return()=>window.removeEventListener('hashchange',callback);}
function readToken(){return new URLSearchParams(window.location.hash.slice(1)).get('token')||'';}
const card:React.CSSProperties={maxWidth:520,margin:'60px auto',padding:'36px 32px',background:'#fff',border:'1px solid #e7ebe8',borderRadius:20,boxShadow:'0 24px 60px -30px rgba(3,16,22,.35)',textAlign:'center'};
const primary:React.CSSProperties={display:'inline-block',width:'100%',padding:'14px 20px',marginTop:22,background:'#b4ef42',color:'#11241a',border:0,borderRadius:999,fontWeight:600,fontSize:14,cursor:'pointer',textDecoration:'none'};
const field:React.CSSProperties={display:'block',width:'100%',padding:12,margin:'10px 0',border:'1px solid #d8dfda',borderRadius:8};
const chip:React.CSSProperties={display:'inline-block',background:'#eefadf',color:'#3d7a17',borderRadius:999,padding:'6px 12px',fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase'};
const copy:React.CSSProperties={color:'#5d6b64',lineHeight:1.7};

export default function VerifyEmail(){
 const token=useSyncExternalStore(subscribe,readToken,()=>'');
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [verified,setVerified]=useState('');
 async function verify(){
  setBusy(true);setError('');
  try{
   const result=await authRequest<{message:string;email:string}>('verify-email',{token});
   setVerified(result.email);setMessage(result.message);
   window.history.replaceState(null,'',window.location.pathname);
  }catch(e){setError(e instanceof Error?e.message:'Verification failed. Request a new link.');}
  finally{setBusy(false);}
 }
 async function resend(){
  setBusy(true);setError('');
  try{const result=await authRequest<{message:string}>('resend-verification',{email});setMessage(result.message);}
  catch(e){setError(e instanceof Error?e.message:'Unable to send the verification email. Please try again.');}
  finally{setBusy(false);}
 }
 if(busy)return <main aria-busy="true"><BrandLoader label="Confirming your email…"/></main>;
 const status=<><p role="status" style={{marginTop:16,color:'#33774d',fontSize:13}}>{message}</p><p role="alert" style={{marginTop:16,color:'#b52f3b',fontSize:13}}>{error}</p></>;
 return <main style={{padding:'40px 16px'}}><div style={card}>
  <div style={{display:'flex',justifyContent:'center',marginBottom:18}}><BrandLogo/></div>
  {verified?<>
   <span style={chip}>Email verified</span>
   <h1 style={{fontSize:24,margin:'14px 0 10px'}}>Your email is verified</h1>
   <p style={copy}>{message} {verified} can now sign in and shop on Barwaqt.</p>
   <Link href="/" style={primary}>START SHOPPING</Link>
  </>:token?<>
   <span style={chip}>Signup verification</span>
   <h1 style={{fontSize:24,margin:'14px 0 10px'}}>Confirm your email address</h1>
   <p style={copy}>Open your Barwaqt verification email and confirm this address to activate your account.</p>
   <button type="button" style={primary} disabled={busy} onClick={()=>void verify()}>VERIFY MY EMAIL</button>
   {error&&<div style={{marginTop:22,textAlign:'left'}}><label style={{display:'block',fontSize:12}}>Send a new link to<input style={field} type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><button type="button" style={{padding:'12px 18px',background:'#f0f3f6',border:0,borderRadius:8,cursor:'pointer'}} disabled={!email} onClick={()=>void resend()}>RESEND VERIFICATION LINK</button></div>}
  </>:<>
   <span style={chip}>Link incomplete</span>
   <h1 style={{fontSize:24,margin:'14px 0 10px'}}>We could not find a verification token</h1>
   <p style={copy}>This page needs the link from your Barwaqt verification email. Enter your email and we will send a fresh link.</p>
   <label style={{display:'block',marginTop:20,textAlign:'left',fontSize:12}}>Email address<input style={field} type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
   <button type="button" style={primary} disabled={busy||!email} onClick={()=>void resend()}>SEND NEW LINK</button>
  </>}
  {status}
  <Link href="/" style={{display:'block',marginTop:20,fontSize:13}}>Back to the store →</Link>
 </div></main>;
}
