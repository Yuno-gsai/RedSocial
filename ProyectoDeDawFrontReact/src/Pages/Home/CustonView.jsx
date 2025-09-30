import { Conten } from "./Conten";
import { PerfilContainer } from "../CustonPerfil/PerfilContainer";
import { AmigosRender } from "../Amigos/AmigosRender";
import { ContenedorMensajes } from "../Mensajes/ContenedorMesajes";
import { Configuracion } from "../Configuracion/Configuracion";

export const CustomView = ({ selected }) => {
    switch (selected) {
      case "inicio":
        return <Conten />;
      case "amigos":
        return <AmigosRender />;
      case "mensajes":
        return <ContenedorMensajes />;
      case "perfil":
        return <PerfilContainer />;
      case "configuracion":
        return <Configuracion />;
      default:
        return <div>Bienvenido</div>;
    }
  };
  