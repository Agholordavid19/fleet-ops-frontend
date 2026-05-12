import { useState } from 'react'
import toast from 'react-hot-toast'

import {
    useGetUsersQuery,
    useCreateUserMutation,
    useDeactivateUserMutation,
    useReactivateUserMutation
} from '../apis/fleetApi'

import Table from '../components/Table'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'

import {
    FormField,
    Input,
    Select,
    SubmitButton
} from '../components/Form'

import {
    LoadingSpinner,
    ErrorAlert
} from '../components/Feedback'

import {
    formatDate,
    getErrorMessage
} from '../utils/format.js'

const emptyForm = {
    name: '',
    email: '',
    password: '',
    role: 'FIELD_STAFF'
}

export default function UsersScreen() {

    const {
        data: users,
        isLoading,
        isError
    } = useGetUsersQuery()

    const [createUser, { isLoading: creating }] =
        useCreateUserMutation()

    const [deactivateUser] =
        useDeactivateUserMutation()

    const [reactivateUser] =
        useReactivateUserMutation()

    const [open, setOpen] = useState(false)

    const [form, setForm] = useState(emptyForm)

    const handleChange = (e) => {
        setForm((f) => ({
            ...f,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await createUser(form).unwrap()

            toast.success('User created successfully')

            setForm(emptyForm)
            setOpen(false)

        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleDeactivate = async (id) => {
        try {
            await deactivateUser(id).unwrap()

            toast.success('User deactivated')

        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleReactivate = async (id) => {
        try {
            await reactivateUser(id).unwrap()

            toast.success('User reactivated')

        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const columns = [
        {
            key: 'name',
            label: 'Name'
        },

        {
            key: 'email',
            label: 'Email'
        },

        {
            key: 'role',
            label: 'Role',
            render: (row) => (
                <Badge
                    status={row.role}
                    type="role"
                />
            ),
        },

        {
            key: 'createdAt',
            label: 'Joined',
            render: (row) =>
                formatDate(row.createdAt)
        },

        {
            key: 'active',
            label: 'Status',
            render: (row) => (
                <Badge
                    status={row.active ? 'ACTIVE' : 'INACTIVE'}
                />
            ),
        },

        {
            key: 'actions',
            label: 'Actions',
            render: (row) =>
                row.active ? (
                    <button
                        onClick={() => handleDeactivate(row.id)}
                        className="text-[12px] font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                        Deactivate
                    </button>
                ) : (
                    <button
                        onClick={() => handleReactivate(row.id)}
                        className="text-[12px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Reactivate
                    </button>
                ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Users"
                subtitle="Manage system accounts and roles"
                action={
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-gray-900 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                    >
                        + Add User
                    </button>
                }
            />

            {isLoading && (
                <LoadingSpinner />
            )}

            {isError && (
                <ErrorAlert message="Failed to load users." />
            )}

            {!isLoading && !isError && (
                <Table
                    columns={columns}
                    data={users ?? []}
                    emptyMessage="No users found."
                />
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Create New User"
            >
                <form onSubmit={handleSubmit}>

                    <FormField label="Full Name">
                        <Input
                            name="name"
                            placeholder="Jane Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Email">
                        <Input
                            type="email"
                            name="email"
                            placeholder="jane@fleet.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Password">
                        <Input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Role">
                        <Select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="ADMIN">
                                Admin
                            </option>

                            <option value="FLEET_MANAGER">
                                Fleet Manager
                            </option>

                            <option value="FIELD_STAFF">
                                Field Staff
                            </option>

                            <option value="MAINTENANCE">
                                Maintenance
                            </option>
                        </Select>
                    </FormField>

                    <SubmitButton loading={creating}>
                        Create User
                    </SubmitButton>

                </form>
            </Modal>
        </>
    )
}