/**
 * Interactive CLI to create the first admin user.
 *
 * Usage (from the server/ directory):
 *   npm run create-admin
 *
 * This script MUST be run manually. The agent never runs it automatically.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  THE9THWAY — Create Admin User');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const name = (await ask(rl, 'Full name: ')).trim();
    if (!name) throw new Error('Name cannot be empty.');

    const email = (await ask(rl, 'Email: ')).trim().toLowerCase();
    if (!email || !email.includes('@')) throw new Error('Invalid email address.');

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) throw new Error(`Admin with email "${email}" already exists.`);

    const password = await ask(rl, 'Password (min 8 chars): ');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');

    const confirm = await ask(rl, 'Confirm password: ');
    if (password !== confirm) throw new Error('Passwords do not match.');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash },
    });

    console.log('\n✓ Admin user created successfully!');
    console.log(`  ID:    ${user.id}`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log('\nYou can now log in at /admin/login\n');
  } catch (err: any) {
    console.error(`\n✗ Error: ${err.message}\n`);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
