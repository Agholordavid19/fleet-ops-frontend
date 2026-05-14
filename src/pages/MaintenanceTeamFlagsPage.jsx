import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMyMaintenanceFlagsQuery,
    useUpdateFlagProgressMutation,
    useMarkFlagDoneMutation,
} from '../apis/fleetApi.jsx'
import Table from '../components/Table.jsx'
import Badge from '../components/Badge.jsx'
import Modal from '../components/Modal.jsx'
import PageHeader from "../components/Pageheader";
import { FormField, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'
import MaintenanceMessageModal from '../components/MaintenanceMessageModal.jsx'

export default function MaintenanceTeamFlagsPage() {
    const {data: flags, isLoading, isError} = useGetMyMaintenanceFlagsQuery()
    const [updateProgress, {isLoading: updating}] = useUpdateFlagProgressMutation()
    const [markDone, {isLoading: markingDone}] = useMarkFlagDoneMutation()

    const [selectedFlag, setSelectedFlag] = useState(null)
    const [messageFlag, setMessageFlag] = useState(null)
    const [progressNotes, setProgressNotes] = useState('')

    const myFlags = flags ?? []

    const handleOpenProgress = (flag) => {
        setSelectedFlag(flag)
        setProgressNotes(flag.progressNotes ?? '')
    }

    const handleProgressSubmit = async (e) => {
        e.preventDefault()

        try {
            await updateProgress({
                id: selectedFlag.id,
                progressNotes,
            }).unwrap()

            toast.success('Progress updated')
            setSelectedFlag(null)
            setProgressNotes('')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleMarkDone = async (id) => {
        try {
            await markDone(id).unwrap()
            toast.success('Marked as done. Awaiting approval.')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const columns = [
        {
            key: 'plateNumber',
            label: 'Vehicle',
            render: (row) => row.plateNumber || row.vehiclePlate || 'N/A',
        },
        {
            key: 'issue',
            label: 'Issue',
            render: (row) =>
                row.progressNotes ||
                `Mileage milestone reached at ${row.mileageAtTrigger ?? 'N/A'} km`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status}/>,
        },
        {
            key: 'triggeredAt',
            label: 'Reported',
            render: (row) => formatDate(row.triggeredAt),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex flex-wrap items-center gap-2">
                    {(row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS') && (
                        <>
                            <button
                                onClick={() => handleOpenProgress(row)}
                                className="text-[11px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-medium"
                            >
                                Update Progress
                            </button>

                            <button
                                onClick={() => handleMarkDone(row.id)}
                                disabled={markingDone}
                                className="text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
                            >
                                Done
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setMessageFlag(row)}
                        className="text-[11px] bg-gray-800 text-gray-300 hover:text-gray-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                        Messages
                    </button>
                </div>
            ),
        },
    ]

    const activeFlags = myFlags.filter((f) =>
        ['ASSIGNED', 'IN_PROGRESS'].includes(f.status)
    )

    const completedFlags = myFlags.filter((f) =>
        ['PENDING_APPROVAL', 'RESOLVED'].includes(f.status)
    )

    return (
        <>
            <PageHeader
                title="My Maintenance Flags"
                subtitle={`${activeFlags.length} active task${activeFlags.length === 1 ? '' : 's'}`}
            />

            {isLoading && <LoadingSpinner/>}

            {isError && (
                <ErrorAlert message="Failed to load your assigned maintenance flags."/>
            )}

            {!isLoading && !isError && (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Active Work
                        </h2>

                        <Table
                            columns={columns}
                            data={activeFlags}
                            emptyMessage="No active maintenance work."
                        />
                    </section>

                    <section>
                        <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Fixed / Previous Work
                        </h2>

                        <Table
                            columns={columns}
                            data={completedFlags}
                            emptyMessage="No completed maintenance work yet."
                        />
                    </section>
                </div>
            )}

            <Modal
                open={!!selectedFlag}
                onClose={() => setSelectedFlag(null)}
                title="Update Progress"
            >
                {selectedFlag && (
                    <form onSubmit={handleProgressSubmit}>
                        <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                Vehicle
                            </p>
                            <p className="text-[13px] text-gray-200">
                                {selectedFlag.vehiclePlate || selectedFlag.plateNumber || 'N/A'}
                            </p>
                        </div>

                        <FormField label="Progress Notes">
                            <textarea
                                value={progressNotes}
                                onChange={(e) => setProgressNotes(e.target.value)}
                                placeholder="Describe what has been done..."
                                required
                                rows={5}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 outline-none focus:border-gray-500"
                            />
                        </FormField>

                        <SubmitButton loading={updating}>
                            Update Progress
                        </SubmitButton>
                    </form>
                )}
            </Modal>

            <MaintenanceMessageModal
                flag={messageFlag}
                onClose={() => setMessageFlag(null)}
            />
        </>
    )
}