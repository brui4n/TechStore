import api from './auth';

export const getRoles = () => api.get('/roles');
export const getPermisos = () => api.get('/roles/permisos');
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);
