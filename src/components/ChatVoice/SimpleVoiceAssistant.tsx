import {
  BarVisualizer,
  AgentState,
  TrackReference,
  useVoiceAssistant,
} from '@livekit/components-react'
import { useEffect } from 'react'
export default function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void
}) {
  const { state, audioTrack } = useVoiceAssistant()
  useEffect(() => {
    props.onStateChange(state)
  }, [props, state])
  return (
    <>
      <div className="p-10 h-[450px] max-w-[90vw] mx-auto">
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          className="agent-visualizer"
          options={{ minHeight: 30 }}
        />
      </div>
    </>
  )
}
