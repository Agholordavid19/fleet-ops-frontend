import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMaintenanceMessagesQuery,
    useSendMaintenanceMessageMutation,
} from '../apis/fleetApi.jsx'

import Modal from './Modal.jsx'
import { LoadingSpinner, ErrorAlert } from './Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

const ROLE_COLORS = {
    ADMIN:            'text-purple-400 bg-purple-500/10',
    FLEET_MANAGER:    'text-blue-400 bg-blue-500/10',
    MAINTENANCE_TEAM: 'text-amber-400 bg-amber-500/10',
    FIELD_STAFF:      'text-green-400 bg-green-500/10',
}

export default function MaintenanceMessageModal({ flag, onClose }) {
    const [message, setMessage] = useState('')

    const {
        data: messages,
        isLoading,
        isError,
    } = useGetMaintenanceMessagesQuery(flag?.id, {
        skip: !flag?.id,
        pollingInterval: 3000,
    })

    const [sendMessage, { isLoading: sending }] =
        useSendMaintenanceMessageMutation()

    const handleSend = async (e) => {
        e.preventDefault()

        if (!message.trim()) return

        try {
            await sendMessage({
                flagId: flag.id,
                message: message.trim(),
            }).unwrap()

            setMessage('')
            toast.success('Message sent')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const vehicle = flag?.plateNumber || flag?.vehiclePlate || 'N/A'

    const issue = flag?.description
        || flag?.issue
        || flag?.progressNotes
        || `Mileage milestone reached at ${flag?.mileageAtTrigger ?? 'N/A'} km`

    const reportedAt = flag?.triggeredAt || flag?.reportedAt || flag?.createdAt

    return (
        <Modal
            open={!!flag}
            onClose={onClose}
            title="Maintenance Messages"
            size="lg"
        >
            {flag && (
                <div className="space-y-5">
                    <div className="bg-gray-800/40 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                            Flag
                        </p>

                        <p className="text-[13px] text-gray-200">
                            {vehicle} — {issue}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-1">
                            Reported: {formatDate(reportedAt)}
                        </p>
                    </div>

                    {isLoading && <LoadingSpinner />}

                    {isError && (
                        <ErrorAlert message="Failed to load messages." />
                    )}

                    {!isLoading && !isError && (
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {(messages ?? []).length === 0 ? (
                                <p className="text-[13px] text-gray-600 text-center py-6">
                                    No messages yet.
                                </p>
                            ) : (
                                (messages ?? []).map((msg) => {
                                    const roleColor = ROLE_COLORS[msg.senderRole] ?? 'text-gray-400 bg-gray-700/50'
                                    return (
                                        <div
                                            key={msg.id}
                                            className="bg-gray-800 border border-gray-700/50 rounded-xl px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[12px] font-semibold text-gray-200">
                                                        {msg.senderName || msg.createdByName || 'User'}
                                                    </p>
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleColor}`}>
                                                        {msg.senderRole?.replace(/_/g, ' ') ?? 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 shrink-0">
                                                    {formatDate(msg.sentAt || msg.createdAt)}
                                                </p>
                                            </div>

                                            <p className="text-[13px] text-gray-400 leading-relaxed">
                                                {msg.message || msg.content}
                                            </p>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    <form
                        onSubmit={handleSend}
                        className="flex gap-2 border-t border-gray-800 pt-4"
                    >
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 outline-none focus:border-gray-500"
                        />

                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="px-4 py-2 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            )}
        </Modal>
    )
}