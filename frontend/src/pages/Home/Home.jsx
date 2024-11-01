import ConfirmationModal from "../../utils/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { FaImage, FaPowerOff, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Select from "react-select";
import {
  getAllStores,
  createDataForm,
  getAllPromotions,
  getClientByNumDoc,
  getAllDocumentTypes,
  getStoreDetails,
  uploadFile,
  validateDataForm,
} from "../../api/dataFormApi";

const Home = () => {
  const { currentUser, isAuthenticated, logoutUser } = useAuth();
  const [isPromotionValid, setIsPromotionValid] = useState(false);

  const urlBase = import.meta.env.VITE_URL;
  const navigate = useNavigate();

  const currentDate = new Date();
  const limaTime = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);
  const formattedDate = limaTime.toISOString().split("T")[0];

  const [exchangeDate, setExchangeDate] = useState(
    // new Date().toISOString('en-CA', { timeZone: 'America/Lima' }).split("T")[0]
    formattedDate
  );

  const [prevNumberDocumentLength, setPrevNumberDocumentLength] = useState(0);
  const [isClientNameEditable, setIsClientNameEditable] = useState(false);
  const [numberDocumentClient, setNumberDocumentClient] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [ticketNumber, setTicketNumber] = useState("");
  const [promotionId, setPromotionId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [clientName, setClientName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState([]);
  const [errors, setErrors] = useState({});
  const [path, setPath] = useState("");

  const fileInputRef = useRef(null);

  const ticketTypes = [
    { value: 1, label: "Aterax" },
    // { value: 2, label: "Golden Race" },
  ];

  const [ticketTypeId, setTicketTypeId] = useState(ticketTypes[0]);
  const [storeDetailsData, setstoreDetailsData] = useState({});

  useEffect(() => {
    if (numberDocumentClient.length < prevNumberDocumentLength) {
      setClientName("");
    }
    setPrevNumberDocumentLength(numberDocumentClient.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberDocumentClient]);

  const [formData, setFormData] = useState({
    clientName: "",
    numberDocumentClient: "",
    ticketNumber: "",
    exchangeDate: "",
    storeId: "",
    promotionId: "",
    documentTypeId: "",
  });

  // Get all stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getAllStores();

        setStores(
          data.data.map((store) => ({
            value: store.storeId,
            label: store.storeName,
            labell: store.district,
          }))
        );
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  // Get all document types
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const data = await getAllDocumentTypes();
        setDocumentTypes(
          data.data.map((docType) => ({
            value: docType.documentTypeId,
            label: docType.documentTypeName,
          }))
        );
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Get all promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getAllPromotions();
        setPromotions(
          data.data.map((promotion) => ({
            value: promotion.promotionId,
            label: promotion.promotionName,
          }))
        );
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  // Validaciones de formulario
  const validateForm = () => {
    const requiredFields = [
      {
        field: clientName,
        name: "clientName",
        message: "El nombre del cliente es obligatorio.",
      },
      {
        field: numberDocumentClient,
        name: "numberDocumentClient",
        message: "El número de documento es obligatorio.",
      },
      {
        field: ticketNumber,
        name: "ticketNumber",
        message: "El número de ticket es obligatorio.",
      },
      {
        field: exchangeDate,
        name: "exchangeDate",
        message: "La fecha es obligatoria.",
      },
      {
        field: storeId,
        name: "store",
        message: "Debe seleccionar una tienda.",
      },
      {
        field: promotionId,
        name: "promotionId",
        message: "Debe seleccionar una promoción.",
      },
      {
        field: documentTypeId,
        name: "documentTypeId",
        message: "Debe seleccionar un tipo de documento.",
      },
      {
        field: ticketTypeId,
        name: "ticketTypeId",
        message: "Debe seleccionar un tipo de ticket.",
      },
      {
        field: path,
        name: "path",
        message: "La imagen es obligatoria.",
      },
    ];

    const formErrors = requiredFields.reduce(
      (errors, { field, name, message }) => {
        if (!field) errors[name] = message;
        return errors;
      },
      {}
    );

    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  };

  const apiDni = async (dni) => {
    const token = import.meta.env.VITE_API_KEY;
    const url = `https://api.apuestatotal.com/v2/dni?dni=${dni}`;

    try {
      if (documentTypeId.value === 1) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          console.error("Error consultando cliente", response.status);
          return null;
        }
      } else {
        toast.error("Solo se permite consulta por DNI.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      return null;
    }
  };

  const searchClient = async () => {
    if (!numberDocumentClient || !documentTypeId.value) {
      toast.error("Debe ingresar el número y tipo de documento.");
      return;
    }

    try {
      const client = await getClientByNumDoc(
        numberDocumentClient,
        documentTypeId.value
      );

      if (client && client.data && client.data.length > 0) {
        setClientName(
          `${client.data[0].nombres} ${client.data[0].apePaterno} ${client.data[0].apeMaterno}`
        );

        setIsClientNameEditable(false);
        toast.success("Cliente encontrado en base de datos interna!");
      } else {
        toast.error("Cliente no encontrado en base de datos interna.");
      }
    } catch (error) {
      if (!error.response.data.success) {
        const clientDni = await apiDni(numberDocumentClient);
        if (clientDni && clientDni.http_code === 200) {
          setClientName(
            `${clientDni.result.nombres} ${clientDni.result.apellido_paterno} ${clientDni.result.apellido_materno}`
          );

          console.log(clientDni);
          setIsClientNameEditable(false);
          toast.success("Cliente encontrado en API de DNI!");
          return;
        } else {
          toast.info(
            "Cliente no encontrado en API de DNI, buscando en base de datos interna."
          );
        }
      }
      console.error("Error buscando cliente:", error.response.data.message);
    }
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPromotionValid) {
      toast.error(
        "Por favor, valida la promoción del cliente antes de enviar."
      );
      return;
    }

    if (!validateForm()) {
      toast.error("Por favor, corrija los errores antes de enviar.");
      return;
    }

    setShowModal(true);

    const storeDetails = await getStoreDetails(storeId.value);
    console.log(storeDetails);

    if (storeDetails && storeDetails.success && storeDetails.data.length > 0) {
      setstoreDetailsData({
        supervisorNombre: storeDetails.data[0].supervisorNombre,
        zonaNombre: storeDetails.data[0].zonaNombre,
      });
    } else {
      toast.error("No se encontraron datos para el storeId");
    }

    setFormData({
      clientName,
      numberDocumentClient,
      ticketNumber,
      exchangeDate,
      storeId: storeId ? storeId.label : "",
      promotionId: promotionId ? promotionId.label : "",
      documentTypeId: documentTypeId ? documentTypeId.label : "",
      ticketTypeId: ticketTypeId ? ticketTypeId.label : "",
      path,
      ...storeDetailsData,
    });
  };

  const handleConfirm = async () => {
    setShowModal(false);
    console.log(formData);

    try {
      const dataForm = {
        userId: parseInt(currentUser.userId, 10),
        exchangeDate: new Date(exchangeDate).toISOString(),
        clientName,
        numberDocumentClient,
        storeId: storeId ? storeId.value : "",
        promotionId: parseInt(promotionId.value, 10),
        ticketNumber,
        documentTypeId: parseInt(documentTypeId.value, 10),
        ticketTypeId: parseInt(ticketTypeId.value, 10),
        path,
      };

      const response = await createDataForm(dataForm);

      console.log(response);

      if (response.success) {
        console.log("DataForm created:", response);
        toast.success("Formulario enviado con éxito!");

        setClientName("");
        setNumberDocumentClient("");
        setTicketNumber("");
        setStoreId("");
        setPromotionId("");
        setDocumentTypeId("");
        setTicketTypeId("");
        setPath("");

        setFormData({});
        setPreviewImage("");
        setIsPromotionValid(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        console.log("Error:", response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error creating DataForm:", error);
      toast.error(error.response.data.error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const uploadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      const formData = new FormData();
      formData.append("image", file);

      uploadFile(formData)
        .then((response) => {
          if (response.success) {
            toast.success(response.message);
            setPath(response.filePath);

            console.log("File uploaded successfully:", response);
          } else {
            toast.error("Error al subir la imagen");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const validatePromotion = async () => {
    if (!numberDocumentClient) {
      toast.error("Por favor, completa el campo Número de Documento.");
      return;
    }

    if (!documentTypeId.value) {
      toast.error("Por favor, selecciona un Tipo de Documento.");
      return;
    }

    if (!promotionId.value) {
      toast.error("Por favor, selecciona una Promoción.");
      return;
    }

    const validationResponse = await validateDataForm(
      numberDocumentClient,
      documentTypeId.value,
      promotionId.value
    );

    if (validationResponse.success) {
      toast.success("Promoción válida!");
      console.log(validationResponse);
      setIsPromotionValid(true);
    } else {
      toast.error(validationResponse.message);
      setIsPromotionValid(false);
      console.log(validationResponse);
    }
  };

  const resetForm = () => {
    setClientName("");
    setNumberDocumentClient("");
    setTicketNumber("");
    setStoreId("");
    setPromotionId("");
    setDocumentTypeId("");
    setTicketTypeId("");
    setPath("");
    setPreviewImage("");
    setErrors({});
    setIsPromotionValid(false);
    setIsClientNameEditable(false);
    setDocumentTypeId("");
    setTicketTypeId("");
    setShowModal(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 py-8">
      <ConfirmationModal
        show={showModal}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        formData={formData}
        storeDetails={storeDetailsData}
      />

      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-lg">
        <ToastContainer />
        <img src="logo2.png" alt="Logo" className="w-40 mx-auto" />
        <h1 className="text-2xl font-bold text-center mb-1 text-slate-800">
          Bienvenido
          {isAuthenticated && currentUser ? `, ${currentUser.userName}` : ""}
        </h1>
        <p className="text-lg text-center text-indigo-600 mt-4 mb-8">
          {isAuthenticated
            ? "Has iniciado sesión con éxito. ¡Registra la promoción!"
            : "Por favor, inicia sesión para acceder a tu cuenta."}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* DocumentTypeId */}
            <div>
              <Select
                options={documentTypes}
                placeholder="Tipo de documento"
                value={documentTypeId}
                disabled={isPromotionValid}
                onChange={(selectedOption) => {
                  setDocumentTypeId(selectedOption);
                  setClientName("");
                  setNumberDocumentClient("");

                  if (selectedOption.label === "DNI") {
                    setIsClientNameEditable(false);
                  } else if (
                    selectedOption.label === "CE" ||
                    selectedOption.label === "Pasaporte"
                  ) {
                    setIsClientNameEditable(true);
                  }
                }}
              />
            </div>

            {/* NumberDocumentClient */}
            <div>
              <div className="flex">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="numberDocumentClient"
                  type="text"
                  placeholder="Número de documento"
                  value={numberDocumentClient}
                  disabled={isPromotionValid}
                  onInput={(e) => {
                    const value = e.target.value;
                    if (value.length <= 12) {
                      setNumberDocumentClient(value);
                    }
                  }}
                  onPaste={() => {
                    setNumberDocumentClient("");
                  }}
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white py-2 px-4 rounded ml-2 hover:bg-blue-500 focus:outline-none focus:shadow-outline"
                  onClick={searchClient}
                >
                  Buscar
                </button>
              </div>

              {errors.numberDocumentClient && (
                <p className="text-red-500 text-sm">
                  {errors.numberDocumentClient}
                </p>
              )}
            </div>

            {/* PromotionId */}
            <div>
              <Select
                options={promotions}
                placeholder="Selecciona una promoción"
                value={promotionId}
                onChange={setPromotionId}
                disabled={isPromotionValid}
              />
              {errors.promotionId && (
                <p className="text-red-500 text-sm">{errors.promotionId}</p>
              )}
            </div>

            {/* ClientName */}
            <div>
              <div className="flex">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="clientName"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  readOnly={!isClientNameEditable}
                  disabled={isPromotionValid}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white py-2 px-4 rounded ml-2 hover:bg-red-400 focus:outline-none focus:shadow-outline"
                  onClick={validatePromotion}
                >
                  Validar
                </button>
              </div>
              {errors.clientName && (
                <p className="text-red-500 text-sm">{errors.clientName}</p>
              )}
            </div>

            {/* Stores */}
            <div>
              <Select
                options={stores}
                placeholder="Selecciona una tienda"
                value={storeId}
                onChange={setStoreId}
              />
              {errors.store && (
                <p className="text-red-500 text-sm">{errors.store}</p>
              )}
            </div>

            {/* ExchangeDate */}
            <div>
              <input
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="exchangeDate"
                type="date"
                placeholder="Fecha de intercambio"
                value={exchangeDate}
                onChange={(e) => setExchangeDate(e.target.value)}
              />
              {errors.exchangeDate && (
                <p className="text-red-500 text-sm">{errors.exchangeDate}</p>
              )}
            </div>

            {/* TicketType */}
            <div>
              <Select
                options={ticketTypes}
                placeholder="Selecciona el tipo de ticket"
                value={ticketTypeId}
                onChange={(selectedOption) => {
                  setTicketTypeId(selectedOption);
                  if (selectedOption === null) {
                    setTicketNumber("");
                    console.log(selectedOption);
                  }
                }}
              />
              {errors.ticketTypeId && (
                <p className="text-red-500 text-sm">{errors.ticketTypeId}</p>
              )}
            </div>

            {/* TicketNumber */}
            <div>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="ticketNumber"
                type="text"
                placeholder="Ingresa el número de ticket"
                value={ticketNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 10) {
                    setTicketNumber(value);
                  }
                }}
              />
              {errors.ticketNumber && (
                <p className="text-red-500 text-sm">{errors.ticketNumber}</p>
              )}
            </div>

            {/* Upload Image */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center justify-center w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaImage className="mr-2" />
                Seleccionar imagen
              </button>

              <input
                id="imageUpload"
                type="file"
                onChange={uploadImage}
                ref={fileInputRef}
                accept="image/png,image/jpeg"
                className="hidden"
              />

              {previewImage && (
                <div className="mt-4 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-2">
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="max-w-full h-auto rounded-md shadow-md"
                  />
                </div>
              )}

              {errors.path && (
                <p className="text-red-500 text-sm mt-2">{errors.path}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-8">
            {/* Validation */}
            <button
              className="bg-yellow-400 text-gray py-2 px-8 rounded hover:bg-yellow-500 focus:outline-none focus:shadow-outline"
              type="button"
              onClick={resetForm}
            >
              Limpiar
            </button>

            {/* Send */}
            <button
              className="bg-indigo-600 text-white py-2 px-8 rounded hover:bg-indigo-500 focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Enviar
            </button>

            {/* Logout */}
            <button
              className="fixed top-8 right-8 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none focus:shadow-outline"
              type="button"
              onClick={logoutUser}
            >
              <FaPowerOff size={20} />
            </button>

            {/* User */}
            <button
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => navigate(urlBase + "user")}
            >
              <FaUser size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
