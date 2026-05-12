// import { useState } from 'react'
// import toast from 'react-hot-toast'
// import { useGetMaintenanceFlagsQuery, useAssignFlagMutation } from '../apis/fleetApi.jsx'
// import Table from '../components/Table.jsx'
// import Modal from '../components/Modal'
// import Badge from '../components/Badge'
// import PageHeader from '../components/PageHeader'
// import { FormField, Input, SubmitButton } from '../components/Form'
// import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
// import { formatDate, getErrorMessage } from '../utils/format.js'
//
// export default function MaintenanceScreen() {
//     const { data: flags, isLoading, isError } = useGetMaintenanceFlagsQuery()
//     const [assignFlag, { isLoading: assigning }] = useAssignFlagMutation()
//     const [selectedFlag, setSelectedFlag] = useState(null)
//     const [techId, setTechId] = useState('')
//
//     const handleAssign = async (e) => {
//         e.preventDefault()
//
//         try {
//             await assignFlag({
//                 id: selectedFlag.id,
//                 maintenanceTeamUserId: Number(techId),
//             }).unwrap()
//
//             toast.success('Flag assigned to maintenance team')
//             setSelectedFlag(null)
//             setTechId('')
//         } catch (err) {
//             toast.error(getErrorMessage(err))
//         }
//     }
//
//     const columns = [
//         { key: 'vehiclePlate', label: 'Vehicle' },
//         { key: 'description',  label: 'Issue' },
//         {
//             key: 'status',
//             label: 'Status',
//             render: (row) => <Badge status={row.status} />,
//         },
//         {
//             key: 'reportedAt',
//             label: 'Reported',
//             render: (row) => formatDate(row.reportedAt),
//         },
//         {
//             key: 'actions',
//             label: '',
//             render: (row) =>
//                 row.status === 'OPEN' ? (
//                     <button
//                         onClick={() => setSelectedFlag(row)}
//                         className="text-[12px] text-amber-400 hover:text-amber-300 font-medium transition-colors duration-150"
//                     >
//                         Assign →
//                     </button>
//                 ) : (
//                     <span className="text-xs text-gray-600">Assigned</span>
//                 ),
//         },
//     ]
//
//     return (
//         <>
//
//             <PageHeader title="Maintenance Flags" subtitle="Review and assign reported issues" />
//
//             {isLoading && <LoadingSpinner />}
//             {isError && <ErrorAlert message="Failed to load maintenance flags." />}
//             {!isLoading && !isError && (
//                 <Table columns={columns} data={flags ?? []} emptyMessage="No maintenance flags." />
//             )}
//
//             <Modal open={!!selectedFlag} onClose={() => setSelectedFlag(null)} title="Assign Flag">
//                 {selectedFlag && (
//                     <form onSubmit={handleAssign}>
//                         <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
//                             <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">Issue</p>
//                             <p className="text-[13px] text-gray-200 leading-snug">{selectedFlag.description}</p>
//                         </div>
//                         <FormField label="Technician ID">
//                             <Input
//                                 placeholder="Enter technician user ID"
//                                 value={techId}
//                                 onChange={(e) => setTechId(e.target.value)}
//                                 required
//                             />
//                         </FormField>
//                         <SubmitButton loading={assigning}>Assign Flag</SubmitButton>
//                     </form>
//                 )}
//             </Modal>
//         </>
//     )
// }

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useGetMaintenanceFlagsQuery, useAssignFlagMutation } from '../apis/fleetApi.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { FormField, Input, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function MaintenanceScreen() {

    const {
        data: flags,
        isLoading,
        isError,
        error
    } = useGetMaintenanceFlagsQuery()

    const [assignFlag, { isLoading: assigning }] =
        useAssignFlagMutation()

    const [selectedFlag, setSelectedFlag] = useState(null)

    const [techId, setTechId] = useState('')

    // ✅ Debug logs
    console.log('Maintenance Flags:', flags)
    console.log('Maintenance Error:', error)
    console.log('First Flag:', flags?.[0])

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

    const columns = [
        {
            key: 'vehiclePlate',
            label: 'Vehicle'
        },

        {
            key: 'description',
            label: 'Issue'
        },

        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge status={row.status} />
            ),
        },

        {
            key: 'reportedAt',
            label: 'Reported',
            render: (row) => formatDate(row.reportedAt),
        },

        {
            key: 'actions',
            label: '',
            render: (row) =>
                row.status === 'OPEN' ? (
                    <button
                        onClick={() => setSelectedFlag(row)}
                        className="text-[12px] text-amber-400 hover:text-amber-300 font-medium transition-colors duration-150"
                    >
                        Assign →
                    </button>
                ) : (
                    <span className="text-xs text-gray-600">
                        Assigned
                    </span>
                ),
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
                onClose={() => setSelectedFlag(null)}
                title="Assign Flag"
            >
                {selectedFlag && (
                    <form onSubmit={handleAssign}>

                        <div className="bg-gray-800/40 rounded-xl px-4 py-3.5 mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                Issue
                            </p>

                            <p className="text-[13px] text-gray-200 leading-snug">
                                {selectedFlag.description}
                            </p>
                        </div>

                        <FormField label="Technician ID">
                            <Input
                                placeholder="Enter technician user ID"
                                value={techId}
                                onChange={(e) => setTechId(e.target.value)}
                                required
                            />
                        </FormField>

                        <SubmitButton loading={assigning}>
                            Assign Flag
                        </SubmitButton>

                    </form>
                )}
            </Modal>
        </>
    )
}