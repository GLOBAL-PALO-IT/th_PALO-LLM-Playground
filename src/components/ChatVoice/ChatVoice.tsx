'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  LiveKitRoom,
  useVoiceAssistant,
  useMaybeRoomContext,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
  TrackReference,
} from '@livekit/components-react'

import { useCallback, useEffect, useState } from 'react'
import {
  MediaDeviceFailure,
  Participant,
  RoomEvent,
  TrackPublication,
  TranscriptionSegment,
} from 'livekit-client'
import type { ConnectionDetails } from '@/app/api/connection-details/types'
import { NoAgentNotification } from '@/components/NoAgentNotification'
import '@livekit/components-styles'
import './livekit.css'
import SimpleVoiceAssistant from './SimpleVoiceAssistant'
import ControlBar from './ControlBar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
interface Transcription {
  segment: TranscriptionSegment
  participant?: Participant
  publication?: TrackPublication
}
export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined)
  const [agentState, setAgentState] = useState<AgentState>('disconnected')
  const room = useMaybeRoomContext()
  const [rawSegments, setRawSegments] = useState<{
    [id: string]: Transcription
  }>({})
  const [displayTranscriptions, setDisplayTranscriptions] = useState<
    Transcription[]
  >([])

  useEffect(() => {
    console.log({ agentState, room })
    if (!room) {
      return
    }
    console.log('roomxxxx', room)
    const updateRawSegments = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
      console.log('segmentsxxxx', segments)
      setRawSegments((prev) => {
        const newSegments = { ...prev }
        for (const segment of segments) {
          newSegments[segment.id] = { segment, participant, publication }
        }
        return newSegments
      })
    }
    room.on(RoomEvent.TranscriptionReceived, updateRawSegments)

    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateRawSegments)
    }
  }, [room, agentState])

  useEffect(() => {
    const sorted = Object.values(rawSegments).sort(
      (a, b) =>
        (a.segment.firstReceivedTime ?? 0) - (b.segment.firstReceivedTime ?? 0)
    )
    const mergedSorted = sorted.reduce((acc, current) => {
      if (acc.length === 0) {
        return [current]
      }

      const last = acc[acc.length - 1]
      if (
        last.participant === current.participant &&
        last.participant?.isAgent &&
        (current.segment.firstReceivedTime ?? 0) -
          (last.segment.lastReceivedTime ?? 0) <=
          1000 &&
        !last.segment.id.startsWith('status-') &&
        !current.segment.id.startsWith('status-')
      ) {
        // Merge segments from the same participant if they're within 1 second of each other
        return [
          ...acc.slice(0, -1),
          {
            ...current,
            segment: {
              ...current.segment,
              text: `${last.segment.text} ${current.segment.text}`,
              id: current.segment.id, // Use the id of the latest segment
              firstReceivedTime: last.segment.firstReceivedTime, // Keep the original start time
            },
          },
        ]
      } else {
        return [...acc, current]
      }
    }, [] as Transcription[])
    setDisplayTranscriptions(mergedSorted)
  }, [rawSegments])

  const onConnectButtonClicked = useCallback(async () => {
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
        '/api/connection-details',
      window.location.origin
    )
    const response = await fetch(url.toString())
    const connectionDetailsData = await response.json()
    updateConnectionDetails(connectionDetailsData)
  }, [])

  return (
    <main
      data-lk-theme="default"
      className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4"
    >
      <Card className="p-4 w-full overflow-y-auto">
        <LiveKitRoom
          token={connectionDetails?.participantToken}
          serverUrl={connectionDetails?.serverUrl}
          connect={connectionDetails !== undefined}
          audio={true}
          video={false}
          onMediaDeviceFailure={onDeviceFailure}
          onDisconnected={() => {
            updateConnectionDetails(undefined)
          }}
          className="grid grid-rows-[2fr_1fr] items-center"
        >
          <SimpleVoiceAssistant onStateChange={setAgentState} />
          <ControlBar
            onConnectButtonClicked={onConnectButtonClicked}
            agentState={agentState}
          />
          <RoomAudioRenderer />
          <NoAgentNotification state={agentState} />
        </LiveKitRoom>
      </Card>
      {/* <Card className="p-4 w-full overflow-y-auto">
        <div className="space-y-4">
          {displayTranscriptions.map(
            ({ segment, participant, publication }) =>
              segment.text.trim() !== '' && (
                <div
                  key={segment.id}
                  className={cn(
                    'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                    participant?.isAgent
                      ? 'bg-neutral-100 text-[#09090B]'
                      : 'ml-auto border border-neutral-300'
                  )}
                >
                  {segment.text.trim()}
                </div>
              )
          )}
          <div ref={transcriptEndRef} />
        </div> 
      </Card>*/}
    </main>
  )
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error)
  alert(
    'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab'
  )
}
