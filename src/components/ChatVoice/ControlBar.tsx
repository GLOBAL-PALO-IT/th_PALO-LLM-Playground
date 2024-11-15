import { useKrispNoiseFilter } from '@livekit/components-react/krisp'
import {
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from '@livekit/components-react'
import { CloseIcon } from '@/components/CloseIcon'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
export default function ControlBar(props: {
  onConnectButtonClicked: () => void
  agentState: AgentState
}) {
  /**
   * Use Krisp background noise reduction when available.
   * Note: This is only available on Scale plan, see {@link https://livekit.io/pricing | LiveKit Pricing} for more details.
   */
  const krisp = useKrispNoiseFilter()
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true)
  }, [])

  return (
    <div className="relative h-[200px]">
      <AnimatePresence>
        {props.agentState === 'disconnected' && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: '-10px' }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 border-2 border-blue-500 bg-white text-blue-500 rounded-md"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== 'disconnected' &&
          props.agentState !== 'connecting' && (
            <motion.div
              initial={{ opacity: 0, top: '10px' }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: '-10px' }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
