import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  ObjetoEncaminhado,
  ObjetoEntregue,
  ObjetoPostado,
  SaiuEntrega,
  StatusDefaultIcon,
} from "./eventosIcons";
import "react-toastify/dist/ReactToastify.css";
import api from "./services/api";
import logo from "./assets/img/package.svg";
import { ReactComponent as LoadingIcon } from "./assets/img/loading.svg";
import { ReactComponent as TrashIcon } from "./assets/img/trash.svg";

function App() {
  const [objetos, setObjetos] = useState([]);
  const [code, setCode] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function detetarCodigoAreaTransferencia() {
      const clipboard = navigator.clipboard;

      if (typeof clipboard != "undefined") {
        navigator.clipboard.readText().then((text) => {
          if (text && [...text].length === 13) {
            if (!checkObjetoExiste(text)) {
              setCode(text);
            }
          }
        }).catch(error => {});
      }
    }

    detetarCodigoAreaTransferencia();
  });

  useEffect(() => {
    let obj = localStorage.getItem("@faro-encomendas/objetos") ?? [];
    if (obj.length > 0) {
      obj = JSON.parse(obj);
    }

    setObjetos(obj);
  }, []);

  async function handleSubmitAdicionarRastreio(e) {
    e.preventDefault();
    setLoading(true);
    const objetoExiste = checkObjetoExiste(code);
    if (objetoExiste) {
      setTimeout(() => {
        toast.warning("Esta encomenda já foi adicionada!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data } = await api.post("/rastreio", {
        code: code,
        type: "LS",
      });

      const eventos = data.objeto[0].evento.reverse();
      const ultimoEvento = eventos.pop();
      const rastreio = {
        descricao,
        code,
        rastreio: eventos,
        ultimo_evento: ultimoEvento,
      };
      localStorage.setItem(
        "@faro-encomendas/objetos",
        JSON.stringify([rastreio, ...objetos])
      );
      setObjetos([rastreio, ...objetos]);
      toast.success("Encomenda adicionada!", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetarFormulario();
    } catch (error) {
      toast.warning("Encomenda não encontrada!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setLoading(false);
    //localStorage.setItem("@faro-encomendas/objetos", )
  }

  function handleDeleteOrder(code) {
    if (!objetos || objetos.length === 0) {
      toast.warning("Encomenda não encontrada!", { autoClose: 2500 });
      return;
    }
    const novoArrayObjetos = objetos.filter((item) => item.code !== code);
    toast.success("Encomenda excluida!", { autoClose: 2500 });
    localStorage.setItem(
      "@faro-encomendas/objetos",
      JSON.stringify(novoArrayObjetos)
    );
    setObjetos(novoArrayObjetos);
  }

  function resetarFormulario() {
    setCode("");
    setDescricao("");
  }
  const checkObjetoExiste = (codeEncomenda) => {
    let existe = false;
    if (objetos.length > 0) {
      objetos.forEach((item) => {
        if (item.code === codeEncomenda) {
          existe = true;
          return;
        }
      });
    }
    return existe;
  };
  const RenderIconStatus = ({ tipoEvento, statusEvento }) => {
    if (tipoEvento === "DO" || tipoEvento === "RO") {
      return <ObjetoEncaminhado className="w-6 h-6" />;
    }

    if (tipoEvento === "OEC") {
      return <SaiuEntrega className="w-6 h-6" />;
    }

    if (
      (tipoEvento === "BDE" &&
        (statusEvento === "01" ||
          statusEvento === "23" ||
          statusEvento === "67" ||
          statusEvento === "68" ||
          statusEvento === "70")) ||
      (tipoEvento === "BDI" &&
        (statusEvento === "01" ||
          statusEvento === "23" ||
          statusEvento === "67" ||
          statusEvento === "68" ||
          statusEvento === "70")) ||
      (tipoEvento === "DBR" &&
        (statusEvento === "01" ||
          statusEvento === "23" ||
          statusEvento === "67" ||
          statusEvento === "68" ||
          statusEvento === "70"))
    ) {
      return <ObjetoEntregue className="w-6 h-6" />;
    }

    if (
      tipoEvento === "PO" &&
      (statusEvento === "01" || statusEvento === "09")
    ) {
      return <ObjetoPostado className="w-6 h-6" />;
    }

    return <StatusDefaultIcon className="w-6 h-6" />;
  };
  const ButtonAddRastreio = ({ loading, rest }) => {
    return (
      <button
        className={`rounded-md bg-purple-600 text-white px-3 py-1.5 mt-4 w-max flex items-center ${
          loading ? "bg-opacity-60" : ""
        }`}
        disabled={loading}
        {...rest}
      >
        Adicionar
        {loading && (
          <LoadingIcon className="text-white w-4 h-4 ml-2 animate-spin" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen border relative">
      <div className="container sm:max-w-2xl mx-auto">
        <img alt="Logo app" className="w-60 mx-auto pt-7" src={logo} />
        <div className="flex flex-col justify-center mt-8 px-4">
          <form onSubmit={handleSubmitAdicionarRastreio} action="w-full">
            <label className="block font-semibold text-gray-800">
              Descrição
            </label>
            <input
              className="rounded-lg border px-2 py-2 my-1 focus:outline-none w-full focus:ring focus:ring-gray-200"
              type="text"
              value={descricao}
              required
              onChange={(e) => setDescricao(e.target.value)}
            />
            <label className="block font-semibold text-gray-800">
              Cód. objeto
            </label>
            <input
              className="rounded-lg border px-2 py-2 my-1 focus:outline-none w-full focus:ring focus:ring-gray-200"
              type="text"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
            />
            <ButtonAddRastreio type="submit" loading={loading} />
          </form>
        </div>
        <div className="px-4 py-4">
          <ul>
            {objetos &&
              objetos.map((item, index) => {
                return (
                  <li
                    key={`${index}`}
                    className="my-2 bg-white rounded-md px-4 py-2 flex items-center"
                  >
                    <div className="">
                      <RenderIconStatus
                        tipoEvento={item.ultimo_evento.tipo}
                        statusEvento={item.ultimo_evento.status}
                      />
                    </div>
                    <div className="mx-4 flex-1">
                      <h2 className="text-lg font-semibold">
                        {item.descricao}
                      </h2>
                      <span className="block">
                        {item.ultimo_evento.descricao}
                      </span>
                      <span>{item.code}</span>
                    </div>
                    <div>
                      <TrashIcon
                        onClick={() => handleDeleteOrder(item.code)}
                        className="w-8 border p-1 rounded-md text-red-500 border-red-300"
                      />
                    </div>
                  </li>
                );
              })}

            {objetos.length === 0 && (
              <h2 className="text-center text-gray-600 mt-2">
                Nenhuma encomenda!
              </h2>
            )}
          </ul>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
export default App;
