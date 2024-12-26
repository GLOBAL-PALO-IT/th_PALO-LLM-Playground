import { NextResponse } from 'next/server'
/**
 * To Summarize downstream api needed for this api need to have 3 endpoints
 * 
 * 1. https://pelican-nice-hopelessly.ngrok-free.app/ for health check
 * 2. https://pelican-nice-hopelessly.ngrok-free.app/make-call for making call
 */


const checkTwilioServer = async() => {
  //set .env variables TWILIO_SERVER to ngrok domain for example https://pelican-nice-hopelessly.ngrok-free.app/ 
  //to check health just run https://pelican-nice-hopelessly.ngrok-free.app/ it should return 200
  //curl https://pelican-nice-hopelessly.ngrok-free.app/
  const checkResult = await fetch(process.env.TWILIO_SERVER!)
  return checkResult
}

export async function POST(request: Request) {
  const { phoneNumber } = await request.json()
  // Make this api call 
  const checkResult = await checkTwilioServer()
  if (checkResult.status !== 200) {
    console.log('Twilio server is NOT healthy')
    return NextResponse.json({ output: 'Twilio server is not healthy' }, { status: 500 })
  }else{
    console.log('Twilio server is healthy')
  } 

  //curl -X POST -d to=phoneNumber http://localhost:6060/make-call or https://pelican-nice-hopelessly.ngrok-free.app/make-call
  try {
    const response = await fetch(`${process.env.TWILIO_SERVER}make-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to:phoneNumber }),
    })
    const data = await response.json()
    console.log({phone: data, phoneNumber})
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
