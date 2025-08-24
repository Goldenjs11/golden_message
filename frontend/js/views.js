    // Obtener el ID del mensaje desde la URL
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('id_messagge');

    if (!messageId) {
        alert("Falta el ID del mensaje");
    } else {
        fetch(`/api/message/${messageId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                console.log(data);
                const { message, messagedetails} = data.content;
                let vistasRestantes = data.vistasRestantes;

                document.getElementById('messageTitle').textContent = message.title;
                document.getElementById('vistasRestantes').textContent = vistasRestantes;
                document.getElementById('messageStatus').textContent = message.estado ? "Activo" : "Inactivo";

                if (message.qr_code) {
                    document.getElementById('qrContainer').style.display = 'block';
                    document.getElementById('qrImage').src = `/${message.qr_code.replace(/\\/g,'/')}`;
                }

                document.getElementById('messageLink').textContent = message.link;
                document.getElementById('messageLink').href = message.link;
            })
            .catch(err => {
                console.error(err);
                alert("Error al cargar el mensaje");
            });
    }