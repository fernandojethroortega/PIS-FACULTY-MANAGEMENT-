
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const SQLiteStoreFactory = require("connect-sqlite3");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const multer = require("multer");

const app = express();
const INLINE_CSS = "\n:root{--navy:#0b2d5c;--blue:#1557a6;--gold:#f5c542;--red:#c0392b;--green:#0f766e;--bg:#f4f7fb;--text:#1f2937;--muted:#667085;--border:#d8e2f0;--shadow:0 14px 35px rgba(11,45,92,.12)}\n*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text)}a{text-decoration:none;color:var(--blue)}img{max-width:100%}.landing{min-height:100vh;background:radial-gradient(circle at top right,rgba(245,197,66,.3),transparent 28%),linear-gradient(135deg,#fff,#eaf3ff)}.landing nav{display:flex;justify-content:space-between;align-items:center;padding:20px min(6vw,80px);gap:16px}.brand{display:flex;align-items:center;gap:12px}.logo{width:58px;height:58px;border-radius:16px;background:var(--navy);display:grid;place-items:center;color:white;font-weight:900;border:5px solid var(--gold)}.brand span{display:block;color:var(--muted);font-size:13px}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;padding:60px min(6vw,80px);align-items:center}.hero h1{font-size:clamp(34px,5vw,60px);line-height:1.05;color:var(--navy);margin:0 0 18px}.hero p{font-size:18px;line-height:1.55}.card,.panel,.auth,.stat{background:white;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow)}.card,.panel,.auth{padding:24px}.eyebrow{text-transform:uppercase;letter-spacing:.11em;color:var(--blue);font-size:12px;font-weight:700}.btn{border:0;border-radius:12px;padding:11px 15px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.primary{background:var(--blue);color:white}.secondary{background:var(--gold);color:#1f2937}.danger{background:var(--red);color:white}.ghost{background:white;border:1px solid var(--border);color:var(--blue)}.full{width:100%}.large{padding:15px 22px}.actions,.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.auth-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,var(--navy),#123f7a)}.auth{width:min(460px,100%);text-align:center}.auth.wide{width:min(900px,100%)}.form{display:grid;gap:14px;text-align:left}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.form label{display:grid;gap:7px;color:var(--navy);font-weight:700}.form input,.form select,.filters input,.filters select{border:1px solid var(--border);border-radius:12px;padding:12px;font:inherit;width:100%;background:white}.span2{grid-column:span 2}.app{min-height:100vh;display:grid;grid-template-columns:270px 1fr}.side{background:var(--navy);color:white;padding:20px;position:sticky;top:0;height:100vh;overflow:auto}.side a{display:block;color:white;padding:12px;border-radius:12px;margin:4px 0}.side a:hover{background:rgba(255,255,255,.15)}.side .brand{margin-bottom:20px}.main{padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:18px}.top h1{margin:0;color:var(--navy)}.userbox{background:white;border:1px solid var(--border);border-radius:16px;padding:12px 16px;box-shadow:var(--shadow);text-align:right}.alert{padding:12px 14px;border-radius:12px;margin-bottom:14px;font-weight:700}.success{background:#dcfce7;color:#166534}.error{background:#fee2e2;color:#991b1b}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}.stat{padding:20px}.stat span{color:var(--muted)}.stat strong{display:block;color:var(--navy);font-size:38px;margin-top:8px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}.filters{display:grid;grid-template-columns:1fr 220px auto;gap:10px;margin-bottom:14px}.tablewrap{overflow-x:auto}table{width:100%;border-collapse:collapse;background:white}th,td{padding:12px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}th{background:#eff6ff;color:var(--navy)}.person{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:16px;margin-bottom:10px;background:white}.avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#dbeafe}.muted,.person p{color:var(--muted)}.badge{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:700}.good{background:#d1fae5;color:#065f46}.warn,.pending{background:#fef3c7;color:#92400e}.bad{background:#fee2e2;color:#991b1b}.mini{padding:7px 9px;font-size:12px;border-radius:9px}.hint{background:#f8fafc;border:1px dashed var(--border);border-radius:14px;padding:12px;margin-top:14px;text-align:left}\n@media(max-width:980px){.hero,.app,.cols{grid-template-columns:1fr}.side{position:static;height:auto}.stats{grid-template-columns:repeat(2,1fr)}.grid,.filters{grid-template-columns:1fr}.span2{grid-column:span 1}}\n@media(max-width:560px){.landing nav,.top{flex-direction:column;align-items:stretch}.stats{grid-template-columns:1fr}.main{padding:14px}}\n@media print{.side,.top,.actions,.filters,.row,.btn{display:none!important}.app{display:block}.panel,.stat{box-shadow:none;break-inside:avoid}body{background:white}}\n";
const SQLiteStore = SQLiteStoreFactory(session);
const dbFile = process.env.DATABASE_FILE || "./data/fms.sqlite";
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
fs.mkdirSync("./uploads/profile-pictures", { recursive: true });

const db = new sqlite3.Database(dbFile);
db.run("PRAGMA foreign_keys=ON");

