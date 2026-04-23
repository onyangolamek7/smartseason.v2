import api from './client'

export const authApi = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
  me:     ()     => api.get('/auth/me'),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const fieldsApi = {
  list:    ()         => api.get('/fields'),
  get:     (id)       => api.get(`/fields/${id}`),
  create:  (data)     => api.post('/fields', data),
  update:  (id, data) => api.put(`/fields/${id}`, data),
  delete:  (id)       => api.delete(`/fields/${id}`),
  abandon: (id)       => api.post(`/fields/${id}/abandon`),
  restore: (id)       => api.post(`/fields/${id}/restore`),
  agents:  ()         => api.get('/agents'),
}

export const updatesApi = {
  list:   (fieldId)       => api.get(`/fields/${fieldId}/updates`),
  create: (fieldId, data) => api.post(`/fields/${fieldId}/updates`, data),
}

export const usersApi = {
  list:   ()         => api.get('/users'),
  create: (data)     => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id)       => api.delete(`/users/${id}`),
}