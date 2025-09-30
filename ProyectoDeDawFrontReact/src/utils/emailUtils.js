export const enviarCorreoBienvenida = async (correo, nombre) => {
    const response = await fetch("https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        controller: "mail",  
        method: "sendWelcomeEmail",  
        data: {
          to: correo,
          nombre: nombre,
        },
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al enviar correo");
    }
  
    return true;
  };
  