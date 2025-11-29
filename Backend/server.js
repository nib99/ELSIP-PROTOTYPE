/**
 * ELSIP Backend - prototype scaffold
 * Public + Admin endpoints
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const {
  PGUSER = "elsip",
  PGPASSWORD = "password",
  PGHOST = "localhost",
  PGPORT = 5432,
  PGDATABASE = "elsip_db",
  ADMIN_API_KEY = "change-me",
  PORT = 3000,
} = process.env;

const pool = new Pool({
  user: PGUSER, host: PGHOST, database: PGDATABASE, password: PGPASSWORD, port: PGPORT
});

const app = express();
app.use(cors()); app.use(express.json());

function requireAdmin(req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!key || key !== ADMIN_API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.get('/api/health', (req,res) => res.json({ok:true}));

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phone, region, dateOfBirth, gender, kebeleId } = req.body;
    const r = await pool.query(
      'INSERT INTO workers (full_name, phone, region, date_of_birth, gender, kebele_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [fullName, phone, region, dateOfBirth, gender, kebeleId]
    );
    res.json({ success: true, workerId: r.rows[0].id });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/assessment/:workerId', async (req,res) => {
  try {
    const { workerId } = req.params;
    const { results, score } = req.body;
    await pool.query('UPDATE workers SET skills=$1, assessment_score=$2, assessment_completed=true WHERE id=$3', [results.skills, score, workerId]);
    await pool.query('INSERT INTO skills_assessment (worker_id, results, score, question_count, completed_at) VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP)', [workerId, JSON.stringify(results), score, results.skills ? results.skills.length : 0]);
    const qr = uuidv4();
    await pool.query('UPDATE workers SET qr_token=$1 WHERE id=$2', [qr, workerId]);
    res.json({ success:true, qrToken: qr });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/matches/:workerId', async (req,res) => {
  try {
    const { workerId } = req.params;
    const w = await pool.query('SELECT skills FROM workers WHERE id=$1',[workerId]);
    if (!w.rows.length) return res.status(404).json({ error: "Worker not found" });
    const skills = w.rows[0].skills || [];
    const matches = await pool.query(
      `SELECT j.*, (SELECT COUNT(s) FROM unnest(j.required_skills) s WHERE s = ANY($1::text[]))::float / GREATEST(array_length(j.required_skills,1),1) AS match_score FROM jobs j WHERE j.status='active' ORDER BY match_score DESC LIMIT 50`, [skills]
    );
    for (const job of matches.rows) {
      try {
        await pool.query('INSERT INTO job_matches (worker_id, job_id, match_score, created_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING',[workerId, job.id, job.match_score]);
      } catch(e){}
    }
    res.json(matches.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/profile/:workerId', async (req,res)=>{
  try {
    const { workerId } = req.params;
    const r = await pool.query('SELECT * FROM workers WHERE id=$1',[workerId]);
    if (!r.rows.length) return res.status(404).json({ error: "Worker not found" });
    const worker = r.rows[0];
    const qrString = worker.qr_token ? `elsip://verify/${worker.qr_token}` : null;
    const qrCodeDataUrl = qrString ? await QRCode.toDataURL(qrString) : null;
    res.json({ ...worker, qrCodeDataUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin endpoints (require x-api-key)
app.get('/api/admin/stats', requireAdmin, async (req,res) => {
  try {
    const workers = await pool.query('SELECT COUNT(*)::int AS count FROM workers');
    const jobs = await pool.query('SELECT COUNT(*)::int AS count FROM jobs');
    const matches = await pool.query('SELECT COUNT(*)::int AS count FROM job_matches');
    const topRegions = await pool.query('SELECT region, COUNT(*)::int AS count FROM workers GROUP BY region ORDER BY count DESC LIMIT 10');
    res.json({ workers: workers.rows[0].count, jobs: jobs.rows[0].count, matches: matches.rows[0].count, regions: topRegions.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// other admin endpoints abbreviated for brevity (use earlier delivered admin_server.js for full list)

app.listen(PORT, () => console.log(`ELSIP API listening on ${PORT}`));
