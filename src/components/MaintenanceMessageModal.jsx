import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMaintenanceMessagesQuery,
    useSendMaintenanceMessageMutation,
} from '../apis/fleetApi.jsx'

import Modal from './Modal.jsx'
import { LoadingSpinner, ErrorAlert } from './Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function MaintenanceMessageModal({ flag, onClose }) {
    const [message, setMessage] = useState('')

    const {
        data: messages,
        isLoading,
        isError,
    } = useGetMaintenanceMessagesQuery(flag?.id, {
        skip: !flag?.id,
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
                                (messages ?? []).map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="bg-gray-800 border border-gray-700/50 rounded-xl px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <p className="text-[12px] font-semibold text-gray-200">
                                                {msg.senderName || msg.createdByName || 'User'}
                                            </p>

                                            <p className="text-[10px] text-gray-500">
                                                {formatDate(msg.createdAt || msg.sentAt)}
                                            </p>
                                        </div>

                                        <p className="text-[13px] text-gray-400 leading-relaxed">
                                            {msg.message || msg.content}
                                        </p>
                                    </div>
                                ))
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
                            className="px-4 py-2 bg-primary text-gray-900 text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            )}
        </Modal>
    )
}