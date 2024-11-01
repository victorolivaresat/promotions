/* eslint-disable react-hooks/exhaustive-deps */
import {
  FaUser,
  FaIdCard,
  FaTrash,
  FaPlus,
  FaEdit,
  FaTimes,
  FaPowerOff,
  FaHome,
} from "react-icons/fa";
import {
  createUser,
  getAllUsers,
  deleteUser,
  updateUser,
  restoreUser,
} from "../../api/userApi";
import DataTable from "react-data-table-component";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const User = () => {
  const [formData, setFormData] = useState({ userName: "", nationalId: "" });
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const { currentUser, logoutUser } = useAuth();

  const allowedNationalIds = ["44556494", "72915216", "74087869"];
  const urlBase = import.meta.env.VITE_URL;

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [includeDeleted]);

  const fetchUsers = async () => {
    const users = await getAllUsers(includeDeleted);
    setUsers(users.data);
  };

  const MySwal = withReactContent(Swal);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateUser(editUserId, formData);
    } else {
      await createUser(formData);
    }
    fetchUsers();
    setShowModal(false);
    setFormData({ userName: "", nationalId: "" });
    setIsEditing(false);
  };

  const handleEdit = (user) => {
    setFormData({ userName: user.userName, nationalId: user.nationalId });
    setEditUserId(user.userId);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    MySwal.fire({
      title: "¿Estás seguro?",
      text: "No podrás deshacer esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUser(id);
        fetchUsers();
        MySwal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
      }
    });
  };

  const handleRestore = async (id) => {
    await restoreUser(id);
    fetchUsers();
    MySwal.fire("Restaurado", "El usuario ha sido restaurado.", "success");
  };

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText("");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (user.userName &&
          user.userName.toLowerCase().includes(filterText.toLowerCase())) ||
        (user.nationalId &&
          user.nationalId.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [users, filterText]);

  const columns = [
    {
      name: "Name",
      selector: (row) => row.userName.toUpperCase(),
    },
    {
      name: "DNI",
      selector: (row) => row.nationalId,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none"
          >
            <FaEdit size={18} />
          </button>
          {row.deletedAt ? (
            <button
              onClick={() => handleRestore(row.userId)}
              className="px-3 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none"
            >
              <FaPlus size={18} />
            </button>
          ) : (
            <button
              onClick={() => handleDelete(row.userId)}
              className="px-3 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 focus:outline-none"
            >
              <FaTrash size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!allowedNationalIds.includes(currentUser.nationalId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
        <h2 className="text-2xl font-bold text-red-600">
          No tienes permisos para ver esta vista
        </h2>

        <div className="mt-6">
          <Link
            to={urlBase}
            className="px-8 py-3 bg-slate-600 text-white text-lg font-semibold shadow hover:bg-slate-700 transition"
          >
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-4xl m-4 p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-900">
          Usuarios
        </h2>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={() => {
              setIncludeDeleted(!includeDeleted);
              fetchUsers();
            }}
            className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer transition duration-150 ease-in-out mr-3"
            aria-label="Incluir eliminados"
          />
          <label className="text-gray-800 font-medium cursor-pointer">
            Incluir eliminados
          </label>
        </div>

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none border-b border-gray-300"
          />
          <button
            onClick={handleClear}
            className="ml-4 px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
              setFormData({ userName: "", nationalId: "" });
            }}
            className="ml-4 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none"
          >
            <FaPlus />
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          paginationResetDefaultPage={resetPaginationToggle}
          paginationPerPage={5}
        />
      </div>

      <button
        className="fixed top-8 right-8 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none focus:shadow-outline"
        type="button"
        onClick={logoutUser}
      >
        <FaPowerOff size={20} />
      </button>

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 focus:outline-none focus:shadow-outline"
        type="button"
        onClick={() => navigate(urlBase)}
      >
        <FaHome size={20} />
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold text-center">
              {isEditing ? "Editar Usuario" : "Registro de Usuario"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center border-b border-gray-300 py-2">
                <FaUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  name="userName"
                  placeholder="Nombre de Usuario"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <FaIdCard className="text-gray-500 mr-3" />
                <input
                  type="text"
                  name="nationalId"
                  placeholder="ID Nacional"
                  value={formData.nationalId}
                  onChange={handleChange}
                  className="w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none"
                >
                  {isEditing ? "Actualizar" : "Registrarse"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700 focus:outline-none"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
