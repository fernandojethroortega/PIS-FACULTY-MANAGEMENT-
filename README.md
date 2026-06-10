# PIS Faculty Management System V3

This is the V3 operational package.

## Main Fix

This version removes the form-token blocker that caused:

```text
Security token expired
```

Add Teacher, Register Teacher, Edit Teacher, Add Schedule, and Save Settings should now submit normally.

## Run

1. Extract the ZIP.
2. Open the folder `pis-fms-operational-v3` in VS Code.
3. Copy `.env.example` and rename the copy to `.env`.
4. Run:

```bash
npm install
npm start
```

5. Open:

```text
http://localhost:3000
```

## Login

Admin:

```text
admin@pis.edu.ph
ChangeMeAdmin123!
```

Teacher:

```text
teacher@pis.edu.ph
Teacher123!
```

## Important

This is a full-stack app. It cannot run on GitHub Pages. Use Render, Railway, VPS, or local Node.js.


## V4 Inline Design Fix

This version fixes the issue where the online Render website appears as text only.

The CSS design is embedded directly inside the server-rendered HTML, so the design will show even if `/public/style.css` is not loaded by the host.

Use this V4 version for Render deployment.


## V5 No CSS Link Fix

This version removes the external CSS link completely.

The design is embedded directly inside every page, and a small `V5 INLINE DESIGN` badge appears at the bottom-right of the website. If you do not see that badge online, Render is still deploying an old repository or old commit.