function run(sql, params=[]) { return new Promise((resolve,reject)=>db.run(sql, params, function(err){err?reject(err):resolve({id:this.lastID,changes:this.changes});})); }
function get(sql, params=[]) { return new Promise((resolve,reject)=>db.get(sql, params, (err,row)=>err?reject(err):resolve(row))); }
function all(sql, params=[]) { return new Promise((resolve,reject)=>db.all(sql, params, (err,rows)=>err?reject(err):resolve(rows))); }
function clean(v){return String(v||"").replace(/[<>]/g,"").trim();}
function mins(t){const [h,m]=String(t).split(":").map(Number);return h*60+m;}
function inside(t,s,e){const x=mins(t);return x>=mins(s)&&x<mins(e);}
function overlap(a,b,c,d){return mins(a)<mins(d)&&mins(b)>mins(c);}
function today(){return new Date().toLocaleDateString("en-US",{weekday:"long"});}
function nowTime(){const n=new Date();return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;}
function csv(v){return `"${String(v??"").replace(/"/g,'""')}"`;}
function esc(s){ return String(s??"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/profile-pictures",
    filename: (req,file,cb)=>cb(null, `profile-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
  }),
  fileFilter: (req,file,cb)=>{
    const ok = ["image/jpeg","image/png","image/webp","image/gif"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed."), ok);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy:false }));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname,"public")));
app.use("/uploads", express.static(path.join(__dirname,"uploads")));
app.use(session({
  store: new SQLiteStore({ db:"sessions.sqlite", dir:"./data" }),
  secret: process.env.SESSION_SECRET || "change-me",
  resave:false,
  saveUninitialized:false,
  cookie:{ httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", maxAge:1000*60*60*8 }
}));

function msg(req,type){const key=type==="success"?"success":"error";const v=req.session[key]||""; delete req.session[key]; return v ? `<div class="alert ${type}">${esc(v)}</div>` : ""; }
function alerts(req){ return msg(req,"success")+msg(req,"error"); }
function needLogin(req,res,next){ if(!req.session.user) return res.redirect("/login"); next(); }
function needAdmin(req,res,next){ if(!req.session.user || req.session.user.role!=="Administrator") return res.status(403).send(page(req,"Access Denied",`<section class="auth"><h1>Access Denied</h1><p>Administrator access is required.</p><a class="btn primary" href="/dashboard">Back</a></section>`,"auth-page")); next(); }
function logo() { return `<img src="/public/school-logo.png" alt="School Logo" class="school-logo" onerror="this.outerHTML=\'<span class=&quot;logo&quot;>PIS</span>\'">`; }
function page(req,title,body,bodyClass=""){ return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | PIS FMS</title><style>${INLINE_CSS}.v5badge{position:fixed;right:12px;bottom:12px;background:#0b2d5c;color:#fff;padding:8px 10px;border-radius:999px;font-size:12px;font-weight:700;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,.2)}</style></head><body class="${bodyClass}">${body}<div class="v5badge">V5 INLINE DESIGN</div></body></html>`; }

function shell(req,title,content){
  const u=req.session.user;
  const nav = `<aside class="side">
    <div class="brand">${logo()}<div><strong>PIS FMS</strong><span>Faculty Management</span></div></div>
    <a href="/dashboard">Dashboard</a>
    ${u.role==="Teacher"?`<a href="/profile">My Profile</a>`:""}
    ${u.role==="Administrator"?`<a href="/teachers">Manage Teachers</a>`:""}
    <a href="/schedules">Schedules</a>
    <a href="/tracker">Vacant Tracker</a>
    <a href="/reports">Reports</a>
    ${u.role==="Administrator"?`<a href="/settings">Settings</a>`:""}
    <form method="post" action="/logout"><button class="btn danger full">Logout</button></form>
  </aside>`;
  return page(req,title,`<div class="app">${nav}<main class="main"><header class="top"><div><p class="eyebrow">Pagudpud Integrated School</p><h1>${esc(title)}</h1></div><div class="userbox"><strong>${esc(u.name)}</strong><span>${esc(u.role)}</span></div></header>${alerts(req)}${content}</main></div>`);
}

async function initDb(){
  await run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS teachers(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER UNIQUE,employee_number TEXT UNIQUE,complete_name TEXT NOT NULL,sex TEXT,birth_date TEXT,age INTEGER,address TEXT,contact_number TEXT,email TEXT,position TEXT,department TEXT,specialization TEXT,advisory_class TEXT,grade_level TEXT,years_in_service INTEGER,employment_status TEXT,profile_picture TEXT,account_status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS schedules(id INTEGER PRIMARY KEY AUTOINCREMENT,teacher_id INTEGER NOT NULL,day TEXT NOT NULL,start_time TEXT NOT NULL,end_time TEXT NOT NULL,subject TEXT NOT NULL,grade_section TEXT,room TEXT,school_year TEXT,quarter TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE)`);
  await run(`CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),school_name TEXT DEFAULT 'Pagudpud Integrated School',school_id TEXT DEFAULT '500480',school_year TEXT DEFAULT 'SY 2026-2027',quarter TEXT DEFAULT '1st Quarter')`);
  await run(`INSERT OR IGNORE INTO settings(id,school_name,school_id,school_year,quarter) VALUES(1,'Pagudpud Integrated School','500480','SY 2026-2027','1st Quarter')`);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@pis.edu.ph";
  if(!await get("SELECT id FROM users WHERE email=?",[adminEmail])){
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!", 12);
    await run("INSERT INTO users(name,email,password_hash,role,status) VALUES(?,?,?,?,?)",[process.env.ADMIN_NAME || "System Administrator", adminEmail, hash, "Administrator", "Active"]);
  }
  if(!await get("SELECT id FROM users WHERE email=?",["teacher@pis.edu.ph"])){
    const hash = await bcrypt.hash("Teacher123!",12);
    const u = await run("INSERT INTO users(name,email,password_hash,role,status) VALUES(?,?,?,?,?)",["Juan Dela Cruz","teacher@pis.edu.ph",hash,"Teacher","Active"]);
    const t = await run(`INSERT INTO teachers(user_id,employee_number,complete_name,sex,birth_date,age,address,contact_number,email,position,department,specialization,advisory_class,grade_level,years_in_service,employment_status,account_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[u.id,"PIS-2026-001","Juan Dela Cruz","Male","1990-01-15",36,"San Fernando City, La Union","09123456789","teacher@pis.edu.ph","Teacher III","Junior High School","English","Grade 9 - Rizal","Grade 9",10,"Permanent","Active"]);
    await run(`INSERT INTO teachers(employee_number,complete_name,sex,birth_date,age,address,contact_number,email,position,department,specialization,advisory_class,grade_level,years_in_service,employment_status,account_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,["PIS-2026-002","Maria Santos","Female","1988-07-22",38,"Pagudpud, City of San Fernando, La Union","09987654321","maria.santos@deped.gov.ph","Master Teacher I","Senior High School","Mathematics","Grade 12 - STEM","Grade 12",14,"Permanent","Active"]);
    await run(`INSERT INTO schedules(teacher_id,day,start_time,end_time,subject,grade_section,room,school_year,quarter) VALUES
    (?,'Monday','07:30','08:30','English 9','Grade 9 - Rizal','Room 201','SY 2026-2027','1st Quarter'),
    (?,'Tuesday','09:00','10:00','English 9','Grade 9 - Rizal','Room 201','SY 2026-2027','1st Quarter'),
    (2,'Monday','08:30','09:30','General Mathematics','Grade 12 - STEM','SHS 1','SY 2026-2027','1st Quarter')`,[t.id,t.id]);
  }
}

async function availability(day,time){
  const teachers=await all("SELECT * FROM teachers WHERE account_status='Active' ORDER BY complete_name");
  const schedules=await all("SELECT * FROM schedules WHERE day=?",[day]);
  const vacant=[], busy=[];
  for(const t of teachers){
    const s=schedules.find(x=>x.teacher_id===t.id && inside(time,x.start_time,x.end_time));
    s?busy.push({teacher:t,schedule:s}):vacant.push({teacher:t});
  }
  return {vacant,busy};
}
function teacherCard(item,busy=false){
  const t=item.teacher, s=item.schedule;
  return `<div class="person"><img class="avatar" src="${esc(t.profile_picture||'/public/avatar.svg')}"><div><strong>${esc(t.complete_name)}</strong><p>${busy?`${esc(s.subject)} · ${esc(s.start_time)}-${esc(s.end_time)} · ${esc(s.room||"")}`:`${esc(t.position||"Teacher")} · ${esc(t.department||"")}`}</p><span class="badge ${busy?'warn':'good'}">${busy?'Busy':'Vacant'}</span></div></div>`;
}
function input(name,label,value="",required=false,type="text"){ return `<label>${label}<input type="${type}" name="${name}" value="${esc(value)}" ${required?"required":""}></label>`; }
function teacherForm(t={},action="/teachers/new",isProfile=false){
  return `<section class="panel"><form class="form grid" method="post" action="${action}" enctype="multipart/form-data">
  ${!isProfile?input("employee_number","Employee Number",t.employee_number,true):`<label>Employee Number<input name="employee_number" value="${esc(t.employee_number)}" readonly></label>`}
  ${input("complete_name","Complete Name",t.complete_name,true)}
  ${input("sex","Sex",t.sex)}
  ${input("birth_date","Birth Date",t.birth_date,false,"date")}
  ${input("age","Age",t.age,false,"number")}
  ${input("contact_number","Contact Number",t.contact_number)}
  <label class="span2">Address<input name="address" value="${esc(t.address)}"></label>
  ${input("email","Email",t.email,false,"email")}
  ${input("position","Position",t.position)}
  ${input("department","Department",t.department)}
  ${input("specialization","Specialization",t.specialization)}
  ${input("advisory_class","Advisory Class",t.advisory_class)}
  ${input("grade_level","Grade Level Handled",t.grade_level)}
  ${input("years_in_service","Years in Service",t.years_in_service,false,"number")}
  ${input("employment_status","Employment Status",t.employment_status)}
  ${!isProfile?`<label>Account Status<select name="account_status">${["Active","Pending","Deactivated"].map(s=>`<option ${((t.account_status||"Active")===s)?"selected":""}>${s}</option>`).join("")}</select></label>`:""}
  <label class="span2">Profile Picture<input type="file" name="profile_picture" accept="image/*"></label>
  <button class="btn primary">Save</button><a class="btn ghost" href="${isProfile?'/dashboard':'/teachers'}">Cancel</a>
  </form></section>`;
}
async function saveTeacher(b,pic,id){
  await run(`UPDATE teachers SET employee_number=?,complete_name=?,sex=?,birth_date=?,age=?,address=?,contact_number=?,email=?,position=?,department=?,specialization=?,advisory_class=?,grade_level=?,years_in_service=?,employment_status=?,profile_picture=?,account_status=? WHERE id=?`,[clean(b.employee_number),clean(b.complete_name),clean(b.sex),clean(b.birth_date),clean(b.age),clean(b.address),clean(b.contact_number),clean(b.email),clean(b.position),clean(b.department),clean(b.specialization),clean(b.advisory_class),clean(b.grade_level),clean(b.years_in_service),clean(b.employment_status),pic,clean(b.account_status||"Active"),id]);
}

app.get("/", (req,res)=>{
  if(req.session.user) return res.redirect("/dashboard");
  res.send(page(req,"Faculty Management System",`<main class="landing"><nav><div class="brand">${logo()}<div><strong>Pagudpud Integrated School</strong><span>Faculty Management System</span></div></div><div class="actions"><a class="btn ghost" href="/login">Sign In</a><a class="btn primary" href="/register">Register</a></div></nav><section class="hero"><div><p class="eyebrow">Operational Full-Stack Web App V5</p><h1>Manage teachers, schedules, vacant tracking, and reports.</h1><p>Built with Node.js, Express, SQLite, bcrypt password hashing, server-side sessions, file upload, and role-based access control.</p><div class="actions"><a class="btn primary large" href="/login">Open System</a><a class="btn secondary large" href="/register">Teacher Registration</a></div><div class="hint"><strong>Demo Teacher:</strong> teacher@pis.edu.ph / Teacher123!<br><strong>Admin:</strong> admin@pis.edu.ph / ChangeMeAdmin123!</div></div><div class="card"><h2>V3 Fix</h2><p>V5 confirms inline design. No external CSS is required.</p></div></section></main>`));
});
app.get("/login",(req,res)=>res.send(page(req,"Sign In",`<section class="auth"><div class="brand" style="justify-content:center">${logo()}<div><strong>PIS FMS</strong><span>Sign In</span></div></div>${alerts(req)}<form class="form" method="post" action="/login"><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required></label><button class="btn primary full">Sign In</button></form><div class="hint"><strong>Admin:</strong><br>admin@pis.edu.ph / ChangeMeAdmin123!<br><br><strong>Demo Teacher:</strong><br>teacher@pis.edu.ph / Teacher123!</div><p><a href="/register">Teacher Registration</a> · <a href="/">Home</a></p></section>`,"auth-page")));
app.post("/login", async(req,res)=>{
  const email=clean(req.body.email).toLowerCase();
  const u=await get("SELECT * FROM users WHERE email=?",[email]);
  if(!u || u.status!=="Active" || !await bcrypt.compare(req.body.password,u.password_hash)){req.session.error="Invalid, inactive, or wrong account.";return res.redirect("/login");}
  const t=await get("SELECT id FROM teachers WHERE user_id=?",[u.id]);
  req.session.user={id:u.id,name:u.name,email:u.email,role:u.role,teacherId:t?t.id:null};
  res.redirect("/dashboard");
});
app.get("/register",(req,res)=>res.send(page(req,"Teacher Registration",`<section class="auth wide"><h1>Teacher Registration</h1>${alerts(req)}<form class="form grid" method="post" action="/register" enctype="multipart/form-data">${input("employee_number","Employee Number","",true)}${input("complete_name","Complete Name","",true)}${input("email","Email","",true,"email")}<label>Password<input type="password" name="password" minlength="8" required></label>${input("position","Position")}${input("department","Department")}${input("specialization","Specialization")}${input("contact_number","Contact Number")}<label class="span2">Profile Picture<input type="file" name="profile_picture" accept="image/*"></label><button class="btn primary span2">Submit Registration</button></form><p><a href="/login">Back to Sign In</a></p></section>`,"auth-page")));
app.post("/register", upload.single("profile_picture"), async(req,res)=>{
  const email=clean(req.body.email).toLowerCase();
  if(await get("SELECT id FROM users WHERE email=?",[email])){req.session.error="Email is already registered.";return res.redirect("/register");}
  const hash=await bcrypt.hash(req.body.password,12);
  const name=clean(req.body.complete_name);
  const u=await run("INSERT INTO users(name,email,password_hash,role,status) VALUES(?,?,?,?,?)",[name,email,hash,"Teacher","Pending"]);
  const pic=req.file?`/uploads/profile-pictures/${req.file.filename}`:"";
  await run(`INSERT INTO teachers(user_id,employee_number,complete_name,email,position,department,specialization,contact_number,profile_picture,account_status) VALUES(?,?,?,?,?,?,?,?,?,?)`,[u.id,clean(req.body.employee_number),name,email,clean(req.body.position),clean(req.body.department),clean(req.body.specialization),clean(req.body.contact_number),pic,"Pending"]);
  req.session.success="Registration saved. Wait for admin approval.";
  res.redirect("/login");
});
app.post("/logout", (req,res)=>req.session.destroy(()=>res.redirect("/")));

app.get("/dashboard", needLogin, async(req,res)=>{
  const a=await availability(today(),nowTime());
  const total=await get("SELECT COUNT(*) c FROM teachers WHERE account_status='Active'");
  const pending=await get("SELECT COUNT(*) c FROM teachers WHERE account_status='Pending'");
  res.send(shell(req,"Dashboard",`<section class="stats"><div class="stat"><span>Active Teachers</span><strong>${total.c}</strong></div><div class="stat"><span>Vacant Now</span><strong>${a.vacant.length}</strong></div><div class="stat"><span>Busy Now</span><strong>${a.busy.length}</strong></div><div class="stat"><span>Pending</span><strong>${pending.c}</strong></div></section><section class="cols"><div class="panel"><h2>Vacant Now</h2>${a.vacant.map(x=>teacherCard(x)).join("")||"<p class='muted'>None found.</p>"}</div><div class="panel"><h2>Busy Now</h2>${a.busy.map(x=>teacherCard(x,true)).join("")||"<p class='muted'>None found.</p>"}</div></section>`));
});

app.get("/profile", needLogin, async(req,res)=>{ if(req.session.user.role!=="Teacher") return res.redirect("/teachers"); const t=await get("SELECT * FROM teachers WHERE id=?",[req.session.user.teacherId]); res.send(shell(req,"My Profile", teacherForm(t,"/profile",true))); });
app.post("/profile", needLogin, upload.single("profile_picture"), async(req,res)=>{ if(req.session.user.role!=="Teacher") return res.redirect("/dashboard"); const old=await get("SELECT * FROM teachers WHERE id=?",[req.session.user.teacherId]); const pic=req.file?`/uploads/profile-pictures/${req.file.filename}`:old.profile_picture; req.body.account_status=old.account_status; await saveTeacher(req.body,pic,req.session.user.teacherId); await run("UPDATE users SET name=?, email=? WHERE id=?",[clean(req.body.complete_name),clean(req.body.email).toLowerCase(),req.session.user.id]); req.session.user.name=clean(req.body.complete_name); req.session.success="Profile saved."; res.redirect("/profile"); });

app.get("/teachers", needLogin, needAdmin, async(req,res)=>{
  const q=clean(req.query.q), status=clean(req.query.status);
  let sql="SELECT * FROM teachers WHERE 1=1", params=[];
  if(q){sql+=" AND (complete_name LIKE ? OR employee_number LIKE ? OR department LIKE ? OR specialization LIKE ?)";params.push(`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`);}
  if(status){sql+=" AND account_status=?";params.push(status);}
  sql+=" ORDER BY complete_name";
  const rows=await all(sql,params);
  const trs=rows.map(t=>`<tr><td><div class="person" style="border:0;padding:0;margin:0"><img class="avatar" src="${esc(t.profile_picture||'/public/avatar.svg')}"><div><strong>${esc(t.complete_name)}</strong><p>${esc(t.employee_number||"")}</p></div></div></td><td>${esc(t.position)}</td><td>${esc(t.department)}</td><td>${esc(t.specialization)}</td><td><span class="badge ${t.account_status==="Active"?"good":t.account_status==="Pending"?"pending":"bad"}">${esc(t.account_status)}</span></td><td><div class="row"><a class="btn mini ghost" href="/teachers/${t.id}/edit">Edit</a><form method="post" action="/teachers/${t.id}/status"><input type="hidden" name="status" value="Active"><button class="btn mini secondary">Activate</button></form><form method="post" action="/teachers/${t.id}/status"><input type="hidden" name="status" value="Deactivated"><button class="btn mini danger">Deactivate</button></form><form method="post" action="/teachers/${t.id}/delete" onsubmit="return confirm('Delete teacher?')"><button class="btn mini danger">Delete</button></form></div></td></tr>`).join("");
  res.send(shell(req,"Manage Teachers",`<section class="panel"><div class="actions" style="justify-content:space-between"><h2>Teacher Records</h2><a class="btn primary" href="/teachers/new">Add Teacher</a></div><form class="filters" method="get"><input name="q" value="${esc(q)}" placeholder="Search teachers"><select name="status"><option value="">All Status</option>${["Active","Pending","Deactivated"].map(s=>`<option ${status===s?"selected":""}>${s}</option>`).join("")}</select><button class="btn secondary">Filter</button></form><div class="tablewrap"><table><thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead><tbody>${trs}</tbody></table></div></section>`));
});
app.get("/teachers/new", needLogin, needAdmin, (req,res)=>res.send(shell(req,"Add Teacher",teacherForm({},"/teachers/new"))));
app.post("/teachers/new", needLogin, needAdmin, upload.single("profile_picture"), async(req,res)=>{
  const pic=req.file?`/uploads/profile-pictures/${req.file.filename}`:"";
  await run(`INSERT INTO teachers(employee_number,complete_name,sex,birth_date,age,address,contact_number,email,position,department,specialization,advisory_class,grade_level,years_in_service,employment_status,profile_picture,account_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[clean(req.body.employee_number),clean(req.body.complete_name),clean(req.body.sex),clean(req.body.birth_date),clean(req.body.age),clean(req.body.address),clean(req.body.contact_number),clean(req.body.email),clean(req.body.position),clean(req.body.department),clean(req.body.specialization),clean(req.body.advisory_class),clean(req.body.grade_level),clean(req.body.years_in_service),clean(req.body.employment_status),pic,clean(req.body.account_status||"Active")]);
  req.session.success="Teacher saved successfully.";res.redirect("/teachers");
});
app.get("/teachers/:id/edit", needLogin, needAdmin, async(req,res)=>{const t=await get("SELECT * FROM teachers WHERE id=?",[req.params.id]);res.send(shell(req,"Edit Teacher",teacherForm(t,`/teachers/${t.id}/edit`)));});
app.post("/teachers/:id/edit", needLogin, needAdmin, upload.single("profile_picture"), async(req,res)=>{ const old=await get("SELECT * FROM teachers WHERE id=?",[req.params.id]); const pic=req.file?`/uploads/profile-pictures/${req.file.filename}`:old.profile_picture; await saveTeacher(req.body,pic,req.params.id); if(old.user_id) await run("UPDATE users SET name=?,email=?,status=? WHERE id=?",[clean(req.body.complete_name),clean(req.body.email).toLowerCase(),clean(req.body.account_status),old.user_id]); req.session.success="Teacher updated."; res.redirect("/teachers");});
app.post("/teachers/:id/status", needLogin, needAdmin, async(req,res)=>{ const t=await get("SELECT * FROM teachers WHERE id=?",[req.params.id]); await run("UPDATE teachers SET account_status=? WHERE id=?",[clean(req.body.status),req.params.id]); if(t?.user_id) await run("UPDATE users SET status=? WHERE id=?",[clean(req.body.status),t.user_id]); req.session.success="Status updated.";res.redirect("/teachers");});
app.post("/teachers/:id/delete", needLogin, needAdmin, async(req,res)=>{const t=await get("SELECT * FROM teachers WHERE id=?",[req.params.id]); if(t?.user_id) await run("DELETE FROM users WHERE id=?",[t.user_id]); await run("DELETE FROM teachers WHERE id=?",[req.params.id]); req.session.success="Teacher deleted.";res.redirect("/teachers");});

async function scheduleRows(user){ if(user.role==="Administrator") return all("SELECT schedules.*,teachers.complete_name FROM schedules JOIN teachers ON teachers.id=schedules.teacher_id ORDER BY day,start_time"); return all("SELECT schedules.*,teachers.complete_name FROM schedules JOIN teachers ON teachers.id=schedules.teacher_id WHERE teacher_id=? ORDER BY day,start_time",[user.teacherId]);}
async function scheduleConflict(s,ignore=null){ const rows=await all("SELECT schedules.*,teachers.complete_name FROM schedules JOIN teachers ON teachers.id=schedules.teacher_id WHERE day=?",[s.day]); return rows.find(x=>Number(x.id)!==Number(ignore) && (Number(x.teacher_id)===Number(s.teacher_id)||(x.room&&s.room&&x.room.toLowerCase()===s.room.toLowerCase())) && overlap(s.start_time,s.end_time,x.start_time,x.end_time));}
function schedForm(req,s={},teachers=[]){
  const teacherSelect=req.session.user.role==="Administrator"?`<label>Teacher<select name="teacher_id">${teachers.map(t=>`<option value="${t.id}" ${Number(s.teacher_id)===Number(t.id)?"selected":""}>${esc(t.complete_name)}</option>`).join("")}</select></label>`:`<label>Teacher<input disabled value="${esc(req.session.user.name)}"></label>`;
  return `<section class="panel"><form class="form grid" method="post">${teacherSelect}<label>Day<select name="day">${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>`<option ${((s.day||"Monday")===d)?"selected":""}>${d}</option>`).join("")}</select></label>${input("start_time","Start Time",s.start_time||"07:30",true,"time")}${input("end_time","End Time",s.end_time||"08:30",true,"time")}${input("subject","Subject",s.subject,true)}${input("grade_section","Grade/Section",s.grade_section)}${input("room","Room",s.room)}${input("school_year","School Year",s.school_year||"SY 2026-2027")}${input("quarter","Quarter",s.quarter||"1st Quarter")}<label class="span2"><input type="checkbox" name="allow_conflict" value="yes" style="width:auto"> Allow conflict if intentional</label><button class="btn primary">Save Schedule</button><a class="btn ghost" href="/schedules">Cancel</a></form></section>`;
}
app.get("/schedules", needLogin, async(req,res)=>{const rows=await scheduleRows(req.session.user);res.send(shell(req,"Schedules",`<section class="panel"><div class="actions" style="justify-content:space-between"><h2>Class Schedules</h2><a class="btn primary" href="/schedules/new">Add Schedule</a></div><div class="tablewrap"><table><thead><tr><th>Teacher</th><th>Day</th><th>Time</th><th>Subject</th><th>Section</th><th>Room</th><th>Actions</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${esc(s.complete_name)}</td><td>${esc(s.day)}</td><td>${esc(s.start_time)}-${esc(s.end_time)}</td><td>${esc(s.subject)}</td><td>${esc(s.grade_section)}</td><td>${esc(s.room)}</td><td><div class="row"><a class="btn mini ghost" href="/schedules/${s.id}/edit">Edit</a><form method="post" action="/schedules/${s.id}/delete" onsubmit="return confirm('Delete schedule?')"><button class="btn mini danger">Delete</button></form></div></td></tr>`).join("")}</tbody></table></div></section>`));});
app.get("/schedules/new", needLogin, async(req,res)=>{const teachers=await all("SELECT * FROM teachers WHERE account_status='Active' ORDER BY complete_name");res.send(shell(req,"Add Schedule",schedForm(req,{},teachers)));});
app.post("/schedules/new", needLogin, async(req,res)=>{await saveSchedule(req,res);});
app.get("/schedules/:id/edit", needLogin, async(req,res)=>{const s=await get("SELECT * FROM schedules WHERE id=?",[req.params.id]); if(req.session.user.role!=="Administrator"&&Number(s.teacher_id)!==Number(req.session.user.teacherId)) return res.status(403).send(shell(req,"Access Denied","<section class='panel'>You can edit only your own schedule.</section>")); const teachers=await all("SELECT * FROM teachers WHERE account_status='Active' ORDER BY complete_name");res.send(shell(req,"Edit Schedule",schedForm(req,s,teachers)));});
app.post("/schedules/:id/edit", needLogin, async(req,res)=>{await saveSchedule(req,res,req.params.id);});
async function saveSchedule(req,res,id=null){
  const existing=id?await get("SELECT * FROM schedules WHERE id=?",[id]):null;
  if(existing && req.session.user.role!=="Administrator"&&Number(existing.teacher_id)!==Number(req.session.user.teacherId)) return res.status(403).send("Access denied");
  const teacher_id=req.session.user.role==="Administrator"?req.body.teacher_id:req.session.user.teacherId;
  const s={teacher_id,day:clean(req.body.day),start_time:clean(req.body.start_time),end_time:clean(req.body.end_time),subject:clean(req.body.subject),grade_section:clean(req.body.grade_section),room:clean(req.body.room),school_year:clean(req.body.school_year),quarter:clean(req.body.quarter)};
  if(mins(s.end_time)<=mins(s.start_time)){req.session.error="End time must be later than start time.";return res.redirect(id?`/schedules/${id}/edit`:"/schedules/new");}
  const conflict=await scheduleConflict(s,id);
  if(conflict && req.body.allow_conflict!=="yes"){req.session.error=`Conflict with ${conflict.complete_name}, ${conflict.day}, ${conflict.start_time}-${conflict.end_time}, ${conflict.room}. Tick allow conflict if intentional.`;return res.redirect(id?`/schedules/${id}/edit`:"/schedules/new");}
  if(id) await run("UPDATE schedules SET teacher_id=?,day=?,start_time=?,end_time=?,subject=?,grade_section=?,room=?,school_year=?,quarter=? WHERE id=?",[s.teacher_id,s.day,s.start_time,s.end_time,s.subject,s.grade_section,s.room,s.school_year,s.quarter,id]);
  else await run("INSERT INTO schedules(teacher_id,day,start_time,end_time,subject,grade_section,room,school_year,quarter) VALUES(?,?,?,?,?,?,?,?,?)",[s.teacher_id,s.day,s.start_time,s.end_time,s.subject,s.grade_section,s.room,s.school_year,s.quarter]);
  req.session.success="Schedule saved.";res.redirect("/schedules");
}
app.post("/schedules/:id/delete", needLogin, async(req,res)=>{const s=await get("SELECT * FROM schedules WHERE id=?",[req.params.id]); if(req.session.user.role!=="Administrator"&&Number(s.teacher_id)!==Number(req.session.user.teacherId)) return res.status(403).send("Access denied"); await run("DELETE FROM schedules WHERE id=?",[req.params.id]); req.session.success="Schedule deleted.";res.redirect("/schedules");});

app.get("/tracker", needLogin, async(req,res)=>{const day=clean(req.query.day||today()), time=clean(req.query.time||nowTime()), a=await availability(day,time);res.send(shell(req,"Vacant Teacher Tracker",`<section class="panel"><form class="filters"><select name="day">${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=>`<option ${day===d?"selected":""}>${d}</option>`).join("")}</select><input type="time" name="time" value="${esc(time)}"><button class="btn primary">Check</button></form></section><section class="cols"><div class="panel"><h2>Vacant at ${esc(day)} ${esc(time)}</h2>${a.vacant.map(x=>teacherCard(x)).join("")||"<p class='muted'>None found.</p>"}</div><div class="panel"><h2>Busy at ${esc(day)} ${esc(time)}</h2>${a.busy.map(x=>teacherCard(x,true)).join("")||"<p class='muted'>None found.</p>"}</div></section>`));});
app.get("/reports", needLogin, async(req,res)=>{const teachers=await all("SELECT * FROM teachers ORDER BY complete_name"); const schedules=await all("SELECT schedules.*,teachers.complete_name FROM schedules JOIN teachers ON teachers.id=schedules.teacher_id ORDER BY day,start_time"); res.send(shell(req,"Reports",`<section class="panel"><div class="actions"><button onclick="window.print()" class="btn primary">Print</button><a class="btn secondary" href="/reports/teachers.csv">Export Teachers CSV</a><a class="btn secondary" href="/reports/schedules.csv">Export Schedules CSV</a></div></section><section class="panel"><h2>Teacher Records</h2><div class="tablewrap"><table><thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Specialization</th><th>Status</th></tr></thead><tbody>${teachers.map(t=>`<tr><td>${esc(t.complete_name)}</td><td>${esc(t.position)}</td><td>${esc(t.department)}</td><td>${esc(t.specialization)}</td><td>${esc(t.account_status)}</td></tr>`).join("")}</tbody></table></div></section><section class="panel"><h2>Schedule Records</h2><div class="tablewrap"><table><thead><tr><th>Teacher</th><th>Day</th><th>Time</th><th>Subject</th><th>Room</th></tr></thead><tbody>${schedules.map(s=>`<tr><td>${esc(s.complete_name)}</td><td>${esc(s.day)}</td><td>${esc(s.start_time)}-${esc(s.end_time)}</td><td>${esc(s.subject)}</td><td>${esc(s.room)}</td></tr>`).join("")}</tbody></table></div></section>`));});
app.get("/reports/teachers.csv", needLogin, async(req,res)=>{const rows=await all("SELECT * FROM teachers ORDER BY complete_name"); const header=["Employee Number","Name","Sex","Birth Date","Age","Address","Contact","Email","Position","Department","Specialization","Advisory","Grade","Years","Employment","Status"]; const data=[header,...rows.map(t=>[t.employee_number,t.complete_name,t.sex,t.birth_date,t.age,t.address,t.contact_number,t.email,t.position,t.department,t.specialization,t.advisory_class,t.grade_level,t.years_in_service,t.employment_status,t.account_status])].map(r=>r.map(csv).join(",")).join("\n"); res.setHeader("Content-Type","text/csv");res.setHeader("Content-Disposition","attachment; filename=teacher-records.csv");res.send(data);});
app.get("/reports/schedules.csv", needLogin, async(req,res)=>{const rows=await all("SELECT schedules.*,teachers.complete_name FROM schedules JOIN teachers ON teachers.id=schedules.teacher_id ORDER BY day,start_time"); const header=["Teacher","Day","Start","End","Subject","Section","Room","SY","Quarter"]; const data=[header,...rows.map(s=>[s.complete_name,s.day,s.start_time,s.end_time,s.subject,s.grade_section,s.room,s.school_year,s.quarter])].map(r=>r.map(csv).join(",")).join("\n"); res.setHeader("Content-Type","text/csv");res.setHeader("Content-Disposition","attachment; filename=schedules.csv");res.send(data);});

app.get("/settings", needLogin, needAdmin, async(req,res)=>{const s=await get("SELECT * FROM settings WHERE id=1");res.send(shell(req,"Settings",`<section class="panel"><form class="form grid" method="post">${input("school_name","School Name",s.school_name)}${input("school_id","School ID",s.school_id)}${input("school_year","School Year",s.school_year)}<label>Quarter<select name="quarter">${["1st Quarter","2nd Quarter","3rd Quarter","4th Quarter"].map(q=>`<option ${s.quarter===q?"selected":""}>${q}</option>`).join("")}</select></label><button class="btn primary">Save Settings</button></form></section>`));});
app.post("/settings", needLogin, needAdmin, async(req,res)=>{await run("UPDATE settings SET school_name=?,school_id=?,school_year=?,quarter=? WHERE id=1",[clean(req.body.school_name),clean(req.body.school_id),clean(req.body.school_year),clean(req.body.quarter)]);req.session.success="Settings saved.";res.redirect("/settings");});

app.use((err,req,res,next)=>{console.error(err); res.status(500).send(page(req,"Server Error",`<section class="auth"><h1>Server Error</h1><p>${esc(process.env.NODE_ENV==="production"?"Something went wrong.":err.message)}</p><a class="btn primary" href="/">Home</a></section>`,"auth-page"));});
initDb().then(()=>app.listen(process.env.PORT||3000,()=>console.log(`PIS FMS V3 running at http://localhost:${process.env.PORT||3000}`))).catch(e=>{console.error(e);process.exit(1);});
