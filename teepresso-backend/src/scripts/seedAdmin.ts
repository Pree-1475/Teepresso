import { sql } from '../config/db.js';

async function seedAdmin() {
  try {
    const email = 'sai@kurtawala.store';
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES ('admin_main', 'Sai (Admin)', ${email}, 'PasswordKavala!!', 'admin')
      `;
      console.log('✅ Admin user created');
    } else {
      await sql`
        UPDATE users SET password = 'PasswordKavala!!', role = 'admin' WHERE email = ${email}
      `;
      console.log('✅ Admin user updated');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
