import api from './auth';

export const getUsers = () => api.get('/users');
export const getRoles = () => api.get('/roles');
export const assignRole = (userId, rol_id) => api.post(`/users/${userId}/roles`, { rol_id });
export const removeRole = (userId, rol_id) => api.delete(`/users/${userId}/roles/${rol_id}`);
