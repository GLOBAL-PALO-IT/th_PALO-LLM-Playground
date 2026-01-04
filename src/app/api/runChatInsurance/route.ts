import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import {
  getClientList,
  ClientListParams,
  getIndividualClient,
  IdParams,
  getPolicies,
  PolicyListParams,
  getIndividualPolicy,
  getClaims,
  ClaimListParams,
  getPayments,
  PaymentListParams,
  getIndividualClaim,
  getIndividualPayment,
} from './tools'
import { openaiInstance } from '@/lib/openai'
import { zodFunction } from '@/lib/zodFunction'

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  console.log(messages)
  try {

    const runner = openaiInstance().beta.chat.completions
      .runTools({
        model: ModelName.GPT4O,
        stream: true,
        tools: [
          zodFunction({
            function: getClientList,
            schema: ClientListParams,
            description:
              'List Clients with optional search by name, email, phone, or id',
          }),
          zodFunction({
            function: getIndividualClient,
            schema: IdParams,
            description: 'Get an individual client by id',
          }),
          zodFunction({
            function: getPolicies,
            // export const PolicyListParams = z.object({
            //   id: z.string().optional(),
            //   policyNumber: z.string().optional(),
            //   clientId: z.string().optional(),
            //   startDate: z.date().optional(),
            //   endDate: z.date().optional(),
            //   coverageAmount: z.number().optional(),
            //   premium: z.number().optional(),
            // })
            schema: PolicyListParams,
            description:
              'List Policies with optional search by policyNumber, clientId, startDate, endDate, coverageAmount, or premium',
          }),
          zodFunction({
            function: getIndividualPolicy,
            schema: IdParams,
            description: 'Get an individual policy by id',
          }),
          zodFunction({
            function: getClaims,
            // export const ClaimListParams = z.object({
            //   id: z.string().optional(),
            //   claimNumber: z.string().optional(),
            //   policyId: z.string().optional(),
            //   clientId: z.string().optional(),
            //   dateOfClaim: z.date().optional(),
            //   amountClaimed: z.number().optional(),
            //   status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CLOSED']).optional(),
            //   description: z.string().optional(),
            // })
            schema: ClaimListParams,
            description:
              'List Claims with optional search by policyId, claimNumber, status, amountClaimed, dateOfClaim, or clientId',
          }),
          zodFunction({
            function: getIndividualClaim,
            schema: IdParams,
            description: 'Get an individual claim by id',
          }),
          zodFunction({
            function: getPayments,
            // export const PaymentListParams = z.object({
            //   id: z.string().optional(),
            //   paymentNumber: z.string().optional(),
            //   clientId: z.string().optional(),
            //   policyId: z.string().optional(),
            //   amount: z.number().optional(),
            //   dateOfPayment: z.date().optional(),
            //   method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
            // })
            schema: PaymentListParams,
            description:
              'List Payments with optional search by policyId, paymentNumber, clientId, amount, dateOfPayment, or method',
          }),
          zodFunction({
            function: getIndividualPayment,
            schema: IdParams,
            description: 'Get an individual payment by id',
          }),
        ],
        messages,
      })
      .on('message', (msg) => console.log('msg', msg))
      .on('functionCall', (functionCall) =>
        console.log('functionCall', functionCall)
      )
      .on('functionCallResult', (functionCallResult) =>
        console.log('functionCallResult', functionCallResult)
      )
      .on('content', (diff) => process.stdout.write(diff))

    const result = await runner.finalChatCompletion()
    console.log()
    console.log('messages')
    console.log(runner.messages)

    console.log()
    console.log('final chat completion')
    console.dir(result, { depth: null })
    return NextResponse.json({ message: runner.messages })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
