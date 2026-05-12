import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMaintenanceFlagsQuery,
    useAssignFlagMutation,
    useGetUsersQuery,
    useApproveFlagMutation,
} from '../apis/fleetApi.jsx'

import Table from '../components/Table.jsx'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { FormField, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function MaintenanceScreen() {
    const { data: flags, isLoading, isError } = useGetMaintenanceFlagsQuery()
    const { data: users, isLoading: usersLoading } = useGetUsersQuery()

    const [assignFlag, { isLoading: assigning }] = useAssignFlagMutation()
    const [approveFlag, { isLoading: approving }] = useApproveFlagMutation()

    const [selectedFlag, setSelectedFlag] = useState(null)
    const [approvalFlag, setApprovalFlag] = useState(null)

    const [techId, setTechId] = useState('')
    const [newMilestoneInterval, setNewMilestoneInterval] = useState('')
    const [serviceNotes, setServiceNotes] = useState('')

    const maintenanceTeam = (users ?? []).filter(
        (user) => user.role === 'MAINTENANCE_TEAM'
    )

    const handleAssign = async (e) => {
        e.preventDefault()

        try {
            await assignFlag({
                id: selectedFlag.id,
                maintenanceTeamUserId: Number(techId),
            }).unwrap()

            toast.success('Flag assigned to maintenance team')
            setSelectedFlag(null)
            setTechId('')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleApprove = async (e) => {
        e.preventDefault()

        try {
            await approveFlag({
                id: approvalFlag.id,
                newMilestoneInterval: Number(newMilestoneInterval),
                serviceNotes,
            }).unwrap()

            toast.success('Maintenance approved')
            setApprovalFlag(null)
            setNewMilestoneInterval('')
            setServiceNotes('')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const columns = [
        {
            key: 'plateNumber',
            label: 'Vehicle',
            render: (row) => row.plateNumber || row.vehiclePlate || '—',
        },
        {
            key: 'issue',
            label: 'Issue',
            render: (row) =>
                row.description ||
                row.issue ||
                row.progressNotes ||
                'Mileage milestone reached',
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status} />,
        },
        {
            key: 'triggeredAt',
            label: 'Reported',
            render: (row) => formatDate(row.triggeredAt),
        },
        {
            key: 'actions',
            label: '',
            render: (row) => {
                if (row.status === 'OPEN') {
                    return (
                        <button
                            onClick={() => setSelectedFlag(row)}
                            className="text-[12px] text-amber-400 hover:text-amber-300 font-medium transition-colors duration-150"
                        >
                            Assign →
                        </button>
                    )
                }

                if (row.status === 'PENDING_APPROVAL') {
                    return (
                        <button
                            onClick={() => setApprovalFlag(row)}
                            className="text-[12px] text-emerald-500 hover:text-emerald-400 font-medium transition-colors duration-150"
                        >
                            Review →
                        </button>
                    )
                }

                return (
                    <span className="text-xs text-gray-600">
                        Assigned
                    </span>
                )
            },
        },
    ]

    return (
        <>
            <PageHeader
                title="Maintenance Flags"
                subtitle="Review and assign reported issues"
            />

            {isLoading && <LoadingSpinner />}

            {isError && (
                <ErrorAlert message="Failed to load maintenance flags." />
            )}

            {!isLoading && !isError && (
                <Table
                    columns={columns}
                    data={flags ?? []}
                    emptyMessage="No maintenance flags."
                />
            )}

            <Modal
                open={!!selectedFlag}
                onClose={() => {
                    setSelectedFlag(null)
                    setTechId('')
                }}
                title="Assign Flag"
            >
                {selectedFlag && (
                    <form onSubmit={handleAssign}>
                        <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                Issue
                            </p>

                            <p className="text-[13px] text-gray-200 leading-snug">
                                {selectedFlag.description ||
                                    selectedFlag.issue ||
                                    selectedFlag.notes ||
                                    selectedFlag.reason ||
                                    'No issue description'}
                            </p>
                        </div>

                        <FormField label="Assign to Maintenance Team">
                            <select
                                value={techId}
                                onChange={(e) => setTechId(e.target.value)}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-gray-700 bg-gray-800 text-sm text-gray-200 outline-none focus:border-amber-400"
                            >
                                <option value="">
                                    {usersLoading
                                        ? 'Loading technicians...'
                                        : 'Select technician'}
                                </option>

                                {maintenanceTeam.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.email} — {user.email}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <SubmitButton loading={assigning}>
                            Assign Flag
                        </SubmitButton>
                    </form>
                )}
            </Modal>

            <Modal
                open={!!approvalFlag}
                onClose={() => {
                    setApprovalFlag(null)
                    setNewMilestoneInterval('')
                    setServiceNotes('')
                }}
                title="Approve Maintenance"
            >
                {approvalFlag && (
                    <form onSubmit={handleApprove}>
                        <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                Vehicle
                            </p>

                            <p className="text-[13px] text-gray-200 leading-snug">
                                {approvalFlag.plateNumber || approvalFlag.vehiclePlate || 'N/A'}
                            </p>
                        </div>

                        <FormField label="New Milestone Interval">
                            <input
                                type="number"
                                min="1"
                                value={newMilestoneInterval}
                                onChange={(e) => setNewMilestoneInterval(e.target.value)}
                                placeholder="e.g. 15000"
                                required
                                className="w-full h-10 px-3 rounded-lg border border-gray-700 bg-gray-800 text-sm text-gray-200 outline-none focus:border-emerald-400"
                            />
                        </FormField>

                        <FormField label="Service Notes">
                            <textarea
                                value={serviceNotes}
                                onChange={(e) => setServiceNotes(e.target.value)}
                                placeholder="Enter service notes..."
                                required
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-gray-200 outline-none focus:border-emerald-400 resize-none"
                            />
                        </FormField>

                        <SubmitButton loading={approving}>
                            Approve Maintenance
                        </SubmitButton>
                    </form>
                )}
            </Modal>
        </>
    )
}