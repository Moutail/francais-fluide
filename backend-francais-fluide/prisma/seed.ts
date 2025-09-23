import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const testUsers = [
    { name: 'Demo User', email: 'test+demo@francais-fluide.local', plan: 'demo' as const },
    { name: 'Etudiant User', email: 'test+etudiant@francais-fluide.local', plan: 'etudiant' as const },
    { name: 'Premium User', email: 'test+premium@francais-fluide.local', plan: 'premium' as const },
    { name: 'Etablissement User', email: 'test+etablissement@francais-fluide.local', plan: 'etablissement' as const },
  ]

  const password = 'Test!1234'
  const hashedPassword = await bcrypt.hash(password, 12)

  for (const tu of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: tu.email } })
    let user = existing
    if (!existing) {
      user = await prisma.user.create({
        data: {
          email: tu.email,
          name: tu.name,
          password: hashedPassword,
        },
      })

      await prisma.userProgress.create({
        data: {
          userId: user!.id,
          wordsWritten: 0,
          accuracy: 0,
          timeSpent: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0,
          lastActivity: new Date(),
        },
      })
    } else {
      // Ensure userProgress exists and lastActivity is not null
      const up = await prisma.userProgress.findUnique({ where: { userId: user!.id } })
      if (!up) {
        await prisma.userProgress.create({
          data: {
            userId: user!.id,
            wordsWritten: 0,
            accuracy: 0,
            timeSpent: 0,
            exercisesCompleted: 0,
            currentStreak: 0,
            level: 1,
            xp: 0,
            lastActivity: new Date(),
          },
        })
      } else if (up.lastActivity === null) {
        await prisma.userProgress.update({
          where: { userId: user!.id },
          data: { lastActivity: new Date() },
        })
      }
    }

    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.subscription.upsert({
      where: { userId: user!.id },
      update: {
        plan: tu.plan,
        status: 'active',
        startDate: now,
        endDate: in30Days,
      },
      create: {
        userId: user!.id,
        plan: tu.plan,
        status: 'active',
        startDate: now,
        endDate: in30Days,
      },
    })

    console.log(`Seeded user ${tu.email} with plan ${tu.plan}`)
  }

  console.log('Comptes de test créés/mis à jour. Mot de passe: Test!1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
