import { z } from 'zod'
import prisma from '@/lib/prisma'

/*
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

model Client {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  policies Policy[] // One-to-many relationship with Policy
  claims   Claim[] // One-to-many relationship with Claim
  payments Payment[] // One-to-many relationship with Payment
}

// Policy model
model Policy {
  id             String   @id @default(uuid())
  policyNumber   String   @unique
  clientId       String
  startDate      DateTime
  endDate        DateTime
  coverageAmount Float
  premium        Float
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  client   Client    @relation(fields: [clientId], references: [id])
  claims   Claim[] // One-to-many relationship with Claim
  payments Payment[] // One-to-many relationship with Payment
}

// Claim model
model Claim {
  id            String   @id @default(uuid())
  claimNumber   String   @unique
  policyId      String
  clientId      String
  dateOfClaim   DateTime
  amountClaimed Float
  status        String
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  policy Policy @relation(fields: [policyId], references: [id])
  client Client @relation(fields: [clientId], references: [id])
}

// Payment model
model Payment {
  id            String   @id @default(uuid())
  paymentNumber String   @unique
  clientId      String
  policyId      String
  amount        Float
  dateOfPayment DateTime
  method        String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  client Client @relation(fields: [clientId], references: [id])
  policy Policy @relation(fields: [policyId], references: [id])
}
*/
export const IdParams = z.object({
  id: z.string(),
})
export type IdParams = z.infer<typeof IdParams>

// model Client {
//     id        String   @id @default(uuid())
//     name      String
//     email     String   @unique
//     phone     String?
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
//     policies Policy[] // One-to-many relationship with Policy
//     claims   Claim[] // One-to-many relationship with Claim
//     payments Payment[] // One-to-many relationship with Payment
//   }
//Client
export const ClientListParams = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  id: z.string().optional(),
})
export type ClientListParams = z.infer<typeof ClientListParams>
export const getClientList = async (params: ClientListParams) => {
  const clients = await prisma.client.findMany({
    take: 10,
    where: {
      ...params,
      name: params.name ? { contains: params.name } : undefined,
    },
  })
  return clients
}

export const getIndividualClient = async (params: IdParams) => {
  const client = await prisma.client.findUnique({ where: { id: params.id } })
  return client ? client : {}
}
// const createClient = async () => {}

// model Policy {
//     id             String   @id @default(uuid())
//     policyNumber   String   @unique
//     clientId       String
//     startDate      DateTime
//     endDate        DateTime
//     coverageAmount Float
//     premium        Float
//     createdAt      DateTime @default(now())
//     updatedAt      DateTime @updatedAt

//     client   Client    @relation(fields: [clientId], references: [id])
//     claims   Claim[] // One-to-many relationship with Claim
//     payments Payment[] // One-to-many relationship with Payment
//   }
//Policy
export const PolicyListParams = z.object({
  id: z.string().optional(),
  policyNumber: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  coverageAmount: z.number().optional(),
  premium: z.number().optional(),
  orderByCoverageAmount: z.enum(['asc', 'desc']).optional(),
})
export type PolicyListParams = z.infer<typeof PolicyListParams>
export const getPolicies = async (params: PolicyListParams) => {
  const policies = await prisma.policy.findMany({
    orderBy: {
      coverageAmount: params.orderByCoverageAmount, //descending or ascending or undefined
    },
    take: 10,
    where: {
      id: params.id,
      policyNumber: params.policyNumber,
      clientId: params.clientId,
      startDate: params.startDate,
      endDate: params.endDate,
      coverageAmount: params.coverageAmount,
      premium: params.premium,
    },
  })
  return policies
}
export const getIndividualPolicy = async ({ id }: IdParams) => {
  const policy = await prisma.policy.findUnique({ where: { id } })
  return policy ? policy : {}
}
// const createPolicy = async () => {}

// model Claim {
//     id            String   @id @default(uuid())
//     claimNumber   String   @unique
//     policyId      String
//     clientId      String
//     dateOfClaim   DateTime
//     amountClaimed Float
//     status        String
//     description   String?
//     createdAt     DateTime @default(now())
//     updatedAt     DateTime @updatedAt

//     policy Policy @relation(fields: [policyId], references: [id])
//     client Client @relation(fields: [clientId], references: [id])
//   }

// Object for Claim status (replacing enum)
// const ClaimStatus = {
//     0: 'PENDING',
//     1: 'APPROVED',
//     2: 'REJECTED',
//     3: 'CLOSED',
//   }
//Claim
export const ClaimListParams = z.object({
  id: z.string().optional(),
  claimNumber: z.string().optional(),
  policyId: z.string().optional(),
  clientId: z.string().optional(),
  dateOfClaim: z.date().optional(),
  amountClaimed: z.number().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CLOSED']).optional(),
  orderByAmountClaimed: z.enum(['asc', 'desc']).optional(),
  //   description: z.string().optional(),
})
export type ClaimListParams = z.infer<typeof ClaimListParams>
export const getClaims = async (params: ClaimListParams) => {
  const claims = await prisma.claim.findMany({
    orderBy: {
      amountClaimed: params.orderByAmountClaimed, //descending or ascending or undefined
    },
    take: 10,
    where: {
      id: params.id,
      claimNumber: params.claimNumber,
      policyId: params.policyId,
      clientId: params.clientId,
      dateOfClaim: params.dateOfClaim,
      amountClaimed: params.amountClaimed,
      status: params.status,
    },
  })
  return claims
}
export const getIndividualClaim = async ({ id }: IdParams) => {
  const claim = await prisma.claim.findUnique({ where: { id } })
  return claim ? claim : {}
}
// const createClaim = async () => {}

// Payment model
// model Payment {
//     id            String   @id @default(uuid())
//     paymentNumber String   @unique
//     clientId      String
//     policyId      String
//     amount        Float
//     dateOfPayment DateTime
//     method        String
//     createdAt     DateTime @default(now())
//     updatedAt     DateTime @updatedAt

//     client Client @relation(fields: [clientId], references: [id])
//     policy Policy @relation(fields: [policyId], references: [id])
//   }
// Object for Payment method (replacing enum)
// const PaymentMethod = {
//     0: 'CREDIT_CARD',
//     1: 'BANK_TRANSFER',
//     2: 'CASH',
//     3: 'CHEQUE',
//   }
//Payment
export const PaymentListParams = z.object({
  id: z.string().optional(),
  paymentNumber: z.string().optional(),
  clientId: z.string().optional(),
  policyId: z.string().optional(),
  amount: z.number().optional(),
  dateOfPayment: z.date().optional(),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
  orderByAmount: z.enum(['asc', 'desc']).optional(),
})
export type PaymentListParams = z.infer<typeof PaymentListParams>
export const getPayments = async (params: PaymentListParams) => {
  const payments = await prisma.payment.findMany({
    orderBy: {
      amount: params.orderByAmount, //descending or ascending or undefined
    },
    take: 10,
    where: {
      id: params.id,
      paymentNumber: params.paymentNumber,
      clientId: params.clientId,
      policyId: params.policyId,
      amount: params.amount,
      dateOfPayment: params.dateOfPayment,
      method: params.method,
    },
  })
  return payments
}

export const getIndividualPayment = async ({ id }: IdParams) => {
  const payment = await prisma.payment.findUnique({ where: { id } })
  return payment ? payment : {}
}
// const createPayment = async () => {}
