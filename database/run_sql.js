const fs = require('fs');

async function run() {
  const PAT = process.env.SUPABASE_PAT;
  const REF = process.env.SUPABASE_PROJECT_REF || "wscfirbwwdfpqxkbulsf";
  
  if (!PAT) {
    console.error("Missing SUPABASE_PAT environment variable");
    process.exit(1);
  }
  
  const sql = fs.readFileSync('fix_storage.sql', 'utf8');
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  
  const text = await res.text();
  console.log("Response:", text);
}
run();
