import { useState } from "react";
import AceEditor from "react-ace";
import axios from "axios";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-javascript";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CodeEditor.css";

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(""); // Estado para el mensaje de error
  const [selectedLanguage, setSelectedLanguage] = useState("java");

  const languageMappings = {
    java: "java",
    python: "py",
    c_cpp: "cpp",
    javascript: "js",
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const runCode = async () => {
    // Muestra un SweetAlert de "Compilando..."
    Swal.fire({
      title: "Compilando...",
      allowOutsideClick: false, // Evita que el usuario cierre la alerta haciendo clic fuera de ella
      onBeforeOpen: () => {
        Swal.showLoading(); // Muestra el icono de carga
      },
    });

    try {
      const response = await axios.post(
        "https://api.codex.jaagrav.in",
        {
          code,
          language: languageMappings[selectedLanguage],
          input: "",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      let error = response.data.error !== "" ? response.data.error + "" : "";

      setError(error);

      // Actualiza la salida
      setOutput(response.data.output);
    } catch (error) {
      // Maneja el error y muestra el mensaje de error en la interfaz
      console.log(error);
      console.error("Error al compilar y ejecutar el código:");
    } finally {
      // Cierra la alerta de SweetAlert cuando la petición ha terminado
      Swal.close();
    }
  };

  const guardarArchivo = () => {
    // Obtiene la extensión del archivo según el lenguaje seleccionado
    const extension = languageMappings[selectedLanguage] || "txt";

    // Define el nombre del archivo con la extensión correspondiente
    const archivoNombre = `codigo-guardado.${extension}`;

    // Crea un Blob con el contenido y tipo de contenido adecuados
    const archivo = new Blob([code], {
      type: `text/${extension};charset=utf-8`,
    });

    // Utiliza la función saveAs de FileSaver.js para guardar el archivo
    saveAs(archivo, archivoNombre);
  };

  return (
    <div className="container mt-4">
      <select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        className="form-control mt-3 mb-3"
      >
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="c_cpp">C++</option>
        <option value="javascript">JavaScript</option>
      </select>
      <AceEditor
        mode={selectedLanguage}
        theme="monokai"
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        width="100%"
        height="400px"
        value={code}
        onChange={handleCodeChange}
      />

      <div className="btn-group mt-3 mb-3">
        <button className="btn btn-primary" onClick={runCode}>
          Ejecutar
        </button>
        <button className="btn btn-success" onClick={guardarArchivo}>
          Guardar
        </button>
      </div>

      <div className="output-container">
        <h2>Salida:</h2>
        {error ? <pre>{error}</pre> : <pre>{output}</pre>}
      </div>
    </div>
  );
};

export default CodeEditor;
