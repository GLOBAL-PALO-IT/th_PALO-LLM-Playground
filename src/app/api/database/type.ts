import { z } from 'zod'

const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

const PolicySchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  policy_number: z.string(),
  type: z.enum(['health', 'life', 'auto', 'home']),
  status: z.enum(['active', 'expired', 'canceled']),
  start_date: z.date(),
  end_date: z.date(),
  premium_amount: z.number().positive(),
  coverage_amount: z.number().positive(),
  created_at: z.date(),
  updated_at: z.date(),
})

const ClaimSchema = z.object({
  id: z.string().uuid(),
  policy_id: z.string().uuid(),
  claim_number: z.string(),
  date_filed: z.date(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']),
  claim_amount: z.number().positive(),
  approved_amount: z.number().positive().optional(),
  description: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

const PaymentSchema = z.object({
  id: z.string().uuid(),
  policy_id: z.string().uuid(),
  payment_date: z.date(),
  amount: z.number().positive(),
  status: z.enum(['completed', 'failed', 'pending']),
  created_at: z.date(),
  updated_at: z.date(),
})
