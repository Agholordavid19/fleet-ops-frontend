import { useState } from 'react'
import toast from 'react-hot-toast'
import { useGetMaintenanceFlagsQuery, useUpdateFlagProgressMutation, useResolveFlagMutation } from '../apis/fleetApi.jsx'
import Table from '../components/Table.jsx'
import Modal, { ConfirmModal } from '../components/Modal.jsx'
import Badge from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { FormField, Textarea, SubmitButton } from '../components/Form.jsx'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback.jsx'
import { getErrorMessage } from '../utils/format.js'

export default function FlagsScreen() {
    const { data: flags, isLoading, isError } = useGetMaintenanceFlagsQuery()
    const [updateProgress, { isLoading: updating }] = useUpdateFlagProgressMutation()
    const [resolveFlag,   { isLoading: resolving }] = useResolveFlagMutation()

    const [selectedFlag, setSelectedFlag] = useState(null)
    const [notes, setNotes] = useState('')
    const [confirmId, setConfirmId] = useState(null)

    const myFlags =
        flags?.filter((f) =>
            ['ASSIGNED', 'IN_PROGRESS'].includes(f.status)
        ) ?? []

    const handleUpdateProgress = async (e) => {
        e.preventDefault()
        try {
            await updateProgress({ id: selectedFlag.id, notes }).unwrap()
            toast.success('Progress notes updated')
            setSelectedFlag(null)
            setNotes('')
        } catch {
            toast.error('Failed to update notes')
        }
    }

    const handleResolve = async (id) => {
        try {
            await resolveFlag(id).unwrap()
            toast.success('Flag resolved')
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setConfirmId(null)
        }
    }

    const columns = [
        { key: 'vehiclePlate', label: 'Vehicle' },
        { key: 'description',  label: 'Issue' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status} />,
        },
        {
            key: 'notes',
            label: 'Latest Notes',
            render: (row) => (
                <span className="text-gray-400 text-xs">{row.notes ?? 'No notes yet'}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setSelectedFlag(row); setNotes(row.notes ?? '') }}
                        className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors duration-150"
                    >
                        Update
                    </button>
                    {row.status !== 'RESOLVED' && (
                        <button
                            onClick={() => setConfirmId(row.id)}
                            disabled={resolving}
                            className="text-[12px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-150 disabled:opacity-40"
                        >
                            Resolve
                        </button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Assigned Flags"
                subtitle="Manage your maintenance tasks and update progress"
            />

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load flags." />}

            {!isLoading && !isError && (
                <>
                    {/* Mobile card layout */}
                    <div className="block md:hidden space-y-3">
                        {myFlags.length === 0 ? (
                            <p className="text-[13px] text-gray-600 text-center py-8">No flags assigned to you.</p>
                        ) : (
                            myFlags.map((row) => (
                                <div
                                    key={row.id}
                                    className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-[13px] font-semibold text-gray-100">{row.plateNumber ?? row.vehiclePlate}</p>
                                            <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{row.description ?? '—'}</p>
                                        </div>
                                        <Badge status={row.status} />
                                    </div>

                                    {row.notes && (
                                        <p className="text-[11px] text-gray-500 leading-snug border-t border-gray-800 pt-2">
                                            {row.notes}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 border-t border-gray-800 pt-2">
                                        <button
                                            onClick={() => { setSelectedFlag(row); setNotes(row.notes ?? '') }}
                                            className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors duration-150"
                                        >
                                            Update Notes
                                        </button>
                                        {row.status !== 'RESOLVED' && (
                                            <button
                                                onClick={() => setConfirmId(row.id)}
                                                disabled={resolving}
                                                className="text-[12px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-150 disabled:opacity-40"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop table layout */}
                    <div className="hidden md:block">
                        <Table columns={columns} data={myFlags} emptyMessage="No flags assigned to you." />
                    </div>
                </>
            )}

            <ConfirmModal
                open={!!confirmId}
                message="Mark this flag as resolved?"
                onConfirm={() => handleResolve(confirmId)}
                onCancel={() => setConfirmId(null)}
            />

            <Modal open={!!selectedFlag} onClose={() => setSelectedFlag(null)} title="Update Progress">
                {selectedFlag && (
                    <form onSubmit={handleUpdateProgress}>
                        <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-600 mb-1">Issue</p>
                            <p className="text-[13px] text-gray-200 leading-snug">{selectedFlag.description}</p>
                        </div>
                        <FormField label="Progress Notes">
                            <Textarea
                                placeholder="Describe what work has been done..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                            />
                        </FormField>
                        <SubmitButton loading={updating}>Save Notes</SubmitButton>
                    </form>
                )}
            </Modal>
        </>
    )
}