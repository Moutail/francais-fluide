const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
  const users = await prisma.user.findMany({
    include: { subscription: true }
  });
  
  console.log('\nTotal users:', users.length, '\n');
  
  users.forEach(u => {
    const plan = u.subscription?.plan || 'NONE';
    const status = u.subscription?.status || 'NONE';
    console.log(`${u.email}`);
    console.log(`  Role: ${u.role} | Plan: ${plan} | Status: ${status}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

quickCheck();
