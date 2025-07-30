import 'dotenv/config'
import { neon } from '@neondatabase/serverless';

// connection to postgresql ( NEON )
const sql = neon(`${process.env.DB_URI}`);

export default sql;