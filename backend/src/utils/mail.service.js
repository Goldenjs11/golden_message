import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();


const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:465,
    secure:true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
})


export async function enviarMailVerificacion(direccion, token){
    return await transporter.sendMail({
        from:"GOLDEN 😾  <teamevosgirls@gmail.com>",
        to:direccion,
        subject:"Verificacion de la nueva cuenta registrada",
        html: crearMailVerificacion(token)
    })
}

function crearMailVerificacion(token) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verificación de correo</title>
  <style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: #333333;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 40px;
    }
    h1 {
        color: #0a4d68; /* color principal de tu página */
        font-size: 24px;
        margin-bottom: 20px;
    }
    p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
    }
    a.button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #0a4d68; /* color de botones de la web */
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
    }
    a.button:hover {
        background-color: #0c5f7f;
    }
    .footer {
        font-size: 14px;
        color: #666666;
        margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verificación de correo electrónico</h1>
    <p>Se ha creado una cuenta en <strong>Golden Message</strong> con este correo electrónico.</p>
    <p>Si esta cuenta no fue creada por usted, ignore este correo.</p>
    <p>Si usted creó la cuenta, verifíquela haciendo clic en el botón a continuación:</p>
    <p><a class="button" href="http://localhost:4000/verificar/${token}" target="_blank" rel="noopener noreferrer">Verificar Cuenta</a></p>
    <div class="footer">
        <p><strong>Calo</strong> – CEO Golden</p>
    </div>
  </div>
</body>
</html>
    `;
}



function crearMailRestablecerContrasena(
    usuarioNombre,
    nombreUsuarioQueCambioContrasena,
    rolUsuarioQueCambioContrasena
  ) {
    let cuerpo = `
      <!DOCTYPE html>
    <html lang="en">
    <style>
        html{
            background-color: white;
        }
        body{
            max-width: 600px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: auto;
            background-color: rgb(229, 255, 246);
            padding: 40px;
            margin-top: 10px;
        }
    </style>
    <body>
        <h1>Notificación de restablecimiento de contraseña</h1>
    `;
  
    if (usuarioNombre === nombreUsuarioQueCambioContrasena) {
      cuerpo += `
        <p>Ha restablecido la contraseña de su cuenta en el Golden Contable.</p>
      `;
    } else {
      cuerpo += `
        <p>El administrador ${nombreUsuarioQueCambioContrasena} (${rolUsuarioQueCambioContrasena}) ha restablecido la contraseña de su cuenta en el Club Deportes Tolima.</p>
      `;
    }
  
    cuerpo += `
        <p>Si usted no solicitó este cambio, por favor contacte con nuestro equipo de soporte.</p>
        <p>Si usted restableció la contraseña, puede iniciar sesión con su nueva contraseña.</p>
  
        <p><strong>Calo</strong></p>
        <p>CEO GOLDEN</p>
    </body>
    </html>
    `;
  
    return cuerpo;
  }
  
  export async function enviarMailRestablecerContrasena(
    usuarioCorreo,
    usuarioNombre,
    nombreUsuarioQueCambioContrasena,
    rolUsuarioQueCambioContrasena
  ) {
    return await transporter.sendMail({
      from: "GOLDEN  <teamevosgirls@gmail.com>",
      to: usuarioCorreo,
      subject: "Notificación de restablecimiento de contraseña",
      html: crearMailRestablecerContrasena(
        usuarioNombre,
        nombreUsuarioQueCambioContrasena,
        rolUsuarioQueCambioContrasena
      ),
    });
  }


  function crearMailGenerico(asunto, mensaje) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <style>
          html{
              background-color: white;
          }
          body{
              max-width: 600px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: auto;
              background-color: rgb(229, 255, 246);
              padding: 40px;
              margin-top: 10px;
          }
      </style>
      <body>
          <h1>${asunto}</h1>
          <p>${mensaje}</p>
          <p><strong>Calo</strong></p>
          <p>CEO GOLDEN</p>
      </body>
      </html>
      `;
  }
  
  export async function enviarMailGenerico(correo, asunto, mensaje) {
    return await transporter.sendMail({
      from: "GOLDEN  <teamevosgirls@gmail.com>",
      to: correo,
      subject: asunto,
      html: crearMailGenerico(asunto, mensaje),
    });
  }

