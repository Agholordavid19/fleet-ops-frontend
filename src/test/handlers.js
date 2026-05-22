import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8082'

// Fixture data
export const VEHICLES = [
  { id: 'v1', plateNumber: 'ABC-123XY', make: 'Toyota', model: 'Hilux', status: 'AVAILABLE', currentMileage: 45000 },
  { id: 'v2', plateNumber: 'DEF-456ZA', make: 'Ford', model: 'Ranger', status: 'AVAILABLE', currentMileage: 32000 },
]

export const MY_TRIPS = [
  {
    id: 'trip-1', plateNumber: 'ABC-123XY', vehicleId: 'v1',
    destination: 'Nairobi', startDate: '2026-05-22', endDate: '2026-05-24',
    status: 'PENDING', rejectionReason: null,
  },
  {
    id: 'trip-2', plateNumber: 'DEF-456ZA', vehicleId: 'v2',
    destination: 'Mombasa', startDate: '2026-05-25', endDate: '2026-05-27',
    status: 'APPROVED', rejectionReason: null,
  },
  {
    id: 'trip-3', plateNumber: 'GHI-789BC', vehicleId: 'v3',
    destination: 'Kisumu', startDate: '2026-05-18', endDate: '2026-05-19',
    status: 'REJECTED', rejectionReason: 'Vehicle unavailable',
  },
]

export const MY_PROFILE = {
  id: 'user-1',
  name: 'Alice Staff',
  email: 'alice@fleet.com',
  role: 'FIELD_STAFF',
  createdAt: '2025-01-01T00:00:00Z',
  profileImageUrl: null,
  profileImageId: null,
}

export const handlers = [
  // ── Vehicles ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/api/vehicles/available`, () =>
    HttpResponse.json(VEHICLES)),

  http.post(`${BASE}/api/vehicles`, () =>
    HttpResponse.json({ id: 'v-new', plateNumber: 'NEW-001AB' }, { status: 201 })),

  http.post(`${BASE}/api/vehicles/:id/media`, () =>
    HttpResponse.json({ id: 1, url: 'https://res.cloudinary.com/test/v1/img.jpg', publicId: 'test/img', ownerType: 'VEHICLE', ownerId: 1 })),

  // ── Trips ─────────────────────────────────────────────────────────────────
  http.post(`${BASE}/api/trip-requests`, () =>
    HttpResponse.json({ id: 'trip-new', status: 'PENDING' }, { status: 201 })),

  http.get(`${BASE}/api/trip-requests/my`, () =>
    HttpResponse.json(MY_TRIPS)),

  http.get(`${BASE}/api/trip-requests/my/approved`, () =>
    HttpResponse.json([MY_TRIPS[1]])),

  http.patch(`${BASE}/api/trip-requests/:id/cancel`, () =>
    HttpResponse.json({ id: 'trip-1', status: 'CANCEL_PENDING' })),

  http.patch(`${BASE}/api/trip-requests/:id/complete`, () =>
    HttpResponse.json({ id: 'trip-2', status: 'COMPLETED', vehicleId: 'v2' })),

  // ── Breakdowns ────────────────────────────────────────────────────────────
  http.post(`${BASE}/api/breakdowns`, () =>
    HttpResponse.json({ id: 'bd-1' }, { status: 201 })),

  // ── Users / Profile ───────────────────────────────────────────────────────
  http.get(`${BASE}/api/users/me`, () =>
    HttpResponse.json(MY_PROFILE)),

  http.patch(`${BASE}/api/users/me`, () =>
    HttpResponse.json({ ...MY_PROFILE, name: 'Alice Updated' })),

  http.patch(`${BASE}/api/users/me/media`, () =>
    HttpResponse.json({ id: 1, url: 'https://res.cloudinary.com/djizuzpk6/image/upload/v1/photo.jpg', publicId: 'mpfleet/photo', ownerType: 'USER', ownerId: 1 })),

  http.delete(`${BASE}/api/users/me/media`, () =>
    new HttpResponse(null, { status: 204 })),

  // ── Auth ──────────────────────────────────────────────────────────────────
  http.patch(`${BASE}/api/auth/change-password`, () =>
    HttpResponse.json({ message: 'Password changed successfully' })),

  // ── Companies ─────────────────────────────────────────────────────────────
  http.post(`${BASE}/api/public/companies/register`, () =>
    HttpResponse.json({ id: 'co-1', status: 'PENDING' }, { status: 201 })),
]
