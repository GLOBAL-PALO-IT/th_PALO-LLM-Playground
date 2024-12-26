'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Chat = () => {
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSendMessage = async () => {
        if (!phoneNumber.trim()) return
        setIsLoading(true)
        try {
            const response = await fetch('/api/runPhoneCall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            })
            const { message } = await response.json()
            console.log({ message })
        } catch (error: any) {
            console.error('Error:', error.message)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="flex flex-col">
            <div className="p-4 flex flex-row content-center items-center">
                <h3 className="text-sm font-bold mb-2 mr-2">Phone Number</h3>
                <Input
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => {
                        setPhoneNumber(e.target.value.trim())
                    }}
                    className="mb-2 mr-2 w-[300px]"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    key="run-search"
                    className="bg-blue-800 mb-2 mr-2"
                    disabled={isLoading}
                    onClick={handleSendMessage}
                >
                    {isLoading ? 'Calling...' : 'Call'}
                </Button>
            </div>
        </div>

    )
}

export default Chat