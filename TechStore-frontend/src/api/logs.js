import api from './auth';

export const getLogs = () => api.get('/logs');
