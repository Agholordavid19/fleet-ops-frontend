FleetOps Core Service
Core domain service for FleetOps. Manages vehicles, users, trip requests, mileage logs, and maintenance flags.

Base URL: http://localhost:8080

All protected endpoints require a Bearer token:

Authorization: Bearer <token>
Swagger UI (interactive docs): http://localhost:8080/swagger-ui/index.html

Table of Contents
Auth
Users
User Profile
Password Management
Vehicles
Trip Requests
Mileage Logs
Maintenance Flags
Maintenance Chat
Vehicle Assignments
Vehicle Activity Dashboard
Media Management
Admin Reports
Email Notifications
Quick-Start Flow
Auth
POST /api/auth/login
Role: Public

Errors: Returns 401 for wrong email or password (not 500).

Sample 1 — Admin login

{
"email": "admin@fleetops.com",
"password": "Admin@1234"
}
Sample 2 — Field staff login

{
"email": "john.driver@fleetops.com",
"password": "Staff@5678"
}
Response

{
"token": "eyJhbGciOiJIUzI1NiJ9...",
"name": "System Admin",
"email": "admin@fleetops.com",
"role": "ADMIN",
"profileMedia": {
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
}
profileMedia is null if the user has not set a profile picture.

Password Management
PATCH /api/auth/change-password
Role: Any authenticated user

The user must supply their current password for verification. Returns 401 if the current password is wrong.

{
"currentPassword": "OldPass@123",
"newPassword": "NewPass@456"
}
Response: 204 No Content

PATCH /api/admin/users/{id}/reset-password
Role: ADMIN

Hard-sets any user's password without requiring the current one. Use this for account recovery.

Sample 1

{
"newPassword": "Reset@1234"
}
Sample 2

{
"newPassword": "Recover@5678"
}
Response: 204 No Content. Returns 404 if the user ID does not exist.

Users
POST /api/admin/users
Role: ADMIN

Available roles: FIELD_STAFF · FLEET_MANAGER · MAINTENANCE_TEAM · ADMIN

Passing an invalid role value returns 400 with a message listing the accepted values.

Sample 1 — Create a Field Staff

{
"name": "John Adeyemi",
"email": "john.adeyemi@fleetops.com",
"password": "Staff@1234",
"role": "FIELD_STAFF"
}
Sample 2 — Create a Fleet Manager

{
"name": "Sarah Okonkwo",
"email": "sarah.okonkwo@fleetops.com",
"password": "Manager@5678",
"role": "FLEET_MANAGER"
}
Sample 3 — Create a Maintenance Team member

{
"name": "Emeka Nwosu",
"email": "emeka.nwosu@fleetops.com",
"password": "Maint@1234",
"role": "MAINTENANCE_TEAM"
}
GET /api/admin/users
Role: ADMIN

Returns all users including deactivated ones. Each user object includes active (account status) and profileMedia (null if no picture set).

GET /api/admin/users/{id}
Role: ADMIN

PATCH /api/admin/users/{id}/deactivate
Role: ADMIN

Soft-deletes a user account. The user record is retained in the database but the account is blocked from logging in.

Returns 204 No Content on success
Returns 404 if the user does not exist
Returns 409 Conflict if the account is already deactivated
Response: 204 No Content

PATCH /api/admin/users/{id}/reactivate
Role: ADMIN

Restores a previously deactivated account.

Returns 204 No Content on success
Returns 404 if the user does not exist
Returns 409 Conflict if the account is already active
Response: 204 No Content

Deactivated users attempting to log in receive 401 Unauthorized with the message "Account is deactivated. Please contact an administrator."

User Profile
Any authenticated user can view and update their own profile without going through an admin endpoint.

GET /api/users/me
Role: Any authenticated user

Returns the authenticated user's own profile. Includes profileMedia if a profile picture has been set (null otherwise).

Sample Response

{
"id": 3,
"name": "John Adeyemi",
"email": "john.adeyemi@fleetops.com",
"role": "FIELD_STAFF",
"active": true,
"profileMedia": {
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
},
"createdAt": "2026-01-15T08:00:00"
}
PATCH /api/users/me
Role: Any authenticated user

Updates the authenticated user's display name. Email address cannot be changed via this endpoint.

{
"name": "John Adeyemi Jr."
}
PATCH /api/users/me/media
Role: Any authenticated user

Sets or replaces the authenticated user's profile picture (Cloudinary-hosted). Replaces any existing entry.

{
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
Response

{
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
DELETE /api/users/me/media
Role: Any authenticated user

Removes the authenticated user's profile picture. Returns 409 Conflict if no profile media is currently set.

Response: 204 No Content

Vehicles
Each vehicle has a milestone interval — the odometer reading (km) at which a maintenance flag is automatically raised. The default is 3,000 km (configurable via DEFAULT_MILESTONE_INTERVAL env var). This can be overridden per vehicle at creation time or updated later.

Service history is recorded automatically when the fleet manager approves a completed maintenance. See Maintenance Flags.

Plate Number Format
Plate numbers follow the Nigerian private vehicle standard:

KJA-245BX
^^^         — 3-letter LGA registration code (e.g. KJA = Ikeja, Lagos)
^^^     — 3-digit sequence number (001–999)
^^   — 2-letter suffix
Validation rules:

Input is trimmed and converted to uppercase automatically
The 3-letter prefix must be a recognised LGA code (seeded from nigeria_plate_codes.csv on startup)
Sequence number must be between 001 and 999 — 000 is rejected
Returns 400 Bad Request if the format is invalid or the LGA prefix is unrecognised
Returns 409 Conflict if the plate number is already registered
POST /api/vehicles
Role: FLEET_MANAGER, ADMIN

Sample 1 — Use default 3,000 km milestone

{
"make": "Toyota",
"model": "Land Cruiser",
"plateNumber": "KJA-245BX"
}
Sample 2 — Custom milestone

{
"make": "Ford",
"model": "Ranger",
"plateNumber": "PHC-112AA",
"milestoneInterval": 5000
}
GET /api/vehicles
Role: FLEET_MANAGER, ADMIN

Returns all vehicles. Each vehicle includes its mediaFiles array (empty if no photos have been added). serviceHistories is always an empty list on list responses — use GET /api/vehicles/{id} for full history.

GET /api/vehicles/available
Role: FIELD_STAFF, FLEET_MANAGER, ADMIN

Returns vehicles with status AVAILABLE. Each vehicle includes its mediaFiles array. Vehicles under maintenance or currently assigned are excluded.

GET /api/vehicles/{id}
Role: FLEET_MANAGER, ADMIN

Returns the vehicle with its full service history (most recent first).

Sample Response

{
"id": 1,
"make": "Toyota",
"model": "Land Cruiser",
"plateNumber": "KJA-245BX",
"currentMileage": 6200.0,
"milestoneInterval": 6000.0,
"status": "AVAILABLE",
"mediaFiles": [
{
"id": 1,
"publicId": "fleetops/vehicles/v1-front",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v1-front.jpg"
}
],
"serviceHistories": [
{
"id": 1,
"fleetManagerName": "Sarah Okonkwo",
"notes": "Engine oil replaced. Brake pads inspected and cleared.",
"newMilestoneInterval": 6000.0,
"servicedAt": "2026-04-20T14:30:00"
}
],
"registeredAt": "2026-01-10T09:00:00"
}
PATCH /api/vehicles/{id}/milestone-interval
Role: FLEET_MANAGER, ADMIN

Manually updates the mileage threshold that triggers a maintenance flag. Takes effect on the next mileage log submission.

{
"milestoneInterval": 5000
}
Trip Requests
A field staff member submits a trip request for a specific vehicle and date range. Rules:

The vehicle must be AVAILABLE.
The same field staff cannot have two PENDING requests for the same vehicle simultaneously.
When a request is approved, all other PENDING requests for that vehicle whose startDate falls before the approved trip's endDate are automatically rejected.
A cron job runs daily at midnight to auto-reject any PENDING requests whose startDate has already passed.
POST /api/trip-requests
Role: FIELD_STAFF

Sample 1

{
"vehicleId": 2,
"destination": "Lagos Island",
"startDate": "2026-07-10",
"endDate": "2026-07-12"
}
Sample 2

{
"vehicleId": 5,
"destination": "Abuja Central Depot",
"startDate": "2026-07-20",
"endDate": "2026-07-23"
}
GET /api/trip-requests
Role: FLEET_MANAGER — returns PENDING requests only

GET /api/trip-requests/all
Role: FLEET_MANAGER, ADMIN — returns all requests across all statuses

GET /api/trip-requests/my
Role: FIELD_STAFF — returns the authenticated user's own requests across all statuses

GET /api/trip-requests/my/approved
Role: FIELD_STAFF — returns only the authenticated user's APPROVED trips (i.e. the vehicle(s) currently assigned to them)

PATCH /api/trip-requests/{id}/approve
Role: FLEET_MANAGER

Approves a PENDING trip request. Creates a VehicleAssignment, sets the vehicle status to ASSIGNED, and auto-rejects conflicting pending requests for the same vehicle.

PATCH /api/trip-requests/{id}/reject
Role: FLEET_MANAGER

PATCH /api/trip-requests/{id}/complete
Role: FIELD_STAFF (own trip only) · FLEET_MANAGER · ADMIN

Marks an APPROVED trip as completed. Sets the vehicle status back to AVAILABLE.

A field staff member can only complete their own trip — returns 403 Forbidden if they attempt to complete another staff member's trip.
Fleet managers and admins can complete any approved trip, including before the endDate (e.g. early vehicle withdrawal).
Accepts an optional JSON body:

{
"reportedMileage": 4350.0
}
If reportedMileage is supplied it must be ≥ the vehicle's currently recorded mileage — returns 409 otherwise. The vehicle's currentMileage is updated and a MileageLog entry is created in the same request.
If the body is omitted (or reportedMileage is null), the trip completes with no mileage update; a separate POST /api/mileage-logs call can be used afterwards.
Mileage Logs
After a trip is completed (fleet manager calls PATCH /{id}/complete), the field staff submits the vehicle's current odometer reading. This is not a per-trip delta — it is the absolute reading from the vehicle's odometer. The system sets the vehicle's currentMileage directly to this value.

Mileage logging is only permitted after trip completion. The system verifies that the submitting field staff has a COMPLETED trip for that vehicle before accepting the log. Attempting to log mileage without a completed trip returns 409 Conflict.

If the new reading causes the vehicle to cross its configured milestoneInterval, a MaintenanceFlagCreatedEvent is published to Kafka. The consumer creates a maintenance flag, sets the vehicle to MAINTENANCE (blocking future trip requests), and notifies the fleet manager — all asynchronously.

POST /api/mileage-logs
Role: FIELD_STAFF

Sample 1 — Odometer now reads 3,200 km

{
"vehicleId": 2,
"reportedMileage": 3200.0
}
Sample 2 — Odometer now reads 5,850 km (crosses 5,000 km milestone)

{
"vehicleId": 5,
"reportedMileage": 5850.0
}
The reported value must be greater than or equal to the vehicle's currently recorded mileage. Submitting a lower value returns 409.

Response

{
"id": 12,
"vehicleId": 2,
"plateNumber": "LG-245-KJA",
"submittedById": 3,
"submittedByName": "John Adeyemi",
"reportedMileage": 3200.0,
"loggedAt": "2026-05-08T10:15:00"
}
GET /api/mileage-logs/vehicle/{vehicleId}
Role: FLEET_MANAGER, ADMIN — returns logs newest first

Maintenance Flags
A maintenance flag is raised automatically when a vehicle crosses its mileage milestone. The full lifecycle is:

OPEN → ASSIGNED → IN_PROGRESS → PENDING_APPROVAL → RESOLVED
Status	Who sets it	How
OPEN	System (Kafka consumer)	Mileage milestone crossed
ASSIGNED	Fleet manager / Admin	PATCH /{id}/assign
IN_PROGRESS	Maintenance team	PATCH /{id}/progress
PENDING_APPROVAL	Maintenance team	PATCH /{id}/done — notifies fleet manager by email
RESOLVED	Fleet manager / Admin	PATCH /{id}/approve — requires new milestone + service notes
A vehicle blocked by a maintenance flag cannot receive new trip requests until the flag is RESOLVED.

GET /api/maintenance-flags
Role: FLEET_MANAGER, ADMIN

GET /api/maintenance-flags/my
Role: MAINTENANCE_TEAM — returns flags assigned to the current user

PATCH /api/maintenance-flags/{id}/assign
Role: FLEET_MANAGER, ADMIN

Assigns an OPEN flag to a maintenance team member. Sends them an email notification.

{
"maintenanceTeamUserId": 4
}
PATCH /api/maintenance-flags/{id}/progress
Role: MAINTENANCE_TEAM

Updates progress notes and moves the flag to IN_PROGRESS. Notifies the assigned fleet manager.

Sample 1 — Initial update

{
"progressNotes": "Vehicle inspected. Engine oil and filter replaced. Awaiting brake pad delivery."
}
Sample 2 — Follow-up

{
"progressNotes": "Brake pads replaced. Final checks in progress. Vehicle expected ready by end of day."
}
PATCH /api/maintenance-flags/{id}/done
Role: MAINTENANCE_TEAM

Signals that work is complete. Moves the flag to PENDING_APPROVAL and sends an email to the fleet manager requesting approval.

PATCH /api/maintenance-flags/1/done
Authorization: Bearer <token>
PATCH /api/maintenance-flags/{id}/approve
Role: FLEET_MANAGER, ADMIN

Approves a PENDING_APPROVAL flag. Requires:

newMilestoneInterval — must be greater than both the previous milestone interval and the vehicle's current mileage
serviceNotes — description of the work done (stored as a service history record on the vehicle)
On success: creates a ServiceHistory record, updates the vehicle's milestone interval, sets the vehicle to AVAILABLE, and notifies the maintenance team member.

Sample 1

{
"newMilestoneInterval": 6000,
"serviceNotes": "Full service at 3,200 km. Engine oil, oil filter, and air filter replaced. Brake pads inspected — within tolerance."
}
Sample 2

{
"newMilestoneInterval": 10000,
"serviceNotes": "Major service at 5,850 km. Timing belt, spark plugs, and coolant replaced. All systems cleared."
}
Maintenance Chat
Messages sent within a maintenance flag. The conversation is locked once the flag is RESOLVED — no new messages can be posted, but the history remains readable.

POST /api/maintenance-flags/{flagId}/messages
Role: MAINTENANCE_TEAM, FLEET_MANAGER, ADMIN

Sends a message to the flag conversation. Returns 409 Conflict if the flag is RESOLVED.

{
"message": "Brake pads have arrived. Starting installation now."
}
Response (201 Created)

{
"id": 3,
"flagId": 7,
"senderId": 5,
"senderName": "Chidi Nwosu",
"senderRole": "MAINTENANCE_TEAM",
"message": "Brake pads have arrived. Starting installation now.",
"sentAt": "2026-05-10T11:23:00"
}
GET /api/maintenance-flags/{flagId}/messages
Role: MAINTENANCE_TEAM, FLEET_MANAGER, ADMIN

Returns all messages for a flag ordered oldest → newest. Works for both active and RESOLVED flags.

Vehicle Assignments
GET /api/assignments/vehicle/{vehicleId}
Role: FLEET_MANAGER, ADMIN

Returns the assignment history for a vehicle.

Vehicle Activity Dashboard
GET /api/admin/activity-logs
Role: ADMIN

Returns vehicle activity events newest first. Supports optional query parameters.

Parameter	Type	Description
plateNumber	string	Filter by vehicle plate number
date	YYYY-MM-DD	Filter to a single calendar day
Both can be combined: ?plateNumber=KJA-001AB&date=2026-05-10

Sample Response

[
{
"id": 12,
"vehicleId": 2,
"plateNumber": "KJA-001AB",
"eventType": "TRIP_REQUESTED",
"description": "Emeka Obi (FIELD_STAFF) requested vehicle KJA-001AB for destination: Abuja (12 May – 15 May)",
"actorName": "Emeka Obi",
"actorRole": "FIELD_STAFF",
"occurredAt": "2026-05-10T09:14:00"
}
]
Events logged:

Event type	Triggered by
TRIP_REQUESTED	Field staff submits a trip request
TRIP_APPROVED	Fleet manager approves a trip
TRIP_REJECTED	Manual or auto-conflict rejection
MILEAGE_SUBMITTED	Field staff or fleet manager submits odometer reading
MAINTENANCE_SCHEDULED	System — mileage milestone crossed
MAINTENANCE_COMPLETED	Maintenance team marks work done
MILESTONE_UPDATED	Fleet manager approves maintenance + sets new interval
Media Management
Admin can manage any user's profile picture. Fleet managers and admins can manage vehicle photos.

PATCH /api/admin/users/{id}/media
Role: ADMIN

Sets or replaces the profile picture for any user.

{
"publicId": "fleetops/users/profile-456",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-456.jpg"
}
DELETE /api/admin/users/{id}/media
Role: ADMIN

Removes a user's profile picture. Returns 409 Conflict if no media is set.

Response: 204 No Content

POST /api/vehicles/{id}/media
Role: FLEET_MANAGER, ADMIN

Adds one or more photos to a vehicle. Appends to any existing photos.

[
{
"publicId": "fleetops/vehicles/v2-front",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-front.jpg"
},
{
"publicId": "fleetops/vehicles/v2-side",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-side.jpg"
}
]
DELETE /api/vehicles/{id}/media/{mediaId}
Role: FLEET_MANAGER, ADMIN

Removes a specific photo from a vehicle by its media ID. Returns 404 if the media entry is not found on that vehicle.

Response: 204 No Content

Admin Reports
GET /api/admin/reports/utilisation
Role: ADMIN

Sample Response

{
"totalVehicles": 10,
"availableVehicles": 6,
"assignedVehicles": 2,
"maintenanceVehicles": 2,
"totalTripsAllTime": 47,
"pendingTripRequests": 3
}
GET /api/admin/reports/vehicle-health
Role: ADMIN, FLEET_MANAGER

Sample Response

[
{
"vehicleId": 1,
"plateNumber": "KJA-245BX",
"make": "Toyota",
"model": "Land Cruiser",
"currentMileage": 3200.0,
"milestoneInterval": 6000.0,
"status": "AVAILABLE",
"openMaintenanceFlags": 0
},
{
"vehicleId": 3,
"plateNumber": "PHC-112AA",
"make": "Ford",
"model": "Ranger",
"currentMileage": 5850.0,
"milestoneInterval": 5000.0,
"status": "MAINTENANCE",
"openMaintenanceFlags": 1
}
]
Email Notifications
All notifications are sent asynchronously via Kafka and do not block the primary API response.

Event	Recipient
Account created	Newly registered user (welcome email)
Trip request submitted	All fleet managers
Trip request approved	Field staff who submitted
Trip request rejected (manual or auto-conflict)	Field staff who submitted
Maintenance flag assigned	Maintenance team member assigned
Maintenance progress update	Fleet manager who assigned the flag
Maintenance work marked done	Fleet manager who assigned the flag
Maintenance approved	Maintenance team member who did the work
Vehicle mileage milestone reached	All fleet managers
Quick-Start Flow
1.  Login as ADMIN              POST /api/auth/login
2.  Create users                POST /api/admin/users              (one per role)
    └─ reset any password       PATCH /api/admin/users/{id}/reset-password
    3a. (Optional) Change own pwd  PATCH /api/auth/change-password
3.  Login as FLEET_MANAGER      POST /api/auth/login
4.  Register vehicles           POST /api/vehicles
5.  Login as FIELD_STAFF        POST /api/auth/login
6.  Browse available vehicles   GET  /api/vehicles/available
7.  Submit trip request         POST /api/trip-requests
8.  Login as FLEET_MANAGER      POST /api/auth/login
9.  Approve trip                PATCH /api/trip-requests/{id}/approve
10.  Complete trip               PATCH /api/trip-requests/{id}/complete
     └─ optionally include { "reportedMileage": ... } to capture odometer reading inline (skips step 11)
     └─ FLEET_MANAGER / ADMIN can complete any trip; FIELD_STAFF can complete their own
11.  Login as FIELD_STAFF        POST /api/auth/login
12.  Submit mileage log          POST /api/mileage-logs             (if not submitted inline at step 10)
     └─ if milestone crossed → vehicle → MAINTENANCE, fleet manager notified via Kafka
13.  Login as FLEET_MANAGER      POST /api/auth/login
14.  Assign maintenance flag     PATCH /api/maintenance-flags/{id}/assign
15.  Login as MAINTENANCE_TEAM   POST /api/auth/login
16.  Update progress             PATCH /api/maintenance-flags/{id}/progress
17.  Mark work done              PATCH /api/maintenance-flags/{id}/done
     └─ fleet manager notified by email to approve
18.  Login as FLEET_MANAGER      POST /api/auth/login
19.  Approve maintenance         PATCH /api/maintenance-flags/{id}/approve
     └─ service history recorded, vehicle returns to AVAILABLE

# FleetOps Core Service

Core domain service for FleetOps. Manages vehicles, users, trip requests, mileage logs, and maintenance flags.

Base URL: `http://localhost:8080`

All protected endpoints require a Bearer token:
```
Authorization: Bearer <token>
```

Swagger UI (interactive docs): `http://localhost:8080/swagger-ui/index.html`

---

## Table of Contents

- [Auth](#auth)
- [Users](#users)
- [User Profile](#user-profile)
- [Password Management](#password-management)
- [Vehicles](#vehicles)
- [Trip Requests](#trip-requests)
- [Mileage Logs](#mileage-logs)
- [Maintenance Flags](#maintenance-flags)
- [Maintenance Chat](#maintenance-chat)
- [Vehicle Assignments](#vehicle-assignments)
- [Vehicle Activity Dashboard](#vehicle-activity-dashboard)
- [Media Management](#media-management)
- [Admin Reports](#admin-reports)
- [Email Notifications](#email-notifications)
- [Quick-Start Flow](#quick-start-flow)

---

## Auth

### `POST /api/auth/login`
**Role:** Public

**Errors:** Returns `401` for wrong email or password (not 500).

**Sample 1 — Admin login**
```json
{
  "email": "admin@fleetops.com",
  "password": "Admin@1234"
}
```

**Sample 2 — Field staff login**
```json
{
  "email": "john.driver@fleetops.com",
  "password": "Staff@5678"
}
```

**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "name": "System Admin",
  "email": "admin@fleetops.com",
  "role": "ADMIN",
  "profileMedia": {
    "id": 5,
    "publicId": "fleetops/users/profile-123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
  }
}
```

> `profileMedia` is `null` if the user has not set a profile picture.

---

## Password Management

### `PATCH /api/auth/change-password`
**Role:** Any authenticated user

The user must supply their current password for verification. Returns `401` if the current password is wrong.

```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**Response:** `204 No Content`

---

### `PATCH /api/admin/users/{id}/reset-password`
**Role:** `ADMIN`

Hard-sets any user's password without requiring the current one. Use this for account recovery.

**Sample 1**
```json
{
  "newPassword": "Reset@1234"
}
```

**Sample 2**
```json
{
  "newPassword": "Recover@5678"
}
```

**Response:** `204 No Content`. Returns `404` if the user ID does not exist.

---

## Users

### `POST /api/admin/users`
**Role:** `ADMIN`

> Available roles: `FIELD_STAFF` · `FLEET_MANAGER` · `MAINTENANCE_TEAM` · `ADMIN`
>
> Passing an invalid role value returns `400` with a message listing the accepted values.

**Sample 1 — Create a Field Staff**
```json
{
  "name": "John Adeyemi",
  "email": "john.adeyemi@fleetops.com",
  "password": "Staff@1234",
  "role": "FIELD_STAFF"
}
```

**Sample 2 — Create a Fleet Manager**
```json
{
  "name": "Sarah Okonkwo",
  "email": "sarah.okonkwo@fleetops.com",
  "password": "Manager@5678",
  "role": "FLEET_MANAGER"
}
```

**Sample 3 — Create a Maintenance Team member**
```json
{
  "name": "Emeka Nwosu",
  "email": "emeka.nwosu@fleetops.com",
  "password": "Maint@1234",
  "role": "MAINTENANCE_TEAM"
}
```

---

### `GET /api/admin/users`
**Role:** `ADMIN`

Returns all users including deactivated ones. Each user object includes `active` (account status) and `profileMedia` (`null` if no picture set).

---

### `GET /api/admin/users/{id}`
**Role:** `ADMIN`

---

### `PATCH /api/admin/users/{id}/deactivate`
**Role:** `ADMIN`

Soft-deletes a user account. The user record is retained in the database but the account is blocked from logging in.

- Returns `204 No Content` on success
- Returns `404` if the user does not exist
- Returns `409 Conflict` if the account is already deactivated

**Response:** `204 No Content`

---

### `PATCH /api/admin/users/{id}/reactivate`
**Role:** `ADMIN`

Restores a previously deactivated account.

- Returns `204 No Content` on success
- Returns `404` if the user does not exist
- Returns `409 Conflict` if the account is already active

**Response:** `204 No Content`

> Deactivated users attempting to log in receive `401 Unauthorized` with the message `"Account is deactivated. Please contact an administrator."`

---

## User Profile

Any authenticated user can view and update their own profile without going through an admin endpoint.

### `GET /api/users/me`
**Role:** Any authenticated user

Returns the authenticated user's own profile. Includes `profileMedia` if a profile picture has been set (`null` otherwise).

**Sample Response**
```json
{
  "id": 3,
  "name": "John Adeyemi",
  "email": "john.adeyemi@fleetops.com",
  "role": "FIELD_STAFF",
  "active": true,
  "profileMedia": {
    "id": 5,
    "publicId": "fleetops/users/profile-123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
  },
  "createdAt": "2026-01-15T08:00:00"
}
```

---

### `PATCH /api/users/me`
**Role:** Any authenticated user

Updates the authenticated user's display name. Email address cannot be changed via this endpoint.

```json
{
  "name": "John Adeyemi Jr."
}
```

---

### `PATCH /api/users/me/media`
**Role:** Any authenticated user

Sets or replaces the authenticated user's profile picture (Cloudinary-hosted). Replaces any existing entry.

```json
{
  "publicId": "fleetops/users/profile-123",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
```

**Response**
```json
{
  "id": 5,
  "publicId": "fleetops/users/profile-123",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
```

---

### `DELETE /api/users/me/media`
**Role:** Any authenticated user

Removes the authenticated user's profile picture. Returns `409 Conflict` if no profile media is currently set.

**Response:** `204 No Content`

---

## Vehicles

Each vehicle has a **milestone interval** — the odometer reading (km) at which a maintenance flag is automatically raised. The default is **3,000 km** (configurable via `DEFAULT_MILESTONE_INTERVAL` env var). This can be overridden per vehicle at creation time or updated later.

Service history is recorded automatically when the fleet manager approves a completed maintenance. See [Maintenance Flags](#maintenance-flags).

### Plate Number Format

Plate numbers follow the **Nigerian private vehicle standard**:

```
KJA-245BX
^^^         — 3-letter LGA registration code (e.g. KJA = Ikeja, Lagos)
    ^^^     — 3-digit sequence number (001–999)
       ^^   — 2-letter suffix
```

**Validation rules:**
- Input is trimmed and converted to uppercase automatically
- The 3-letter prefix must be a recognised LGA code (seeded from `nigeria_plate_codes.csv` on startup)
- Sequence number must be between `001` and `999` — `000` is rejected
- Returns `400 Bad Request` if the format is invalid or the LGA prefix is unrecognised
- Returns `409 Conflict` if the plate number is already registered

---

### `POST /api/vehicles`
**Role:** `FLEET_MANAGER`, `ADMIN`

**Sample 1 — Use default 3,000 km milestone**
```json
{
  "make": "Toyota",
  "model": "Land Cruiser",
  "plateNumber": "KJA-245BX"
}
```

**Sample 2 — Custom milestone**
```json
{
  "make": "Ford",
  "model": "Ranger",
  "plateNumber": "PHC-112AA",
  "milestoneInterval": 5000
}
```

---

### `GET /api/vehicles`
**Role:** `FLEET_MANAGER`, `ADMIN`

Returns all vehicles. Each vehicle includes its `mediaFiles` array (empty if no photos have been added). `serviceHistories` is always an empty list on list responses — use `GET /api/vehicles/{id}` for full history.

---

### `GET /api/vehicles/available`
**Role:** `FIELD_STAFF`, `FLEET_MANAGER`, `ADMIN`

Returns vehicles with status `AVAILABLE`. Each vehicle includes its `mediaFiles` array. Vehicles under maintenance or currently assigned are excluded.

---

### `GET /api/vehicles/{id}`
**Role:** `FLEET_MANAGER`, `ADMIN`

Returns the vehicle with its full service history (most recent first).

**Sample Response**
```json
{
  "id": 1,
  "make": "Toyota",
  "model": "Land Cruiser",
  "plateNumber": "KJA-245BX",
  "currentMileage": 6200.0,
  "milestoneInterval": 6000.0,
  "status": "AVAILABLE",
  "mediaFiles": [
    {
      "id": 1,
      "publicId": "fleetops/vehicles/v1-front",
      "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v1-front.jpg"
    }
  ],
  "serviceHistories": [
    {
      "id": 1,
      "fleetManagerName": "Sarah Okonkwo",
      "notes": "Engine oil replaced. Brake pads inspected and cleared.",
      "newMilestoneInterval": 6000.0,
      "servicedAt": "2026-04-20T14:30:00"
    }
  ],
  "registeredAt": "2026-01-10T09:00:00"
}
```

---

### `PATCH /api/vehicles/{id}/milestone-interval`
**Role:** `FLEET_MANAGER`, `ADMIN`

Manually updates the mileage threshold that triggers a maintenance flag. Takes effect on the next mileage log submission.

```json
{
  "milestoneInterval": 5000
}
```

---

## Trip Requests

A field staff member submits a trip request for a specific vehicle and date range. Rules:
- The vehicle must be `AVAILABLE`.
- The same field staff cannot have two `PENDING` requests for the same vehicle simultaneously.
- When a request is approved, all other `PENDING` requests for that vehicle whose `startDate` falls before the approved trip's `endDate` are automatically rejected.
- A cron job runs daily at midnight to auto-reject any `PENDING` requests whose `startDate` has already passed.

### `POST /api/trip-requests`
**Role:** `FIELD_STAFF`

**Sample 1**
```json
{
  "vehicleId": 2,
  "destination": "Lagos Island",
  "startDate": "2026-07-10",
  "endDate": "2026-07-12"
}
```

**Sample 2**
```json
{
  "vehicleId": 5,
  "destination": "Abuja Central Depot",
  "startDate": "2026-07-20",
  "endDate": "2026-07-23"
}
```

---

### `GET /api/trip-requests`
**Role:** `FLEET_MANAGER` — returns `PENDING` requests only

---

### `GET /api/trip-requests/all`
**Role:** `FLEET_MANAGER`, `ADMIN` — returns all requests across all statuses

---

### `GET /api/trip-requests/my`
**Role:** `FIELD_STAFF` — returns the authenticated user's own requests across all statuses

---

### `GET /api/trip-requests/my/approved`
**Role:** `FIELD_STAFF` — returns only the authenticated user's `APPROVED` trips (i.e. the vehicle(s) currently assigned to them)

---

### `PATCH /api/trip-requests/{id}/approve`
**Role:** `FLEET_MANAGER`

Approves a `PENDING` trip request. Creates a `VehicleAssignment`, sets the vehicle status to `ASSIGNED`, and auto-rejects conflicting pending requests for the same vehicle.

---

### `PATCH /api/trip-requests/{id}/reject`
**Role:** `FLEET_MANAGER`

---

### `PATCH /api/trip-requests/{id}/complete`
**Role:** `FIELD_STAFF` (own trip only) · `FLEET_MANAGER` · `ADMIN`

Marks an `APPROVED` trip as completed. Sets the vehicle status back to `AVAILABLE`.

- A field staff member can only complete **their own** trip — returns `403 Forbidden` if they attempt to complete another staff member's trip.
- Fleet managers and admins can complete **any** approved trip, including before the `endDate` (e.g. early vehicle withdrawal).

Accepts an **optional** JSON body:
```json
{
  "reportedMileage": 4350.0
}
```

- If `reportedMileage` is supplied it must be **≥** the vehicle's currently recorded mileage — returns `409` otherwise. The vehicle's `currentMileage` is updated and a `MileageLog` entry is created in the same request.
- If the body is omitted (or `reportedMileage` is `null`), the trip completes with no mileage update; a separate `POST /api/mileage-logs` call can be used afterwards.

---

## Mileage Logs

After a trip is completed (fleet manager calls `PATCH /{id}/complete`), the field staff submits the vehicle's current **odometer reading**. This is not a per-trip delta — it is the absolute reading from the vehicle's odometer. The system sets the vehicle's `currentMileage` directly to this value.

**Mileage logging is only permitted after trip completion.** The system verifies that the submitting field staff has a `COMPLETED` trip for that vehicle before accepting the log. Attempting to log mileage without a completed trip returns `409 Conflict`.

If the new reading causes the vehicle to cross its configured `milestoneInterval`, a `MaintenanceFlagCreatedEvent` is published to Kafka. The consumer creates a maintenance flag, sets the vehicle to `MAINTENANCE` (blocking future trip requests), and notifies the fleet manager — all asynchronously.

### `POST /api/mileage-logs`
**Role:** `FIELD_STAFF`

**Sample 1 — Odometer now reads 3,200 km**
```json
{
  "vehicleId": 2,
  "reportedMileage": 3200.0
}
```

**Sample 2 — Odometer now reads 5,850 km (crosses 5,000 km milestone)**
```json
{
  "vehicleId": 5,
  "reportedMileage": 5850.0
}
```

> The reported value must be greater than or equal to the vehicle's currently recorded mileage. Submitting a lower value returns `409`.

**Response**
```json
{
  "id": 12,
  "vehicleId": 2,
  "plateNumber": "LG-245-KJA",
  "submittedById": 3,
  "submittedByName": "John Adeyemi",
  "reportedMileage": 3200.0,
  "loggedAt": "2026-05-08T10:15:00"
}
```

---

### `GET /api/mileage-logs/vehicle/{vehicleId}`
**Role:** `FLEET_MANAGER`, `ADMIN` — returns logs newest first

---

## Maintenance Flags

A maintenance flag is raised automatically when a vehicle crosses its mileage milestone. The full lifecycle is:

```
OPEN → ASSIGNED → IN_PROGRESS → PENDING_APPROVAL → RESOLVED
```

| Status | Who sets it | How |
|---|---|---|
| `OPEN` | System (Kafka consumer) | Mileage milestone crossed |
| `ASSIGNED` | Fleet manager / Admin | `PATCH /{id}/assign` |
| `IN_PROGRESS` | Maintenance team | `PATCH /{id}/progress` |
| `PENDING_APPROVAL` | Maintenance team | `PATCH /{id}/done` — notifies fleet manager by email |
| `RESOLVED` | Fleet manager / Admin | `PATCH /{id}/approve` — requires new milestone + service notes |

> A vehicle blocked by a maintenance flag cannot receive new trip requests until the flag is `RESOLVED`.

---

### `GET /api/maintenance-flags`
**Role:** `FLEET_MANAGER`, `ADMIN`

---

### `GET /api/maintenance-flags/my`
**Role:** `MAINTENANCE_TEAM` — returns flags assigned to the current user

---

### `PATCH /api/maintenance-flags/{id}/assign`
**Role:** `FLEET_MANAGER`, `ADMIN`

Assigns an `OPEN` flag to a maintenance team member. Sends them an email notification.

```json
{
  "maintenanceTeamUserId": 4
}
```

---

### `PATCH /api/maintenance-flags/{id}/progress`
**Role:** `MAINTENANCE_TEAM`

Updates progress notes and moves the flag to `IN_PROGRESS`. Notifies the assigned fleet manager.

**Sample 1 — Initial update**
```json
{
  "progressNotes": "Vehicle inspected. Engine oil and filter replaced. Awaiting brake pad delivery."
}
```

**Sample 2 — Follow-up**
```json
{
  "progressNotes": "Brake pads replaced. Final checks in progress. Vehicle expected ready by end of day."
}
```

---

### `PATCH /api/maintenance-flags/{id}/done`
**Role:** `MAINTENANCE_TEAM`

Signals that work is complete. Moves the flag to `PENDING_APPROVAL` and sends an email to the fleet manager requesting approval.

```
PATCH /api/maintenance-flags/1/done
Authorization: Bearer <token>
```

---

### `PATCH /api/maintenance-flags/{id}/approve`
**Role:** `FLEET_MANAGER`, `ADMIN`

Approves a `PENDING_APPROVAL` flag. Requires:
- `newMilestoneInterval` — must be greater than both the previous milestone interval and the vehicle's current mileage
- `serviceNotes` — description of the work done (stored as a service history record on the vehicle)

On success: creates a `ServiceHistory` record, updates the vehicle's milestone interval, sets the vehicle to `AVAILABLE`, and notifies the maintenance team member.

**Sample 1**
```json
{
  "newMilestoneInterval": 6000,
  "serviceNotes": "Full service at 3,200 km. Engine oil, oil filter, and air filter replaced. Brake pads inspected — within tolerance."
}
```

**Sample 2**
```json
{
  "newMilestoneInterval": 10000,
  "serviceNotes": "Major service at 5,850 km. Timing belt, spark plugs, and coolant replaced. All systems cleared."
}
```

---

## Maintenance Chat

Messages sent within a maintenance flag. The conversation is locked once the flag is `RESOLVED` — no new messages can be posted, but the history remains readable.

### `POST /api/maintenance-flags/{flagId}/messages`
**Role:** `MAINTENANCE_TEAM`, `FLEET_MANAGER`, `ADMIN`

Sends a message to the flag conversation. Returns `409 Conflict` if the flag is `RESOLVED`.

```json
{
  "message": "Brake pads have arrived. Starting installation now."
}
```

**Response (201 Created)**
```json
{
  "id": 3,
  "flagId": 7,
  "senderId": 5,
  "senderName": "Chidi Nwosu",
  "senderRole": "MAINTENANCE_TEAM",
  "message": "Brake pads have arrived. Starting installation now.",
  "sentAt": "2026-05-10T11:23:00"
}
```

---

### `GET /api/maintenance-flags/{flagId}/messages`
**Role:** `MAINTENANCE_TEAM`, `FLEET_MANAGER`, `ADMIN`

Returns all messages for a flag ordered oldest → newest. Works for both active and `RESOLVED` flags.

---

## Vehicle Assignments

### `GET /api/assignments/vehicle/{vehicleId}`
**Role:** `FLEET_MANAGER`, `ADMIN`

Returns the assignment history for a vehicle.

---

## Vehicle Activity Dashboard

### `GET /api/admin/activity-logs`
**Role:** `ADMIN`

Returns vehicle activity events newest first. Supports optional query parameters.

| Parameter | Type | Description |
|---|---|---|
| `plateNumber` | string | Filter by vehicle plate number |
| `date` | `YYYY-MM-DD` | Filter to a single calendar day |

Both can be combined: `?plateNumber=KJA-001AB&date=2026-05-10`

**Sample Response**
```json
[
  {
    "id": 12,
    "vehicleId": 2,
    "plateNumber": "KJA-001AB",
    "eventType": "TRIP_REQUESTED",
    "description": "Emeka Obi (FIELD_STAFF) requested vehicle KJA-001AB for destination: Abuja (12 May – 15 May)",
    "actorName": "Emeka Obi",
    "actorRole": "FIELD_STAFF",
    "occurredAt": "2026-05-10T09:14:00"
  }
]
```

**Events logged:**

| Event type | Triggered by |
|---|---|
| `TRIP_REQUESTED` | Field staff submits a trip request |
| `TRIP_APPROVED` | Fleet manager approves a trip |
| `TRIP_REJECTED` | Manual or auto-conflict rejection |
| `MILEAGE_SUBMITTED` | Field staff or fleet manager submits odometer reading |
| `MAINTENANCE_SCHEDULED` | System — mileage milestone crossed |
| `MAINTENANCE_COMPLETED` | Maintenance team marks work done |
| `MILESTONE_UPDATED` | Fleet manager approves maintenance + sets new interval |

---

## Media Management

Admin can manage any user's profile picture. Fleet managers and admins can manage vehicle photos.

### `PATCH /api/admin/users/{id}/media`
**Role:** `ADMIN`

Sets or replaces the profile picture for any user.

```json
{
  "publicId": "fleetops/users/profile-456",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-456.jpg"
}
```

---

### `DELETE /api/admin/users/{id}/media`
**Role:** `ADMIN`

Removes a user's profile picture. Returns `409 Conflict` if no media is set.

**Response:** `204 No Content`

---

### `POST /api/vehicles/{id}/media`
**Role:** `FLEET_MANAGER`, `ADMIN`

Adds one or more photos to a vehicle. Appends to any existing photos.

```json
[
  {
    "publicId": "fleetops/vehicles/v2-front",
    "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-front.jpg"
  },
  {
    "publicId": "fleetops/vehicles/v2-side",
    "url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-side.jpg"
  }
]
```

---

### `DELETE /api/vehicles/{id}/media/{mediaId}`
**Role:** `FLEET_MANAGER`, `ADMIN`

Removes a specific photo from a vehicle by its media ID. Returns `404` if the media entry is not found on that vehicle.

**Response:** `204 No Content`

---

## Admin Reports

### `GET /api/admin/reports/utilisation`
**Role:** `ADMIN`

**Sample Response**
```json
{
  "totalVehicles": 10,
  "availableVehicles": 6,
  "assignedVehicles": 2,
  "maintenanceVehicles": 2,
  "totalTripsAllTime": 47,
  "pendingTripRequests": 3
}
```

---

### `GET /api/admin/reports/vehicle-health`
**Role:** `ADMIN`, `FLEET_MANAGER`

**Sample Response**
```json
[
  {
    "vehicleId": 1,
    "plateNumber": "KJA-245BX",
    "make": "Toyota",
    "model": "Land Cruiser",
    "currentMileage": 3200.0,
    "milestoneInterval": 6000.0,
    "status": "AVAILABLE",
    "openMaintenanceFlags": 0
  },
  {
    "vehicleId": 3,
    "plateNumber": "PHC-112AA",
    "make": "Ford",
    "model": "Ranger",
    "currentMileage": 5850.0,
    "milestoneInterval": 5000.0,
    "status": "MAINTENANCE",
    "openMaintenanceFlags": 1
  }
]
```

---

## Email Notifications

All notifications are sent **asynchronously** via Kafka and do not block the primary API response.

| Event                                            | Recipient                                      |
|--------------------------------------------------|------------------------------------------------|
| Account created                                  | Newly registered user (welcome email)          |
| Trip request submitted                           | All fleet managers                             |
| Trip request approved                            | Field staff who submitted                      |
| Trip request rejected (manual or auto-conflict)  | Field staff who submitted                      |
| Maintenance flag assigned                        | Maintenance team member assigned               |
| Maintenance progress update                      | Fleet manager who assigned the flag            |
| Maintenance work marked done                     | Fleet manager who assigned the flag            |
| Maintenance approved                             | Maintenance team member who did the work       |
| Vehicle mileage milestone reached                | All fleet managers                             |

---

## Quick-Start Flow

```
 1.  Login as ADMIN              POST /api/auth/login
 2.  Create users                POST /api/admin/users              (one per role)
     └─ reset any password       PATCH /api/admin/users/{id}/reset-password
 3a. (Optional) Change own pwd  PATCH /api/auth/change-password
 3.  Login as FLEET_MANAGER      POST /api/auth/login
 4.  Register vehicles           POST /api/vehicles
 5.  Login as FIELD_STAFF        POST /api/auth/login
 6.  Browse available vehicles   GET  /api/vehicles/available
 7.  Submit trip request         POST /api/trip-requests
 8.  Login as FLEET_MANAGER      POST /api/auth/login
 9.  Approve trip                PATCH /api/trip-requests/{id}/approve
10.  Complete trip               PATCH /api/trip-requests/{id}/complete
     └─ optionally include { "reportedMileage": ... } to capture odometer reading inline (skips step 11)
     └─ FLEET_MANAGER / ADMIN can complete any trip; FIELD_STAFF can complete their own
11.  Login as FIELD_STAFF        POST /api/auth/login
12.  Submit mileage log          POST /api/mileage-logs             (if not submitted inline at step 10)
     └─ if milestone crossed → vehicle → MAINTENANCE, fleet manager notified via Kafka
13.  Login as FLEET_MANAGER      POST /api/auth/login
14.  Assign maintenance flag     PATCH /api/maintenance-flags/{id}/assign
15.  Login as MAINTENANCE_TEAM   POST /api/auth/login
16.  Update progress             PATCH /api/maintenance-flags/{id}/progress
17.  Mark work done              PATCH /api/maintenance-flags/{id}/done
     └─ fleet manager notified by email to approve
18.  Login as FLEET_MANAGER      POST /api/auth/login
19.  Approve maintenance         PATCH /api/maintenance-flags/{id}/approve
     └─ service history recorded, vehicle returns to AVAILABLE
```
# FleetOps Core Service — User Stories

Generated from product requirements and system design discussions.

---

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Password Management](#password-management)
- [Vehicle Management](#vehicle-management)
- [Trip Requests](#trip-requests)
- [Mileage Reporting](#mileage-reporting)
- [Maintenance Management](#maintenance-management)
- [Maintenance Chat](#maintenance-chat)
- [Service History](#service-history)
- [Notifications](#notifications)
- [Vehicle Activity Dashboard](#vehicle-activity-dashboard)
- [Media Management](#media-management)
- [User Profile](#user-profile)
- [Observability](#observability)
- [Reliability](#reliability)

---

## Authentication

### US-001 — Login with valid credentials
**As a** user (any role),
**I want to** log in with my email and password,
**So that** I receive a JWT token to access the system.

**Acceptance Criteria:**
- `POST /api/auth/login` accepts `{ email, password }`
- Returns a JWT token, the user's email, and their role on success
- Returns `401 Unauthorized` with message `"Invalid email or password"` for wrong credentials
- Does **not** return `500 Internal Server Error` for authentication failures

---

## User Management

### US-002 — Create a user account
**As an** Admin,
**I want to** create user accounts and assign roles,
**So that** staff members can access the system with the correct permissions.

**Acceptance Criteria:**
- `POST /api/admin/users` accepts `{ name, email, password, role }`
- Available roles: `FIELD_STAFF`, `FLEET_MANAGER`, `MAINTENANCE_TEAM`, `ADMIN`
- Passing an invalid role value (e.g. `"_STAFF"`) returns `400 Bad Request` listing accepted values — not `500`
- Duplicate email returns `409 Conflict`
- Password is stored as a BCrypt hash, never plain text

---

### US-003 — View all users
**As an** Admin,
**I want to** retrieve a list of all registered users,
**So that** I can manage the system's user base.

**Acceptance Criteria:**
- `GET /api/admin/users` returns all users
- `GET /api/admin/users/{id}` returns a single user or `404` if not found
- Both endpoints are restricted to `ADMIN` only

---

### US-026 — Deactivate and reactivate a user account
**As an** Admin,
**I want to** deactivate or reactivate any user account,
**So that** I can revoke access without permanently deleting the user's history.

**Acceptance Criteria:**
- `PATCH /api/admin/users/{id}/deactivate` soft-deletes the account (sets `active = false`)
    - Returns `404` if the user does not exist
    - Returns `409 Conflict` if the account is already deactivated
    - Returns `204 No Content` on success
- `PATCH /api/admin/users/{id}/reactivate` restores the account (sets `active = true`)
    - Returns `404` if the user does not exist
    - Returns `409 Conflict` if the account is already active
    - Returns `204 No Content` on success
- A deactivated user attempting to log in receives `401 Unauthorized` with message `"Account is deactivated. Please contact an administrator."`
- `GET /api/admin/users` returns all users (active and inactive) with an `active` field so the admin can identify and reactivate accounts
- Only active fleet managers receive email notifications (mileage milestones, new trip requests)
- Restricted to `ADMIN` only

---

## Password Management

### US-004 — Change own password
**As an** authenticated user (any role),
**I want to** change my own password,
**So that** I can maintain my account security.

**Acceptance Criteria:**
- `PATCH /api/auth/change-password` accepts `{ currentPassword, newPassword }`
- Current password must be verified before the new one is set
- Returns `401` if the current password is incorrect
- Returns `204 No Content` on success
- New password is stored as a BCrypt hash

---

### US-005 — Admin resets any user's password
**As an** Admin,
**I want to** hard-set any user's password without requiring their current one,
**So that** I can recover locked or compromised accounts.

**Acceptance Criteria:**
- `PATCH /api/admin/users/{id}/reset-password` accepts `{ newPassword }`
- No current password verification required
- Returns `404` if the user does not exist
- Returns `204 No Content` on success
- Restricted to `ADMIN` only

---

## Vehicle Management

### US-006 — Register a vehicle
**As a** Fleet Manager or Admin,
**I want to** register a vehicle in the system,
**So that** it can be tracked, requested, and maintained.

**Acceptance Criteria:**
- `POST /api/vehicles` accepts `{ make, model, plateNumber, milestoneInterval? }`
- If `milestoneInterval` is not provided, defaults to the value in `application.yml` (`3000` km, configurable via `DEFAULT_MILESTONE_INTERVAL` env var)
- Duplicate plate number returns `409 Conflict`
- Both `FLEET_MANAGER` and `ADMIN` roles can register vehicles
- Plate number is validated per US-027 before registration

---

### US-027 — Nigerian plate number validation
**As a** Fleet Manager or Admin,
**I want** the system to validate plate numbers against the Nigerian vehicle registration standard,
**So that** only correctly formatted plates with recognised LGA codes are accepted.

**Acceptance Criteria:**
- Plate number format: `ABC-123DE` — 3-letter LGA code, hyphen, 3-digit sequence (001–999), 2-letter suffix
- Input is trimmed and uppercased automatically before validation
- The 3-letter prefix must exist in the `lga_codes` table (seeded from `nigeria_plate_codes.csv` at startup)
- Sequence number `000` is rejected; valid range is `001–999`
- Returns `400 Bad Request` if format is invalid or LGA prefix is unrecognised
- The normalised (trimmed, uppercased) value is stored in the database
- LGA codes are seeded once on startup; re-seeding is skipped if the table already has records

---

### US-007 — View vehicles
**As a** Fleet Manager or Admin,
**I want to** view all vehicles and their current status,
**So that** I can manage the fleet.

**Acceptance Criteria:**
- `GET /api/vehicles` returns all vehicles (no service histories on list responses)
- `GET /api/vehicles/available` returns only `AVAILABLE` vehicles (accessible to `FIELD_STAFF` as well)
- `GET /api/vehicles/{id}` returns the vehicle with its full service history (most recent first)
- Vehicles under `MAINTENANCE` or `ASSIGNED` do **not** appear in the available list

---

### US-008 — Update milestone interval
**As a** Fleet Manager or Admin,
**I want to** update the mileage threshold that triggers a maintenance flag for a vehicle,
**So that** I can customise the service schedule per vehicle.

**Acceptance Criteria:**
- `PATCH /api/vehicles/{id}/milestone-interval` accepts `{ milestoneInterval }` (minimum 100 km)
- Takes effect immediately on the next mileage log submission
- Returns `404` if the vehicle is not found

---

## Trip Requests

> **Design Decision — Why vehicle availability is not time-based**
>
> A reasonable question is: why does approving a trip request two months in the future
> immediately set the vehicle to `ASSIGNED` and block all other requests, rather than
> allowing the vehicle to be assigned to other trips in the intervening period?
>
> The decision was deliberate. The system relies on the **fleet manager's judgement** about
> the health and readiness of each vehicle. When a fleet manager approves a future trip,
> they are asserting that the vehicle will be fit for that trip — which implicitly means
> it should not be subjected to additional wear from other trips in the lead-up period.
> Allowing the vehicle to be assigned to intermediate trips would undermine that health
> guarantee and could leave the vehicle unfit for the originally approved journey.
>
> Time-based slot availability (where a vehicle can be re-assigned in windows between
> approved trips) is noted as a future enhancement, but it would require the fleet manager
> to actively reason about cumulative mileage and maintenance windows — a complexity
> that is out of scope for the current system design.

### US-009 — Submit a trip request
**As a** Field Staff member,
**I want to** request a vehicle for a specific destination and date range,
**So that** I can get approval to use the vehicle for my assignment.

**Acceptance Criteria:**
- `POST /api/trip-requests` accepts `{ vehicleId, destination, startDate, endDate }`
- The vehicle must have status `AVAILABLE` — returns `400` otherwise
- The same field staff member cannot have two `PENDING` requests for the same vehicle simultaneously — returns `409`
- If the vehicle has an overlapping approved assignment for the same dates — returns `409`
- Created request starts in `PENDING` status

---

### US-010 — Approve or reject a trip request
**As a** Fleet Manager or Admin,
**I want to** approve or reject pending trip requests,
**So that** vehicle usage is controlled and tracked.

**Acceptance Criteria:**
- `PATCH /api/trip-requests/{id}/approve` — approves a `PENDING` request
    - Creates a `VehicleAssignment` record
    - Sets vehicle status to `ASSIGNED`
    - Notifies the field staff member by email
    - Auto-rejects all other `PENDING` requests for the same vehicle where the approved trip's `endDate` is after their `startDate`
    - Rejected field staff members are notified by email
- `PATCH /api/trip-requests/{id}/reject` — rejects a `PENDING` request
    - Notifies the field staff member by email
- Both endpoints restricted to `FLEET_MANAGER` and `ADMIN`
- Both return `409` if the request is not in `PENDING` status

---

### US-011 — Complete a trip (with optional mileage submission)
**As a** Field Staff member or Fleet Manager,
**I want to** mark an approved trip as completed — and optionally record the odometer reading at that moment,
**So that** the vehicle is returned to the available pool and mileage can be captured in a single action.

> **Design Decision — No date gate on trip completion**
>
> The system deliberately does **not** enforce that a trip can only be completed on or after its
> `endDate`. Real-world operations rarely follow a rigid schedule — a field trip may finish early,
> conditions may change mid-journey, or a fleet manager may need to withdraw a vehicle before the
> original end date (equipment fault, re-prioritisation, etc.). Blocking completion until the
> proposed end date would force workarounds and break legitimate workflows.
>
> The `endDate` on a trip request exists to signal **intent** and to detect date conflicts during
> approval — it is not a hard lock on when completion can occur.

**Acceptance Criteria:**
- `PATCH /api/trip-requests/{id}/complete` — only works on `APPROVED` trips; returns `409` otherwise
- Accessible by **`FIELD_STAFF`**, `FLEET_MANAGER`, and `ADMIN`
    - A field staff member can only complete **their own** trip — returns `403` if they attempt to complete another staff member's trip
    - Fleet managers and admins can complete **any** approved trip (supports early vehicle withdrawal)
- No date restriction — the trip may be completed before, on, or after its `endDate`
- Sets vehicle status back to `AVAILABLE`
- Accepts an **optional** request body `{ "reportedMileage": <double> }`
    - If `reportedMileage` is provided:
        - Must be **≥** the vehicle's current recorded mileage — returns `409` if lower
        - Updates the vehicle's `currentMileage` to the reported value
        - Creates a `MileageLog` entry attributed to the caller
        - Triggers a maintenance event if the new mileage crosses the configured milestone interval
    - If omitted (body is absent or `reportedMileage` is null), the trip completes with no mileage update
- The inline mileage path bypasses the standalone "must have a completed trip" guard because the trip is being completed in the same request

---

### US-012 — View trip requests
**As a** Fleet Manager or Admin,
**I want to** view trip requests,
**So that** I can manage the approval queue.

**Acceptance Criteria:**
- `GET /api/trip-requests` — returns `PENDING` requests only (`FLEET_MANAGER`)
- `GET /api/trip-requests/all` — returns all requests across all statuses (`FLEET_MANAGER`, `ADMIN`)
- `GET /api/trip-requests/my` — field staff sees all their own requests across all statuses
- `GET /api/trip-requests/my/approved` — field staff sees only their currently `APPROVED` trips (the vehicle(s) assigned to them)

---

### US-013 — Auto-expire stale pending requests (Cron Job)
**As the** system,
**I want to** automatically reject pending trip requests whose start date has passed,
**So that** the approval queue does not accumulate requests that can never be fulfilled.

**Acceptance Criteria:**
- A scheduled job runs daily at midnight (`0 0 0 * * *`)
- Finds all `PENDING` requests where `startDate < today`
- Sets their status to `REJECTED`
- Logs the count of auto-rejected requests

---

## Mileage Reporting

> **Design Decision — What mileage tracking is (and is not) for**
>
> Mileage reporting in this system has a **single purpose**: determining when a vehicle is due for
> scheduled maintenance based on kilometres covered. When the vehicle's cumulative odometer reading
> crosses a configured threshold (`milestoneInterval`), the system automatically raises a maintenance
> flag and notifies the fleet manager.
>
> Mileage is **not** used to:
> - Detect or flag stolen vehicles
> - Verify that a vehicle stayed within a trip's intended route or distance
> - Produce per-trip distance reports
>
> The `reportedMileage` value is an **absolute odometer reading** — not a per-trip delta. The system
> trusts the field staff to report the actual instrument reading. Accuracy is expected by policy, not
> enforced by GPS or external data sources.

### US-014 — Submit an odometer reading
**As a** Field Staff member,
**I want to** report the vehicle's odometer reading after a completed trip,
**So that** the system can track cumulative mileage and trigger maintenance when needed.

**Acceptance Criteria:**
- `POST /api/mileage-logs` accepts `{ vehicleId, reportedMileage }`
- `reportedMileage` is the **absolute odometer value** — not a per-trip delta
- The submitting field staff must have a `COMPLETED` trip for that vehicle — returns `409` otherwise
- Submitted value must be **≥** the vehicle's currently recorded mileage — returns `409` if lower
- Vehicle's `currentMileage` is set directly to the reported value
- Returns an instant `200` response confirming the submission
- Maintenance flagging and fleet manager notification happen **asynchronously** in the background via Kafka

---

### US-015 — Auto-trigger maintenance on milestone
**As the** system,
**I want to** automatically flag a vehicle for maintenance when its odometer reading crosses the configured milestone interval,
**So that** vehicles are serviced on schedule without manual tracking.

**Acceptance Criteria:**
- When `reportedMileage` causes `floor(new / interval) > floor(old / interval)`, a maintenance event is published to Kafka
- The Kafka consumer creates a `MaintenanceFlag` record and sets the vehicle status to `MAINTENANCE`
- The vehicle is **blocked** from new trip requests while in `MAINTENANCE` status
- The fleet manager is notified by email

---

### US-016 — View mileage history for a vehicle
**As a** Fleet Manager or Admin,
**I want to** view the mileage log history for a vehicle,
**So that** I can audit usage over time.

**Acceptance Criteria:**
- `GET /api/mileage-logs/vehicle/{vehicleId}` returns logs sorted newest first
- Returns `404` if the vehicle does not exist
- Restricted to `FLEET_MANAGER` and `ADMIN`

---

## Maintenance Management

### US-017 — Assign a maintenance flag to a team member
**As a** Fleet Manager or Admin,
**I want to** assign an open maintenance flag to a maintenance team member,
**So that** the work is tracked and the right person is notified.

**Acceptance Criteria:**
- `PATCH /api/maintenance-flags/{id}/assign` accepts `{ maintenanceTeamUserId }`
- Flag must be in `OPEN` status — returns `409` otherwise
- Sets flag status to `ASSIGNED`, records who assigned it and when
- Sends an email notification to the assigned maintenance team member
- Restricted to `FLEET_MANAGER` and `ADMIN`

---

### US-018 — Update maintenance progress
**As a** Maintenance Team member,
**I want to** update my progress notes on a maintenance flag,
**So that** the fleet manager can see what work has been done.

**Acceptance Criteria:**
- `PATCH /api/maintenance-flags/{id}/progress` accepts `{ progressNotes }`
- Flag must be in `ASSIGNED` or `IN_PROGRESS` status — returns `409` otherwise
- Sets flag status to `IN_PROGRESS`
- Notifies the assigning fleet manager by email
- Restricted to `MAINTENANCE_TEAM`

---

### US-019 — Signal maintenance work is complete
**As a** Maintenance Team member,
**I want to** mark my maintenance work as done and alert the fleet manager,
**So that** the fleet manager knows to review and approve the vehicle's return to service.

**Acceptance Criteria:**
- `PATCH /api/maintenance-flags/{id}/done` (no request body)
- Flag must be in `ASSIGNED` or `IN_PROGRESS` status — returns `409` otherwise
- Sets flag status to `PENDING_APPROVAL`, records the timestamp
- Sends an email notification to the assigning fleet manager requesting approval
- Restricted to `MAINTENANCE_TEAM`

---

### US-020 — Approve maintenance and return vehicle to service
**As a** Fleet Manager or Admin,
**I want to** approve a completed maintenance job and set a new mileage milestone,
**So that** the vehicle is returned to service with an updated service schedule.

**Acceptance Criteria:**
- `PATCH /api/maintenance-flags/{id}/approve` accepts `{ newMilestoneInterval, serviceNotes }`
- Flag must be in `PENDING_APPROVAL` status — returns `409` otherwise
- `newMilestoneInterval` must be **greater than** both the previous interval and the vehicle's current mileage — returns `409` otherwise
- Creates a `ServiceHistory` record on the vehicle (stores fleet manager's full name, notes, new interval, and timestamp)
- Updates the vehicle's `milestoneInterval` to the new value
- Sets vehicle status back to `AVAILABLE`
- Sets flag status to `RESOLVED`, records resolved timestamp
- Notifies the maintenance team member by email that the approval went through
- Restricted to `FLEET_MANAGER` and `ADMIN`

---

### US-021 — View maintenance flags
**As a** Fleet Manager or Admin,
**I want to** view all maintenance flags,
**So that** I can monitor the health of the fleet.

**Acceptance Criteria:**
- `GET /api/maintenance-flags` returns all flags with their current status
- `GET /api/maintenance-flags/my` returns only flags assigned to the authenticated maintenance team member
- Flag status lifecycle: `OPEN → ASSIGNED → IN_PROGRESS → PENDING_APPROVAL → RESOLVED`

---

## Service History

### US-022 — View a vehicle's service history
**As a** Fleet Manager or Admin,
**I want to** view the full service history of a vehicle,
**So that** I can audit past maintenance work.

**Acceptance Criteria:**
- `GET /api/vehicles/{id}` includes a `serviceHistories` list sorted newest first
- Each entry contains: fleet manager's full name, service notes, new milestone interval set, and service date
- Fetching service history is **only** possible from the vehicle — there is no reverse endpoint (service history → vehicle) to prevent circular references
- List endpoints (`GET /api/vehicles`) return an empty `serviceHistories` array for performance

---

## Notifications

### US-023 — Email notifications for key events
**As a** user of any role,
**I want to** receive email notifications when actions that affect me occur,
**So that** I stay informed without having to poll the system.

**Notification matrix:**

| Event | Recipient | Kafka type |
|---|---|---|
| Account created | Newly registered user | `ACCOUNT_CREATED` |
| Trip request submitted | All fleet managers | `TRIP_REQUESTED` |
| Trip request approved | Field staff who submitted | `TRIP_APPROVED` |
| Trip request rejected (manual or auto) | Field staff who submitted | `TRIP_REJECTED` |
| Maintenance flag assigned | Maintenance team member assigned | `FLAG_ASSIGNED` |
| Maintenance progress update | Fleet manager who assigned the flag | `FLAG_PROGRESS` |
| Maintenance work marked done | Fleet manager who assigned the flag | `FLAG_PENDING_APPROVAL` |
| Maintenance approved | Maintenance team member who did the work | `FLAG_RESOLVED` |
| Vehicle milestone reached | Fleet manager (all fleet managers) | `MAINTENANCE_FLAG_RAISED` |

**Acceptance Criteria:**
- All notifications are sent **asynchronously** via Kafka (`notification.request` topic)
- Fleet managers are notified immediately when a new trip request is submitted (`PENDING`)
- A welcome email is sent to each user upon account creation
- The field staff member gets an **instant** response on mileage submission; the background event handles the rest
- Notification delivery does not block or fail the primary API response

---

## Vehicle Activity Dashboard

### US-029 — Admin vehicle activity log (real-time fleet health dashboard)
**As an** Admin,
**I want to** see a live feed of every significant fleet event — searchable by vehicle plate number and date,
**So that** I can monitor the health and usage of every vehicle in real time without needing to check individual records.

**Events captured:**

| Event type | Triggered by | Example log line |
|---|---|---|
| `TRIP_REQUESTED` | Field staff submits trip request | `Emeka Obi (FIELD_STAFF) requested vehicle KJA-001AB for destination: Abuja (12 May – 15 May)` |
| `TRIP_APPROVED` | Fleet manager approves | `Trip request #42 approved for vehicle KJA-001AB — assigned to Emeka Obi` |
| `TRIP_REJECTED` | Fleet manager rejects (manual or auto) | `Trip request #45 auto-rejected for vehicle KJA-001AB — conflict with approved trip until 15 May` |
| `MILEAGE_SUBMITTED` | Field staff or fleet manager submits odometer reading | `Emeka Obi (FIELD_STAFF) reported odometer reading of 5,240 km on vehicle KJA-001AB` |
| `MAINTENANCE_SCHEDULED` | System — milestone threshold crossed | `Vehicle KJA-001AB flagged for maintenance — milestone of 5,000 km reached` |
| `MAINTENANCE_COMPLETED` | Maintenance team marks work done | `Chidi Nwosu (MAINTENANCE_TEAM) marked maintenance work done on vehicle KJA-001AB` |
| `MILESTONE_UPDATED` | Fleet manager approves maintenance | `Fleet Manager Tunde Bello approved maintenance and set new milestone interval to 10,000 km for KJA-001AB` |

**Architecture:**
- Each service publishes a `VehicleActivityEvent` to the Kafka topic `fleet.activity`
- A `VehicleActivityConsumer` listens to the topic and persists each event to the `vehicle_activity_logs` table
- All event publishing is fire-and-forget (async via Kafka) — primary API responses are not blocked

**Acceptance Criteria:**
- `GET /api/admin/activity-logs` — returns all logs, newest first
- `GET /api/admin/activity-logs?plateNumber=KJA-001AB` — filter by plate number
- `GET /api/admin/activity-logs?date=2026-05-10` — filter by date (all events on that calendar day)
- `GET /api/admin/activity-logs?plateNumber=KJA-001AB&date=2026-05-10` — combined filter
- Each log entry includes: `id`, `vehicleId`, `plateNumber`, `eventType`, `description`, `actorName`, `actorRole`, `occurredAt`
- Restricted to `ADMIN` only
- The `vehicle_activity_logs` table is indexed on `plate_number` and `occurred_at` for efficient filtering
- The frontend refreshes manually to see new entries (no push / automatic polling in this version)

> **Future Enhancement — WebSocket push**
>
> The current implementation serves data on demand (REST pull). A future upgrade will add a
> WebSocket channel so the admin dashboard receives new activity events in real time without
> any manual refresh.

---

## Maintenance Chat

### US-028 — In-flag conversation between maintenance team and fleet manager
**As a** Maintenance Team member or Fleet Manager,
**I want to** exchange messages within a maintenance flag,
**So that** we can coordinate work in real time without switching to a separate communication tool.

> **Current Implementation — Manual refresh (REST polling)**
>
> Messages are stored in the database and served via a plain REST endpoint. The frontend
> fetches the latest messages whenever the user manually refreshes or navigates back to
> the flag detail view. There is no automatic push mechanism in this version.
>
> **Future Enhancement — WebSocket**
>
> A WebSocket channel (Spring `@MessageMapping` / STOMP) will be introduced to push new
> messages to connected clients instantly, eliminating the need for any manual refresh.
> The database model and REST endpoints implemented here will remain unchanged; only the
> delivery layer will be upgraded.

**Acceptance Criteria:**
- `POST /api/maintenance-flags/{flagId}/messages` — send a message
    - Accepts `{ "message": "<text>" }`
    - Sender is resolved from the authenticated user's JWT
    - Returns `201 Created` with the saved message (id, senderName, senderRole, message, sentAt)
    - Returns `404` if the maintenance flag does not exist
    - Returns `409 Conflict` if the flag status is `RESOLVED` (conversation is locked — no new messages)
- `GET /api/maintenance-flags/{flagId}/messages` — fetch all messages
    - Returns messages ordered oldest → newest (`sentAt ASC`)
    - Always returns the full history, including for `RESOLVED` flags (read-only after resolution)
    - Returns `404` if the maintenance flag does not exist
- Both endpoints restricted to `MAINTENANCE_TEAM`, `FLEET_MANAGER`, and `ADMIN`
- No automatic delivery / push — the client fetches on demand

---

## Media Management

> **Design Decision — Media Entity**
>
> Rather than storing URLs as plain strings on User and Vehicle, media assets are represented
> as a proper `Media` entity with two fields: `publicId` (the Cloudinary asset identifier, unique
> across the system) and `url` (the full CDN delivery URL). This separates media lifecycle from
> the owning entity and allows clean replacement/deletion via `orphanRemoval = true`.
>
> - **User → Media**: `@OneToOne` — one profile picture per user. FK stored on the `users` table.
> - **Vehicle → Media**: `@OneToMany` via a `vehicle_media` join table — multiple photos per vehicle.
> - The `Media` entity is **unidirectional** — it holds no reference back to `User` or `Vehicle`.

### US-030 — Self-service user profile
**As an** authenticated user of any role,
**I want to** view and update my own profile and manage my own profile picture,
**So that** I can maintain my account details without going through an administrator.

**Acceptance Criteria:**
- `GET /api/users/me` — returns the caller's own profile (name, email, role, profileMedia)
- `PATCH /api/users/me` — updates the caller's name only; email cannot be changed
    - Accepts `{ "name": "<string>" }` — `@NotBlank` validated
    - Returns `200` with the updated user response
- `PATCH /api/users/me/media` — sets or replaces the caller's profile picture
    - Accepts `{ "publicId": "<cloudinary-id>", "url": "<cdn-url>" }`
    - Replaces any existing media (old `Media` row is deleted via `orphanRemoval`)
    - Returns `200` with the saved `MediaResponse`
- `DELETE /api/users/me/media` — removes the caller's profile picture
    - Returns `409 Conflict` if no profile media is currently set
    - Returns `204 No Content` on success
- All four endpoints are accessible to **any** authenticated user (no `@PreAuthorize` role restriction)
- Caller is resolved from the JWT in the security context — users can only modify their own profile

---

### US-031 — Admin and fleet manager media management
**As an** Admin or Fleet Manager,
**I want to** manage profile pictures for users and vehicle photo galleries,
**So that** I can maintain accurate visual records for staff and fleet assets.

**Acceptance Criteria:**
- `PATCH /api/admin/users/{id}/media` — sets or replaces any user's profile picture (`ADMIN` only)
    - Accepts `{ "publicId", "url" }`; returns `200` with `MediaResponse`
    - Returns `404` if the user does not exist
- `DELETE /api/admin/users/{id}/media` — removes any user's profile picture (`ADMIN` only)
    - Returns `409 Conflict` if no media is set; `204 No Content` on success
- `POST /api/vehicles/{id}/media` — appends photos to a vehicle (`FLEET_MANAGER`, `ADMIN`)
    - Accepts an **array** of `{ "publicId", "url" }` objects (one or more)
    - Appends to existing photos (does not replace); returns `200` with the full updated photo list
    - Returns `404` if the vehicle does not exist
- `DELETE /api/vehicles/{id}/media/{mediaId}` — removes a specific photo from a vehicle (`FLEET_MANAGER`, `ADMIN`)
    - Returns `404` if the media entry is not found on that vehicle
    - Returns `204 No Content` on success

---

## User Profile

*(See US-030 above — self-service profile endpoints are documented there.)*

---

## Observability

### US-024 — AOP-based request logging
**As a** system operator,
**I want** all API requests and service method calls to be automatically logged using AOP,
**So that** I can monitor system behaviour and diagnose issues without adding logging to every method.

**Acceptance Criteria:**
- An AOP aspect intercepts all public service methods
- Logs the method name, arguments (sanitised — no passwords), and execution time
- Errors are logged with full stack trace at `ERROR` level
- Normal completions are logged at `INFO` or `DEBUG` level

---

## Reliability

### US-025 — Transactional outbox for Kafka events
**As a** system operator,
**I want** Kafka events to be stored in a database outbox table before being published,
**So that** no events are lost if Kafka is temporarily unavailable.

**Acceptance Criteria:**
- When a domain event is raised (maintenance flag, notification, etc.), it is first persisted to an `outbox_events` table in the same transaction as the business data
- A background poller reads unpublished outbox events and publishes them to Kafka
- Successfully published events are marked as `PUBLISHED` with a timestamp
- Events that fail to publish are retried with backoff
- The system recovers without data loss after a Kafka restart

---

## Status Reference

| Entity | Status Values |
|---|---|
| Vehicle | `AVAILABLE` · `ASSIGNED` · `MAINTENANCE` |
| Trip Request | `PENDING` · `APPROVED` · `REJECTED` · `COMPLETED` |
| Maintenance Flag | `OPEN` · `ASSIGNED` · `IN_PROGRESS` · `PENDING_APPROVAL` · `RESOLVED` |

---

## Implementation Status

| Story | Status |
|---|---|
| US-001 Login / 401 on bad credentials | ✅ Done |
| US-002 Create user / invalid role → 400 | ✅ Done |
| US-003 View users | ✅ Done |
| US-004 Change own password | ✅ Done |
| US-005 Admin reset password | ✅ Done |
| US-006 Register vehicle (ADMIN + FLEET_MANAGER) | ✅ Done |
| US-007 View vehicles with service histories | ✅ Done |
| US-008 Update milestone interval | ✅ Done |
| US-009 Submit trip request / duplicate guard | ✅ Done |
| US-010 Approve / reject trip + auto-reject conflicts | ✅ Done |
| US-011 Complete trip | ✅ Done |
| US-012 View trip requests | ✅ Done |
| US-013 Cron job — auto-expire stale requests | ✅ Done |
| US-014 Submit odometer reading / backwards guard | ✅ Done |
| US-015 Auto-trigger maintenance on milestone | ✅ Done |
| US-016 View mileage history | ✅ Done |
| US-017 Assign maintenance flag | ✅ Done |
| US-018 Update maintenance progress | ✅ Done |
| US-019 Signal work done → PENDING_APPROVAL | ✅ Done |
| US-020 Approve maintenance + service history | ✅ Done |
| US-021 View maintenance flags | ✅ Done |
| US-022 View vehicle service history | ✅ Done |
| US-023 Email notifications via Kafka | ✅ Done |
| US-024 AOP-based request logging | 🔲 Pending |
| US-025 Transactional outbox for Kafka events | 🔲 Pending |
| US-026 Deactivate / reactivate user account | ✅ Done |
| US-027 Nigerian plate number validation | ✅ Done |
| US-028 Maintenance flag chat (REST, manual refresh) | ✅ Done |
| US-029 Vehicle activity log / admin dashboard | ✅ Done |
| US-030 Self-service profile (view, update name, manage own media) | ✅ Done |
| US-031 Admin + fleet manager media management (user + vehicle) | ✅ Done |



package com.fleetops.core.vehicle.controller;

import com.fleetops.core.vehicle.dto.MilestoneIntervalRequest;
import com.fleetops.core.vehicle.dto.VehicleRequest;
import com.fleetops.core.vehicle.dto.VehicleResponse;
import com.fleetops.core.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<VehicleResponse> register(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.registerVehicle(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<VehicleResponse>> getAll() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('FIELD_STAFF', 'FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<VehicleResponse>> getAvailable() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<VehicleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PatchMapping("/{id}/milestone-interval")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<VehicleResponse> updateMilestoneInterval(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneIntervalRequest request) {
        return ResponseEntity.ok(vehicleService.updateMilestoneInterval(id, request));
    }
}
package com.fleetops.core.user.controller;

import com.fleetops.core.media.dto.MediaRequest;
import com.fleetops.core.media.dto.MediaResponse;
import com.fleetops.core.user.dto.UpdateProfileRequest;
import com.fleetops.core.user.dto.UserResponse;
import com.fleetops.core.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PatchMapping
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PatchMapping("/media")
    public ResponseEntity<MediaResponse> setMyProfileMedia(
            @Valid @RequestBody MediaRequest request) {
        return ResponseEntity.ok(userService.setMyProfileMedia(request));
    }

    @DeleteMapping("/media")
    public ResponseEntity<Void> removeMyProfileMedia() {
        userService.removeMyProfileMedia();
        return ResponseEntity.noContent().build();
    }
}
package com.fleetops.core.user.controller;

import com.fleetops.core.user.dto.CreateUserRequest;
import com.fleetops.core.user.dto.ResetPasswordRequest;
import com.fleetops.core.user.dto.UserResponse;
import com.fleetops.core.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reactivateUser(@PathVariable Long id) {
        userService.reactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> getTest() {
        return ResponseEntity.ok("Something Test");
    }
}
package com.fleetops.core.triprequest.controller;

import com.fleetops.core.triprequest.dto.CompleteTripRequest;
import com.fleetops.core.triprequest.dto.TripRequestCreate;
import com.fleetops.core.triprequest.dto.TripRequestResponse;
import com.fleetops.core.triprequest.service.TripRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-requests")
@RequiredArgsConstructor
public class TripRequestController {

    private final TripRequestService tripRequestService;

    @PostMapping
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<TripRequestResponse> create(@Valid @RequestBody TripRequestCreate dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripRequestService.createRequest(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<TripRequestResponse>> getPending() {
        return ResponseEntity.ok(tripRequestService.getPendingRequests());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<TripRequestResponse>> getAll() {
        return ResponseEntity.ok(tripRequestService.getAllRequests());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<List<TripRequestResponse>> getMine() {
        return ResponseEntity.ok(tripRequestService.getMyRequests());
    }

    @GetMapping("/my/approved")
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<List<TripRequestResponse>> getMyApproved() {
        return ResponseEntity.ok(tripRequestService.getMyApprovedRequests());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(tripRequestService.approveRequest(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(tripRequestService.rejectRequest(id));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('FIELD_STAFF', 'FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> complete(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteTripRequest body) {
        return ResponseEntity.ok(tripRequestService.completeTrip(id, body));
    }
}
package com.fleetops.core.mileage.controller;

import com.fleetops.core.mileage.dto.MileageLogRequest;
import com.fleetops.core.mileage.dto.MileageLogResponse;
import com.fleetops.core.mileage.service.MileageLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mileage-logs")
@RequiredArgsConstructor
public class MileageLogController {

    private final MileageLogService mileageLogService;

    @PostMapping
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<MileageLogResponse> submit(@Valid @RequestBody MileageLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mileageLogService.submitLog(request));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<MileageLogResponse>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(mileageLogService.getLogsByVehicle(vehicleId));
    }
}

package com.fleetops.core.media.controller;

import com.fleetops.core.media.dto.MediaRequest;
import com.fleetops.core.media.dto.MediaResponse;
import com.fleetops.core.media.service.MediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    // ── User profile media ────────────────────────────────────────────────────

    @PatchMapping("/api/admin/users/{id}/media")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MediaResponse> setUserProfileMedia(
            @PathVariable Long id,
            @Valid @RequestBody MediaRequest request) {
        return ResponseEntity.ok(mediaService.setUserProfileMedia(id, request));
    }

    @DeleteMapping("/api/admin/users/{id}/media")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeUserProfileMedia(@PathVariable Long id) {
        mediaService.removeUserProfileMedia(id);
        return ResponseEntity.noContent().build();
    }

    // ── Vehicle media ─────────────────────────────────────────────────────────

    @PostMapping("/api/vehicles/{id}/media")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<MediaResponse>> addVehicleMedia(
            @PathVariable Long id,
            @Valid @RequestBody List<MediaRequest> requests) {
        return ResponseEntity.ok(mediaService.addVehicleMedia(id, requests));
    }

    @DeleteMapping("/api/vehicles/{id}/media/{mediaId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<Void> removeVehicleMedia(
            @PathVariable Long id,
            @PathVariable Long mediaId) {
        mediaService.removeVehicleMedia(id, mediaId);
        return ResponseEntity.noContent().build();
    }
}
package com.fleetops.core.maintenance.controller;

import com.fleetops.core.maintenance.dto.ApproveFlagRequest;
import com.fleetops.core.maintenance.dto.AssignFlagRequest;
import com.fleetops.core.maintenance.dto.MaintenanceFlagResponse;
import com.fleetops.core.maintenance.dto.ProgressUpdateRequest;
import com.fleetops.core.maintenance.service.MaintenanceFlagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-flags")
@RequiredArgsConstructor
public class MaintenanceFlagController {

    private final MaintenanceFlagService maintenanceFlagService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<MaintenanceFlagResponse>> getAll() {
        return ResponseEntity.ok(maintenanceFlagService.getAllFlags());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('MAINTENANCE_TEAM')")
    public ResponseEntity<List<MaintenanceFlagResponse>> getMine() {
        return ResponseEntity.ok(maintenanceFlagService.getMyAssignedFlags());
    }

    /** Fleet manager assigns an OPEN flag to a maintenance team member */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<MaintenanceFlagResponse> assign(
            @PathVariable Long id,
            @Valid @RequestBody AssignFlagRequest request) {
        return ResponseEntity.ok(maintenanceFlagService.assignFlag(id, request));
    }

    /** Maintenance team updates progress notes — moves flag to IN_PROGRESS */
    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasRole('MAINTENANCE_TEAM')")
    public ResponseEntity<MaintenanceFlagResponse> progress(
            @PathVariable Long id,
            @Valid @RequestBody ProgressUpdateRequest request) {
        return ResponseEntity.ok(maintenanceFlagService.updateProgress(id, request));
    }

    /** Maintenance team signals work is done — moves flag to PENDING_APPROVAL and notifies fleet manager */
    @PatchMapping("/{id}/done")
    @PreAuthorize("hasRole('MAINTENANCE_TEAM')")
    public ResponseEntity<MaintenanceFlagResponse> markDone(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceFlagService.markWorkDone(id));
    }

    /** Fleet manager approves maintenance — requires new milestone interval + service notes */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<MaintenanceFlagResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveFlagRequest request) {
        return ResponseEntity.ok(maintenanceFlagService.approveMaintenance(id, request));
    }
}
package com.fleetops.core.maintenance.controller;

import com.fleetops.core.maintenance.dto.MaintenanceMessageRequest;
import com.fleetops.core.maintenance.dto.MaintenanceMessageResponse;
import com.fleetops.core.maintenance.service.MaintenanceMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-flags/{flagId}/messages")
@RequiredArgsConstructor
public class MaintenanceMessageController {

    private final MaintenanceMessageService messageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MAINTENANCE_TEAM', 'FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<MaintenanceMessageResponse> send(
            @PathVariable Long flagId,
            @Valid @RequestBody MaintenanceMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(flagId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MAINTENANCE_TEAM', 'FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<MaintenanceMessageResponse>> getMessages(@PathVariable Long flagId) {
        return ResponseEntity.ok(messageService.getMessages(flagId));
    }
}
package com.fleetops.core.auth.controller;

import com.fleetops.core.auth.dto.AuthResponse;
import com.fleetops.core.auth.dto.ChangePasswordRequest;
import com.fleetops.core.auth.dto.LoginRequest;
import com.fleetops.core.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}
package com.fleetops.core.assignment.controller;

import com.fleetops.core.assignment.dto.AssignmentResponse;
import com.fleetops.core.assignment.service.VehicleAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class VehicleAssignmentController {

    private final VehicleAssignmentService vehicleAssignmentService;

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<AssignmentResponse>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleAssignmentService.getAssignmentsByVehicle(vehicleId));
    }
}
package com.fleetops.core.admin.controller;

import com.fleetops.core.admin.dto.UtilisationReportResponse;
import com.fleetops.core.admin.dto.VehicleHealthResponse;
import com.fleetops.core.admin.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/utilisation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisationReportResponse> getUtilisation() {
        return ResponseEntity.ok(adminReportService.getUtilisationReport());
    }

    @GetMapping("/vehicle-health")
    @PreAuthorize("hasAnyRole('ADMIN', 'FLEET_MANAGER')")
    public ResponseEntity<List<VehicleHealthResponse>> getVehicleHealth() {
        return ResponseEntity.ok(adminReportService.getVehicleHealthSummary());
    }
}
package com.fleetops.core.activity.controller;

import com.fleetops.core.activity.dto.VehicleActivityLogResponse;
import com.fleetops.core.activity.service.VehicleActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/activity-logs")
@RequiredArgsConstructor
public class VehicleActivityLogController {

    private final VehicleActivityLogService activityLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VehicleActivityLogResponse>> search(
            @RequestParam(required = false) String plateNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(activityLogService.search(plateNumber, date));
    }
}

package com.fleetops.core.triprequest.controller;

import com.fleetops.core.triprequest.dto.CompleteTripRequest;
import com.fleetops.core.triprequest.dto.TripRequestCreate;
import com.fleetops.core.triprequest.dto.TripRequestResponse;
import com.fleetops.core.triprequest.service.TripRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-requests")
@RequiredArgsConstructor
public class TripRequestController {

    private final TripRequestService tripRequestService;

    @PostMapping
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<TripRequestResponse> create(@Valid @RequestBody TripRequestCreate dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripRequestService.createRequest(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<TripRequestResponse>> getPending() {
        return ResponseEntity.ok(tripRequestService.getPendingRequests());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<TripRequestResponse>> getAll() {
        return ResponseEntity.ok(tripRequestService.getAllRequests());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<List<TripRequestResponse>> getMine() {
        return ResponseEntity.ok(tripRequestService.getMyRequests());
    }

    @GetMapping("/my/approved")
    @PreAuthorize("hasRole('FIELD_STAFF')")
    public ResponseEntity<List<TripRequestResponse>> getMyApproved() {
        return ResponseEntity.ok(tripRequestService.getMyApprovedRequests());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(tripRequestService.approveRequest(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(tripRequestService.rejectRequest(id));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('FIELD_STAFF', 'FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<TripRequestResponse> complete(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteTripRequest body) {
        return ResponseEntity.ok(tripRequestService.completeTrip(id, body));
    }
}


FleetOps Core Service
Core domain service for FleetOps. Manages vehicles, users, trip requests, mileage logs, and maintenance flags.

Base URL: http://localhost:8080

All protected endpoints require a Bearer token:

Authorization: Bearer <token>
Swagger UI (interactive docs): http://localhost:8080/swagger-ui/index.html

Table of Contents
Auth
Users
User Profile
Password Management
Vehicles
Vehicle Lifecycle
Trip Requests
Mileage Logs
Maintenance Flags
Maintenance Chat
Vehicle Assignments
Vehicle Activity Dashboard
Media Management
Admin Reports
Email Notifications
Quick-Start Flow
Auth
POST /api/auth/login
Role: Public

Errors: Returns 401 for wrong email or password (not 500).

Sample 1 — Admin login

{
"email": "admin@fleetops.com",
"password": "Admin@1234"
}
Sample 2 — Field staff login

{
"email": "john.driver@fleetops.com",
"password": "Staff@5678"
}
Response

{
"token": "eyJhbGciOiJIUzI1NiJ9...",
"name": "System Admin",
"email": "admin@fleetops.com",
"role": "ADMIN",
"profileMedia": {
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
}
profileMedia is null if the user has not set a profile picture.

Password Management
PATCH /api/auth/change-password
Role: Any authenticated user

The user must supply their current password for verification. Returns 401 if the current password is wrong.

{
"currentPassword": "OldPass@123",
"newPassword": "NewPass@456"
}
Response: 204 No Content

PATCH /api/admin/users/{id}/reset-password
Role: ADMIN

Hard-sets any user's password without requiring the current one. Use this for account recovery.

Sample 1

{
"newPassword": "Reset@1234"
}
Sample 2

{
"newPassword": "Recover@5678"
}
Response: 204 No Content. Returns 404 if the user ID does not exist.

Users
POST /api/admin/users
Role: ADMIN

Available roles: FIELD_STAFF · FLEET_MANAGER · MAINTENANCE_TEAM · ADMIN

Passing an invalid role value returns 400 with a message listing the accepted values.

Sample 1 — Create a Field Staff

{
"name": "John Adeyemi",
"email": "john.adeyemi@fleetops.com",
"password": "Staff@1234",
"role": "FIELD_STAFF"
}
Sample 2 — Create a Fleet Manager

{
"name": "Sarah Okonkwo",
"email": "sarah.okonkwo@fleetops.com",
"password": "Manager@5678",
"role": "FLEET_MANAGER"
}
Sample 3 — Create a Maintenance Team member

{
"name": "Emeka Nwosu",
"email": "emeka.nwosu@fleetops.com",
"password": "Maint@1234",
"role": "MAINTENANCE_TEAM"
}
GET /api/admin/users
Role: ADMIN

Returns all users including deactivated ones. Each user object includes active (account status) and profileMedia (null if no picture set).

GET /api/admin/users/{id}
Role: ADMIN

PATCH /api/admin/users/{id}/deactivate
Role: ADMIN

Soft-deletes a user account. The user record is retained in the database but the account is blocked from logging in.

Returns 204 No Content on success
Returns 404 if the user does not exist
Returns 409 Conflict if the account is already deactivated
Response: 204 No Content

PATCH /api/admin/users/{id}/reactivate
Role: ADMIN

Restores a previously deactivated account.

Returns 204 No Content on success
Returns 404 if the user does not exist
Returns 409 Conflict if the account is already active
Response: 204 No Content

Deactivated users attempting to log in receive 401 Unauthorized with the message "Account is deactivated. Please contact an administrator."

User Profile
Any authenticated user can view and update their own profile without going through an admin endpoint.

GET /api/users/me
Role: Any authenticated user

Returns the authenticated user's own profile. Includes profileMedia if a profile picture has been set (null otherwise).

Sample Response

{
"id": 3,
"name": "John Adeyemi",
"email": "john.adeyemi@fleetops.com",
"role": "FIELD_STAFF",
"active": true,
"profileMedia": {
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
},
"createdAt": "2026-01-15T08:00:00"
}
PATCH /api/users/me
Role: Any authenticated user

Updates the authenticated user's display name. Email address cannot be changed via this endpoint.

{
"name": "John Adeyemi Jr."
}
PATCH /api/users/me/media
Role: Any authenticated user

Sets or replaces the authenticated user's profile picture (Cloudinary-hosted). Replaces any existing entry.

{
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
Response

{
"id": 5,
"publicId": "fleetops/users/profile-123",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-123.jpg"
}
DELETE /api/users/me/media
Role: Any authenticated user

Removes the authenticated user's profile picture. Returns 409 Conflict if no profile media is currently set.

Response: 204 No Content

Vehicles
Each vehicle has a milestone interval — the odometer reading (km) at which a maintenance flag is automatically raised. The default is 3,000 km (configurable via DEFAULT_MILESTONE_INTERVAL env var). This can be overridden per vehicle at creation time or updated later.

Service history is recorded automatically when the fleet manager approves a completed maintenance. See Maintenance Flags.

Plate Number Format
Plate numbers follow the Nigerian private vehicle standard:

KJA-245BX
^^^         — 3-letter LGA registration code (e.g. KJA = Ikeja, Lagos)
^^^     — 3-digit sequence number (001–999)
^^   — 2-letter suffix
Validation rules:

Input is trimmed and converted to uppercase automatically
The 3-letter prefix must be a recognised LGA code (seeded from nigeria_plate_codes.csv on startup)
Sequence number must be between 001 and 999 — 000 is rejected
Returns 400 Bad Request if the format is invalid or the LGA prefix is unrecognised
Returns 409 Conflict if the plate number is already registered
POST /api/vehicles
Role: FLEET_MANAGER, ADMIN

Sample 1 — Use default 3,000 km milestone

{
"make": "Toyota",
"model": "Land Cruiser",
"plateNumber": "KJA-245BX"
}
Sample 2 — Custom milestone

{
"make": "Ford",
"model": "Ranger",
"plateNumber": "PHC-112AA",
"milestoneInterval": 5000
}
GET /api/vehicles
Role: FLEET_MANAGER, ADMIN

Returns all vehicles. Each vehicle includes its mediaFiles array (empty if no photos have been added). serviceHistories is always an empty list on list responses — use GET /api/vehicles/{id} for full history.

GET /api/vehicles/available
Role: FIELD_STAFF, FLEET_MANAGER, ADMIN

Returns vehicles with status AVAILABLE. Each vehicle includes its mediaFiles array. Vehicles under maintenance, currently assigned, or marked OUT_OF_SERVICE are excluded.

GET /api/vehicles/{id}
Role: FLEET_MANAGER, ADMIN

Returns the vehicle with its full service history (most recent first). Includes lifecyclePercentage and markedForSale — only visible to FLEET_MANAGER and ADMIN.

Sample Response

{
"id": 1,
"make": "Toyota",
"model": "Land Cruiser",
"plateNumber": "KJA-245BX",
"currentMileage": 6200.0,
"milestoneInterval": 6000.0,
"status": "AVAILABLE",
"lifecyclePercentage": 34.7,
"markedForSale": false,
"mediaFiles": [
{
"id": 1,
"publicId": "fleetops/vehicles/v1-front",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v1-front.jpg"
}
],
"serviceHistories": [
{
"id": 1,
"fleetManagerName": "Sarah Okonkwo",
"notes": "Engine oil replaced. Brake pads inspected and cleared.",
"newMilestoneInterval": 6000.0,
"servicedAt": "2026-04-20T14:30:00"
}
],
"registeredAt": "2026-01-10T09:00:00"
}
When lifecyclePercentage reaches 80%, the vehicle status is automatically set to OUT_OF_SERVICE and markedForSale flips to true. The vehicle is then excluded from trip requests.

Vehicle Lifecycle
Each vehicle carries a lifecyclePercentage (0–100) computed by a background job that runs every hour. It is also recalculated immediately after every mileage submission.

Formula (weighted):

Factor	Weight	Source
Mileage wear	50%	currentMileage / maxMileage (default max: 300,000 km)
Qualified trips	25%	Trips with a linked mileage log ÷ maxTrips (default: 500)
Maintenance rounds	25%	Resolved maintenance flags ÷ maxMaintenanceRounds (default: 30)
A qualified trip is a COMPLETED trip request that has a mileage log submitted with tripRequestId pointing to it. Unlinked mileage logs do not count toward the trip factor.

At 80%+: status → OUT_OF_SERVICE, markedForSale → true. The vehicle is removed from the available pool automatically.

lifecyclePercentage and markedForSale are visible only on vehicle responses returned to FLEET_MANAGER and ADMIN.

PATCH /api/vehicles/{id}/milestone-interval
Role: FLEET_MANAGER, ADMIN

Manually updates the mileage threshold that triggers a maintenance flag. Takes effect on the next mileage log submission.

{
"milestoneInterval": 5000
}
Trip Requests
A field staff member submits a trip request for a specific vehicle and date range. Rules:

The vehicle must be AVAILABLE.
The same field staff cannot have two PENDING requests for the same vehicle simultaneously.
When a request is approved, all other PENDING requests for that vehicle whose startDate falls before the approved trip's endDate are automatically rejected.
A cron job runs daily at midnight to auto-reject any PENDING requests whose startDate has already passed.
POST /api/trip-requests
Role: FIELD_STAFF

Sample 1

{
"vehicleId": 2,
"destination": "Lagos Island",
"startDate": "2026-07-10",
"endDate": "2026-07-12"
}
Sample 2

{
"vehicleId": 5,
"destination": "Abuja Central Depot",
"startDate": "2026-07-20",
"endDate": "2026-07-23"
}
GET /api/trip-requests
Role: FLEET_MANAGER — returns PENDING requests only

GET /api/trip-requests/all
Role: FLEET_MANAGER, ADMIN — returns all requests across all statuses

GET /api/trip-requests/my
Role: FIELD_STAFF — returns the authenticated user's own requests across all statuses

GET /api/trip-requests/my/approved
Role: FIELD_STAFF — returns only the authenticated user's APPROVED trips (i.e. the vehicle(s) currently assigned to them)

PATCH /api/trip-requests/{id}/approve
Role: FLEET_MANAGER

Approves a PENDING trip request. Creates a VehicleAssignment, sets the vehicle status to ASSIGNED, and auto-rejects conflicting pending requests for the same vehicle.

PATCH /api/trip-requests/{id}/reject
Role: FLEET_MANAGER

PATCH /api/trip-requests/{id}/complete
Role: FIELD_STAFF (own trip only) · FLEET_MANAGER · ADMIN

Marks an APPROVED trip as completed. Sets the vehicle status back to AVAILABLE.

A field staff member can only complete their own trip — returns 403 Forbidden if they attempt to complete another staff member's trip.
Fleet managers and admins can complete any approved trip, including before the endDate (e.g. early vehicle withdrawal).
Accepts an optional JSON body:

{
"reportedMileage": 4350.0
}
If reportedMileage is supplied it must be ≥ the vehicle's currently recorded mileage — returns 409 otherwise. The vehicle's currentMileage is updated and a MileageLog entry is created in the same request.
If the body is omitted (or reportedMileage is null), the trip completes with no mileage update; a separate POST /api/mileage-logs call can be used afterwards.
Mileage Logs
After a trip is completed (fleet manager calls PATCH /{id}/complete), the field staff submits the vehicle's current odometer reading. This is not a per-trip delta — it is the absolute reading from the vehicle's odometer. The system sets the vehicle's currentMileage directly to this value.

Mileage logging is only permitted after trip completion. The system verifies that the submitting field staff has a COMPLETED trip for that vehicle before accepting the log. Attempting to log mileage without a completed trip returns 409 Conflict.

If the new reading causes the vehicle to cross its configured milestoneInterval, a MaintenanceFlagCreatedEvent is published to Kafka. The consumer creates a maintenance flag, sets the vehicle to MAINTENANCE (blocking future trip requests), and notifies the fleet manager — all asynchronously.

POST /api/mileage-logs
Role: FIELD_STAFF

Accepts an optional tripRequestId to link this odometer reading to the specific completed trip. Linking trips is required for that trip to count toward the vehicle's lifecycle percentage.

Sample 1 — Odometer now reads 3,200 km (linked to trip)

{
"vehicleId": 2,
"reportedMileage": 3200.0,
"tripRequestId": 14
}
Sample 2 — Odometer now reads 5,850 km (crosses 5,000 km milestone)

{
"vehicleId": 5,
"reportedMileage": 5850.0,
"tripRequestId": 22
}
Sample 3 — Without trip link (legacy; trip won't count toward lifecycle)

{
"vehicleId": 5,
"reportedMileage": 5850.0
}
The reported value must be greater than or equal to the vehicle's currently recorded mileage. Submitting a lower value returns 409. If tripRequestId is provided, it must belong to the submitting user, reference the same vehicle, and be in COMPLETED status — returns 409 otherwise.

Response

{
"id": 12,
"vehicleId": 2,
"plateNumber": "LG-245-KJA",
"submittedById": 3,
"submittedByName": "John Adeyemi",
"reportedMileage": 3200.0,
"loggedAt": "2026-05-08T10:15:00"
}
GET /api/mileage-logs/vehicle/{vehicleId}
Role: FLEET_MANAGER, ADMIN — returns logs newest first

Maintenance Flags
A maintenance flag is raised automatically when a vehicle crosses its mileage milestone. The full lifecycle is:

OPEN → ASSIGNED → IN_PROGRESS → PENDING_APPROVAL → RESOLVED
Status	Who sets it	How
OPEN	System (Kafka consumer)	Mileage milestone crossed
ASSIGNED	Fleet manager / Admin	PATCH /{id}/assign
IN_PROGRESS	Maintenance team	PATCH /{id}/progress
PENDING_APPROVAL	Maintenance team	PATCH /{id}/done — notifies fleet manager by email
RESOLVED	Fleet manager / Admin	PATCH /{id}/approve — requires new milestone + service notes
A vehicle blocked by a maintenance flag cannot receive new trip requests until the flag is RESOLVED.

GET /api/maintenance-flags
Role: FLEET_MANAGER, ADMIN

GET /api/maintenance-flags/my
Role: MAINTENANCE_TEAM — returns flags assigned to the current user

PATCH /api/maintenance-flags/{id}/assign
Role: FLEET_MANAGER, ADMIN

Assigns an OPEN flag to a maintenance team member. Sends them an email notification.

{
"maintenanceTeamUserId": 4
}
PATCH /api/maintenance-flags/{id}/progress
Role: MAINTENANCE_TEAM

Updates progress notes and moves the flag to IN_PROGRESS. Notifies the assigned fleet manager.

Sample 1 — Initial update

{
"progressNotes": "Vehicle inspected. Engine oil and filter replaced. Awaiting brake pad delivery."
}
Sample 2 — Follow-up

{
"progressNotes": "Brake pads replaced. Final checks in progress. Vehicle expected ready by end of day."
}
PATCH /api/maintenance-flags/{id}/done
Role: MAINTENANCE_TEAM

Signals that work is complete. Moves the flag to PENDING_APPROVAL and sends an email to the fleet manager requesting approval.

PATCH /api/maintenance-flags/1/done
Authorization: Bearer <token>
PATCH /api/maintenance-flags/{id}/approve
Role: FLEET_MANAGER, ADMIN

Approves a PENDING_APPROVAL flag. Requires:

newMilestoneInterval — must be greater than both the previous milestone interval and the vehicle's current mileage
serviceNotes — description of the work done (stored as a service history record on the vehicle)
On success: creates a ServiceHistory record, updates the vehicle's milestone interval, sets the vehicle to AVAILABLE, and notifies the maintenance team member.

Sample 1

{
"newMilestoneInterval": 6000,
"serviceNotes": "Full service at 3,200 km. Engine oil, oil filter, and air filter replaced. Brake pads inspected — within tolerance."
}
Sample 2

{
"newMilestoneInterval": 10000,
"serviceNotes": "Major service at 5,850 km. Timing belt, spark plugs, and coolant replaced. All systems cleared."
}
Maintenance Chat
Messages sent within a maintenance flag. The conversation is locked once the flag is RESOLVED — no new messages can be posted, but the history remains readable.

POST /api/maintenance-flags/{flagId}/messages
Role: MAINTENANCE_TEAM, FLEET_MANAGER, ADMIN

Sends a message to the flag conversation. Returns 409 Conflict if the flag is RESOLVED.

{
"message": "Brake pads have arrived. Starting installation now."
}
Response (201 Created)

{
"id": 3,
"flagId": 7,
"senderId": 5,
"senderName": "Chidi Nwosu",
"senderRole": "MAINTENANCE_TEAM",
"message": "Brake pads have arrived. Starting installation now.",
"sentAt": "2026-05-10T11:23:00"
}
GET /api/maintenance-flags/{flagId}/messages
Role: MAINTENANCE_TEAM, FLEET_MANAGER, ADMIN

Returns all messages for a flag ordered oldest → newest. Works for both active and RESOLVED flags.

Vehicle Assignments
GET /api/assignments/vehicle/{vehicleId}
Role: FLEET_MANAGER, ADMIN

Returns the assignment history for a vehicle.

Vehicle Activity Dashboard
GET /api/admin/activity-logs
Role: ADMIN

Returns vehicle activity events newest first. Supports optional query parameters.

Parameter	Type	Description
plateNumber	string	Filter by vehicle plate number
date	YYYY-MM-DD	Filter to a single calendar day
Both can be combined: ?plateNumber=KJA-001AB&date=2026-05-10

Sample Response

[
{
"id": 12,
"vehicleId": 2,
"plateNumber": "KJA-001AB",
"eventType": "TRIP_REQUESTED",
"description": "Emeka Obi (FIELD_STAFF) requested vehicle KJA-001AB for destination: Abuja (12 May – 15 May)",
"actorName": "Emeka Obi",
"actorRole": "FIELD_STAFF",
"occurredAt": "2026-05-10T09:14:00"
}
]
Events logged:

Event type	Triggered by
TRIP_REQUESTED	Field staff submits a trip request
TRIP_APPROVED	Fleet manager approves a trip
TRIP_REJECTED	Manual or auto-conflict rejection
MILEAGE_SUBMITTED	Field staff or fleet manager submits odometer reading
MAINTENANCE_SCHEDULED	System — mileage milestone crossed
MAINTENANCE_COMPLETED	Maintenance team marks work done
MILESTONE_UPDATED	Fleet manager approves maintenance + sets new interval
Media Management
Admin can manage any user's profile picture. Fleet managers and admins can manage vehicle photos.

PATCH /api/admin/users/{id}/media
Role: ADMIN

Sets or replaces the profile picture for any user.

{
"publicId": "fleetops/users/profile-456",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/users/profile-456.jpg"
}
DELETE /api/admin/users/{id}/media
Role: ADMIN

Removes a user's profile picture. Returns 409 Conflict if no media is set.

Response: 204 No Content

POST /api/vehicles/{id}/media
Role: FLEET_MANAGER, ADMIN

Adds one or more photos to a vehicle. Appends to any existing photos.

[
{
"publicId": "fleetops/vehicles/v2-front",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-front.jpg"
},
{
"publicId": "fleetops/vehicles/v2-side",
"url": "https://res.cloudinary.com/demo/image/upload/v1/fleetops/vehicles/v2-side.jpg"
}
]
DELETE /api/vehicles/{id}/media/{mediaId}
Role: FLEET_MANAGER, ADMIN

Removes a specific photo from a vehicle by its media ID. Returns 404 if the media entry is not found on that vehicle.

Response: 204 No Content

Admin Reports
GET /api/admin/reports/utilisation
Role: ADMIN

Sample Response

{
"totalVehicles": 10,
"availableVehicles": 6,
"assignedVehicles": 2,
"maintenanceVehicles": 2,
"totalTripsAllTime": 47,
"pendingTripRequests": 3
}
GET /api/admin/reports/vehicle-health
Role: ADMIN, FLEET_MANAGER

Sample Response

[
{
"vehicleId": 1,
"plateNumber": "KJA-245BX",
"make": "Toyota",
"model": "Land Cruiser",
"currentMileage": 3200.0,
"milestoneInterval": 6000.0,
"status": "AVAILABLE",
"openMaintenanceFlags": 0
},
{
"vehicleId": 3,
"plateNumber": "PHC-112AA",
"make": "Ford",
"model": "Ranger",
"currentMileage": 5850.0,
"milestoneInterval": 5000.0,
"status": "MAINTENANCE",
"openMaintenanceFlags": 1
}
]
Email Notifications
All notifications are sent asynchronously via Kafka and do not block the primary API response.

Event	Recipient
Account created	Newly registered user (welcome email)
Trip request submitted	All fleet managers
Trip request approved	Field staff who submitted
Trip request rejected (manual or auto-conflict)	Field staff who submitted
Maintenance flag assigned	Maintenance team member assigned
Maintenance progress update	Fleet manager who assigned the flag
Maintenance work marked done	Fleet manager who assigned the flag
Maintenance approved	Maintenance team member who did the work
Vehicle mileage milestone reached	All fleet managers
Quick-Start Flow
1.  Login as ADMIN              POST /api/auth/login
2.  Create users                POST /api/admin/users              (one per role)
    └─ reset any password       PATCH /api/admin/users/{id}/reset-password
    3a. (Optional) Change own pwd  PATCH /api/auth/change-password
3.  Login as FLEET_MANAGER      POST /api/auth/login
4.  Register vehicles           POST /api/vehicles
5.  Login as FIELD_STAFF        POST /api/auth/login
6.  Browse available vehicles   GET  /api/vehicles/available
7.  Submit trip request         POST /api/trip-requests
8.  Login as FLEET_MANAGER      POST /api/auth/login
9.  Approve trip                PATCH /api/trip-requests/{id}/approve
10.  Complete trip               PATCH /api/trip-requests/{id}/complete
     └─ optionally include { "reportedMileage": ... } to capture odometer reading inline (skips step 11)
     └─ FLEET_MANAGER / ADMIN can complete any trip; FIELD_STAFF can complete their own
11.  Login as FIELD_STAFF        POST /api/auth/login
12.  Submit mileage log          POST /api/mileage-logs             (if not submitted inline at step 10)
     └─ if milestone crossed → vehicle → MAINTENANCE, fleet manager notified via Kafka
13.  Login as FLEET_MANAGER      POST /api/auth/login
14.  Assign maintenance flag     PATCH /api/maintenance-flags/{id}/assign
15.  Login as MAINTENANCE_TEAM   POST /api/auth/login
16.  Update progress             PATCH /api/maintenance-flags/{id}/progress
17.  Mark work done              PATCH /api/maintenance-flags/{id}/done
     └─ fleet manager notified by email to approve
18.  Login as FLEET_MANAGER      POST /api/auth/login
19.  Approve maintenance         PATCH /api/maintenance-flags/{id}/approve
     └─ service history recorded, vehicle returns to AVAILABLE



