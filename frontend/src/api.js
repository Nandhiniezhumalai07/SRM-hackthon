/**
 * api.js — Centralized API Service
 * Backend: FastAPI @ http://127.0.0.1:8000
 */
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth Endpoints ────────────────────────────────────────────────────────────
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);

// ─── User / Profile Endpoints ──────────────────────────────────────────────────
export const createUser    = (data) => API.post('/users/', data);
export const getUser       = (id)   => API.get(`/users/${id}`);
export const getLeaderboard = (city) => API.get(`/users/leaderboard/${city}`);

// ─── Report Endpoints ─────────────────────────────────────────────────────────
export const detectHazard  = (imageFile) => {
  const fd = new FormData();
  fd.append('file', imageFile);
  return API.post('/detect', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const createReport     = (data)          => API.post('/reports/', data);
export const getAllReports     = ()              => API.get('/reports/');
export const getDashboardStats = ()             => API.get('/reports/dashboard/stats');
export const resolveReport    = (id)            => API.post(`/reports/${id}/resolve`);
export const confirmRepair    = (id, data)      => API.post(`/reports/${id}/confirm`, data);

// ─── Admin Endpoints ──────────────────────────────────────────────────────────
export const adminUpdateReport = (id, data) => API.patch(`/reports/${id}/admin`, data);

// ─── AI Hotspots ──────────────────────────────────────────────────────────────
export const getHotspots = () => API.get('/ai/hotspots');

// ─── Helper ───────────────────────────────────────────────────────────────────
export const getSavedUser = () =>
  JSON.parse(localStorage.getItem('roadwatch_user') || '{}');
