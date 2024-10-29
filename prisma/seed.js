// prisma/seed.js

const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

// Object for Claim status (replacing enum)
const ClaimStatus = {
  0: 'PENDING',
  1: 'APPROVED',
  2: 'REJECTED',
  3: 'CLOSED',
}

// Object for Payment method (replacing enum)
const PaymentMethod = {
  0: 'CREDIT_CARD',
  1: 'BANK_TRANSFER',
  2: 'CASH',
  3: 'CHEQUE',
}

// Function to select a random value from the enum-like object
function getRandomEnumValue(enumObj) {
  const enumValues = Object.keys(enumObj)
    .map((n) => Number.parseInt(n))
    .filter((n) => !Number.isNaN(n))

  const randomIndex = faker.number.int({ min: 0, max: enumValues.length - 1 })
  return enumObj[enumValues[randomIndex]]
}

async function main() {
  // Seed Clients
  const clients = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.client.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      })
    })
  )

  // Seed Policies
  const policies = await Promise.all(
    clients.flatMap((client) =>
      Array.from({ length: 10 }).map(() => {
        return prisma.policy.create({
          data: {
            policyNumber: faker.string.uuid(),
            clientId: client.id,
            startDate: faker.date.past(),
            endDate: faker.date.future(),
            coverageAmount: parseFloat(
              faker.finance.amount({ min: 10000, max: 50000, dec: 2 })
            ),
            premium: parseFloat(
              faker.finance.amount({ min: 500, max: 2000, dec: 2 })
            ),
          },
        })
      })
    )
  )

  // Seed Claims
  const claims = await Promise.all(
    policies.flatMap((policy) =>
      Array.from({ length: 10 }).map(() => {
        return prisma.claim.create({
          data: {
            claimNumber: faker.string.uuid(),
            policyId: policy.id,
            clientId: policy.clientId,
            dateOfClaim: faker.date.recent(),
            amountClaimed: parseFloat(
              faker.finance.amount({ min: 1000, max: 10000, dec: 2 })
            ),
            status: getRandomEnumValue(ClaimStatus),
            description: faker.lorem.sentence(),
          },
        })
      })
    )
  )

  // Seed Payments
  const payments = await Promise.all(
    policies.flatMap((policy) =>
      Array.from({ length: 10 }).map(() => {
        return prisma.payment.create({
          data: {
            paymentNumber: faker.string.uuid(),
            clientId: policy.clientId,
            policyId: policy.id,
            amount: parseFloat(
              faker.finance.amount({ min: 100, max: 2000, dec: 2 })
            ),
            dateOfPayment: faker.date.recent(),
            method: getRandomEnumValue(PaymentMethod),
          },
        })
      })
    )
  )

  console.log(
    `Seeded ${clients.length} clients, ${policies.length} policies, ${claims.length} claims, and ${payments.length} payments.`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
