import axios from "./axios";

// Crear Usuario
export const createUser = async (userData) => {
  const { data } = await axios.post('/users', userData);
  return data;
};

// Obtener todos los Usuarios
export const getAllUsers = async (includeDeleted = false) => {
  const { data } = await axios.get(`/users?includeDeleted=${includeDeleted}`);
  return data;
};

// Obtener Usuario por ID
export const getUserById = async (id) => {
  const { data } = await axios.get(`/users/${id}`);
  return data;
};

// Obtener Usuario por Número de Documento
export const getUserByNumDoc = async (id, documentTypeId) => {
  const { data } = await axios.get(`/users/document/${id}`, {
    params: { documentTypeId }
  });
  return data;
};

// Actualizar Usuario
export const updateUser = async (id, userData) => {
  const { data } = await axios.put(`/users/${id}`, userData);
  return data;
};

// Eliminar Usuario
export const deleteUser = async (id) => {
  const { data } = await axios.delete(`/users/${id}`);
  return data;
};

// Restaurar Usuario
export const restoreUser = async (id) => {
  const { data } = await axios.put(`/users/restore/${id}`);
  return data;
};
