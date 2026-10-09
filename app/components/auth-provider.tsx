"use client";

import { BrandLogo } from "./brand";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import s from "./auth.module.css";

type Mode = "login" | "signup";
type Step = "identity" | "otp" | "password" | "account" | "privacy" | "profile" | "existing";
export type CustomerDetails = { first: string; last: string; phone: string; birthday: string; gender: string; nationality: string; tourist: string };
const blankProfile: CustomerDetails = { first: "", last: "", phone: "", birthday: "", gender: "", nationality: "", tourist: "" };
const AuthContext = createContext<{ open: () => void; signedIn: boolean; identity: string; profile: CustomerDetails; saveProfile: (value: CustomerDetails) => void; signOut: () => void }>({ open: () => {}, signedIn: false, identity: "", profile: blankProfile, saveProfile: () => {}, signOut: () => {} });
export function useAccount() { return useContext(AuthContext); }
const DEMO_CODE = "123456";
function validIdentity(value: string, mode: Mode) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || (mode === "login" && /^\+?[0-9]{9,15}$/.test(value.replace(/[\s()-]/g, "")));
}
function maskIdentity(value: string) {
  if (!value.includes("@")) return `${value.slice(0,3)}••••${value.slice(-3)}`;
  const [name,domain] = value.split("@");
  return `${name.slice(0,2)}•••@${domain}`;
}
export function AuthButton() {
  const { open, signedIn } = useContext(AuthContext);
  const router = useRouter();
  return <button className={s.trigger} onClick={() => signedIn ? router.push("/profile") : open()} aria-label={signedIn ? "My demo account" : "Log in"}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M5 19c1-6 13-6 14 0"/></svg><span>{signedIn ? "My account" : "Log in"}</span></button>;
}
export default function AuthProvider({children}:{children:ReactNode}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const otpFields = useRef<(HTMLInputElement|null)[]>([]);
  const [mode,setMode] = useState<Mode>("login");
  const [step,setStep] = useState<Step>("identity");
  const [returnStep,setReturnStep] = useState<Step>("identity");
  const [identity,setIdentity] = useState("");
  const [consent,setConsent] = useState(false);
  const [digits,setDigits] = useState<string[]>(Array(6).fill(""));
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [remaining,setRemaining] = useState(0);
  const [expiresAt,setExpiresAt] = useState(0);
  const [signedIn,setSignedIn] = useState(false);
  const [knownAccounts,setKnownAccounts] = useState<string[]>([]);
  const [firstName,setFirstName] = useState("");
  const [lastName,setLastName] = useState("");
  const [profileCity,setProfileCity] = useState("");
  const [profileError,setProfileError] = useState("");
  const [profile,saveProfile] = useState<CustomerDetails>(blankProfile);
  function signOut() { setSignedIn(false);setIdentity("");setConsent(false);setPassword("");setDigits(Array(6).fill(""));saveProfile(blankProfile);setStep("identity");setMode("login"); }
  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setRemaining(Math.max(0,Math.ceil((expiresAt-Date.now())/1000))),1000);
    return () => window.clearInterval(timer);
  },[step,expiresAt]);
  useEffect(() => {
    if (!dialog.current?.open) return;
    if (step === "otp") otpFields.current[0]?.focus();
    if (step === "identity") firstField.current?.focus();
  },[step]);
  function open() {
    setStep(signedIn ? "account" : "identity");setError("");setNotice("");setPassword("");setDigits(Array(6).fill(""));
    dialog.current?.showModal();
    if (!signedIn) requestAnimationFrame(() => firstField.current?.focus());
  }
  function close() { dialog.current?.close();setPassword("");setDigits(Array(6).fill(""));setError(""); }
  function switchMode(next:Mode) {setMode(next);setError("");setNotice("");setConsent(false);}
  function startOtp() {setDigits(Array(6).fill(""));setError("");setNotice("");setRemaining(30);setExpiresAt(Date.now()+30000);setStep("otp");}
  function finish() {if(mode==="signup"){setPassword("");setDigits(Array(6).fill(""));setError("");setStep("profile");return;}setSignedIn(true);setPassword("");setDigits(Array(6).fill(""));setError("");setStep("account");}
  function fillDigits(value:string,index:number) {
    const numbers=value.replace(/\D/g,"");
    setError("");
    const next=[...digits];
    if (!numbers) next[index]="";
    else numbers.slice(0,6-index).split("").forEach((digit,offset)=>next[index+offset]=digit);
    setDigits(next);
    if(numbers)otpFields.current[Math.min(5,index+numbers.length)]?.focus();
  }
  function completeProfile(){if(!firstName.trim()||!lastName.trim()){setProfileError("Enter your first and last name.");return;}saveProfile(previous=>({...previous,first:firstName.trim(),last:lastName.trim()}));setKnownAccounts(previous=>Array.from(new Set([...previous,identity.trim().toLowerCase()])));setSignedIn(true);setStep("account");}
  const action = mode === "login" ? "LOG IN" : "SIGN UP";
  return <AuthContext.Provider value={{open,signedIn,identity: signedIn ? identity : "",profile,saveProfile,signOut}}>{children}<dialog ref={dialog} className={s.dialog} aria-labelledby="auth-heading" onCancel={close} onClick={e=>{if(e.target===e.currentTarget){const box=e.currentTarget.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)close();}}} onClose={()=>setPassword("")}>
    <button className={s.close} onClick={close} aria-label="Close authentication">×</button><div className={s.brandMark}><BrandLogo/></div>
    {step==="identity" ? <><div className={s.identityBody}><h1 id="auth-heading">{mode==="login"?"Welcome to Barwaqt":"Create your Barwaqt account"}</h1><p className={s.intro}>{mode==="login"?"Log in or create an account to continue.":"Save your favourites and make shopping simpler."}</p><div className={s.switcher} role="group" aria-label="Authentication mode"><button aria-pressed={mode==="login"} onClick={()=>switchMode("login")}>Log in</button><button aria-pressed={mode==="signup"} onClick={()=>switchMode("signup")}>Sign up</button></div><form onSubmit={e=>{e.preventDefault();if(validIdentity(identity,mode)){if(mode==="signup"&&knownAccounts.includes(identity.trim().toLowerCase()))setStep("existing");else startOtp();}else setError(mode==="signup"?"Enter a valid email address.":"Enter a valid email address or mobile number.");}}><label className={s.identityField}><span>{mode==="signup"?"Email address":"Email or mobile number"}</span><input ref={firstField} aria-label={mode==="signup"?"Email address":"Email or mobile number"} type={mode==="signup"?"email":"text"} autoComplete={mode==="signup"?"email":"username"} inputMode="email" value={identity} onChange={e=>{setIdentity(e.target.value);setError("");}} placeholder={mode==="signup"?"Enter your email address":"+92 300 1234567 or email@domain.com"} required maxLength={254}/></label>{mode==="signup"&&<label className={s.consent}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I consent to receiving marketing communications via email and other channels. <span className={s.optional}>(Optional)</span></span></label>}<p role="alert" className={s.error}>{error}</p><button className={s.primary} disabled={!validIdentity(identity,mode)}>CONTINUE</button></form><div className={s.divider}>OR CONTINUE WITH</div><div className={s.social}><button onClick={()=>setNotice("Google sign-in is not connected. Use the email or mobile demo flow above.")}><b>G</b> Google</button><button onClick={()=>setNotice("Apple sign-in is not connected. Use the email or mobile demo flow above.")}><b>●</b> Apple</button></div><p className={s.notice} role="status">{notice}</p><p className={s.privacy}>By continuing, I confirm that I have read the <button onClick={()=>{setReturnStep("identity");setStep("privacy");}}>Privacy Policy</button></p><p className={s.demo}>Demo only · No email or SMS will be sent.</p></div></> : step==="otp" ? <div className={s.verification}><span className={s.stepBadge}>VERIFY YOUR IDENTITY</span><h1 id="auth-heading">Enter verification code</h1><p className={s.intro}>Enter the six-digit demo code to continue.</p><div className={s.destination}><span aria-hidden="true">✉</span><b>{maskIdentity(identity.trim())}</b><button onClick={()=>{setStep("identity");setError("");}}>Change</button></div><form onSubmit={e=>{e.preventDefault();if(digits.join("")===DEMO_CODE)finish();else setError("That code is incorrect. Use the demo code 123456.");}}><div className={s.otp} role="group" aria-label="Six-digit verification code">{digits.map((digit,index)=><input key={index} ref={el=>{otpFields.current[index]=el;}} aria-label={`Digit ${index+1}`} aria-invalid={!!error} inputMode="numeric" autoComplete={index===0?"one-time-code":"off"} value={digit} onFocus={e=>e.currentTarget.select()} onChange={e=>fillDigits(e.target.value,index)} onPaste={e=>{e.preventDefault();fillDigits(e.clipboardData.getData("text"),index);}} onKeyDown={e=>{if(e.key==="Backspace"&&!digits[index]&&index>0){e.preventDefault();const next=[...digits];next[index-1]="";setDigits(next);otpFields.current[index-1]?.focus();}if(e.key==="ArrowLeft"&&index>0){e.preventDefault();otpFields.current[index-1]?.focus();}if(e.key==="ArrowRight"&&index<5){e.preventDefault();otpFields.current[index+1]?.focus();}}} required pattern="[0-9]"/> )}</div><p role="alert" className={s.error}>{error}</p><div className={s.resend}><p>Didn’t get the OTP?</p><button type="button" disabled={remaining>0} onClick={()=>{startOtp();setNotice("Demo code refreshed. Use 123456; no message was sent.");}}>{remaining>0?`Resend OTP in ${remaining}s`:"Resend OTP"}</button><p className={s.notice} role="status">{notice}</p></div><div className={s.hint}><span>☀</span><p>Preview this flow with code <b>123456</b>.<br/>No verification message has been sent.</p></div><button className={s.primary} disabled={digits.some(d=>!d)}>{action}</button></form><button className={s.textButton} onClick={()=>{setStep("password");setError("");setPassword("");}}>{mode==="login"?"Log in":"Sign up"} using password</button></div> : step==="password" ? <div className={s.verification}><h1 id="auth-heading">{mode==="login"?"Log in":"Sign up"} using password</h1><p className={s.passwordIdentity}>{maskIdentity(identity.trim())}</p><form onSubmit={e=>{e.preventDefault();if(password.length>=8)finish();}}><label className={s.passwordLabel}>{mode==="login"?"Password":"Create a password"}<div className={s.passwordField}><input autoComplete="off" aria-label="Password" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} minLength={8} maxLength={128} required/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?"Hide":"Show"}</button></div></label><p className={s.passwordHelp}>Use any sample password of at least 8 characters. Don’t enter a real password.</p><div className={s.hint}><p>Demo only. This password is not sent, stored, or checked against an account.</p></div><button className={s.primary} disabled={password.length<8}>{action}</button></form><button className={s.textButton} onClick={()=>{setPassword("");startOtp();}}>Use a verification code instead</button></div> : step==="profile" ? <div className={s.profileForm}><span className={s.stepBadge}>ONE LAST STEP</span><h1 id="auth-heading">Complete your profile</h1><p className={s.intro}>Tell us a little about yourself.</p><form onSubmit={e=>{e.preventDefault();completeProfile();}}><div className={s.nameFields}><label>First name<input aria-label="First name" autoComplete="given-name" value={firstName} onChange={e=>setFirstName(e.target.value)} required maxLength={80}/></label><label>Last name<input aria-label="Last name" autoComplete="family-name" value={lastName} onChange={e=>setLastName(e.target.value)} required maxLength={80}/></label></div><label>Email address<input type="email" aria-label="Profile email address" value={identity} readOnly/></label><label>City (optional)<input aria-label="City" autoComplete="address-level2" value={profileCity} onChange={e=>setProfileCity(e.target.value)} maxLength={80}/></label><p className={s.demo}>Profile details stay in this demo session. City is not saved to your delivery addresses.</p><p className={s.error} role="alert">{profileError}</p><button className={s.primary}>COMPLETE PROFILE →</button></form></div> : step==="existing" ? <div className={s.verification}><span className={s.stepBadge}>WELCOME BACK</span><h1 id="auth-heading">Account already exists</h1><p className={s.intro}>You already used {maskIdentity(identity)} to create a profile in this demo session.</p><div className={s.hint}>Log in with a verification code to continue.</div><button className={s.primary} onClick={()=>{setMode("login");startOtp();}}>CONTINUE TO LOG IN →</button><button className={s.textButton} onClick={()=>{setIdentity("");setStep("identity");}}>Use a different email</button></div> : step==="account" ? <div className={s.account}><div className={s.success}>✓</div><span className={s.stepBadge}>YOU’RE ALL SET</span><h1 id="auth-heading">Welcome to Barwaqt{profile.first?`, ${profile.first}`:""}!</h1><p>{maskIdentity(identity.trim())}</p><div className={s.hint}><p>This is a local preview, not an authenticated account. No account was created or verified. Refreshing ends this demo session.</p></div><Link href="/profile" className={s.primary} onClick={close}>VIEW MY PROFILE</Link><button className={s.textButton} onClick={close}>Continue shopping</button><button className={s.textButton} onClick={signOut}>Log out of demo</button></div> : <div className={s.policy}><h1 id="auth-heading">Privacy in this demo</h1><p>The login and sign-up forms are an interface preview. They do not create an account, send verification messages, or provide access to protected information.</p><p>The details you enter stay in this page’s memory. Passwords are cleared when the dialog closes or you leave the password step. No marketing subscription is created.</p><p>Your shopping cart and wishlist are stored separately in this browser. A production privacy policy and authentication service have not been connected.</p><button className={s.primary} onClick={()=>setStep(returnStep)}>BACK</button></div>}
  </dialog></AuthContext.Provider>;
}
