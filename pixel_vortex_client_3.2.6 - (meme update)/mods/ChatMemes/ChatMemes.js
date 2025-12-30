(function() {
    console.log("[ChatMemes] Mod Cargado - Versión Historial Persistente");

    if (!window.memeHistory) {
        window.memeHistory = new Set();
    }

    const MEME_BASE_PATH = "memes/mp4/";
    
    const memeFiles = [
        "Ahhhhh Plankton moaning.mp4",
        "Amo Su Inocencia.mp4",
        "Así de fácil_ Missasinfonia _Plantilla De Memes.mp4",
        "Ay que bonito no sabía eras poeta.mp4",
        "Bad Bunny Me cago me meo me tiro un peo.mp4",
        "Bien pensado Woody.mp4",
        "Bob Esponja 2,000 años mas tarde.webm",
        "Bob Esponja llorando y se va corriendo.mp4",
        "Bromeas Es un papucho.mp4",
        "CONCHETUMARE.mp4",
        "Casa que explota.mp4",
        "Coincidencia No lo creo.mp4",
        "Creí, creí que éramos amigos.mp4",
        "De que te sirve estar vivo si estás bien p1nch3 p3nd3j0.mp4",
        "De que te sirve estar vivo si estás bien pinche pendejo.mp4",
        "Desgraciado!.mp4",
        "Don cangrejo tacaño.mp4",
        "EXPLOSION.mp4",
        "El poder de la imaginación Bob Esponja.mp4",
        "Entrevista a Niño Rata.mp4",
        "Es todo un profesional.mp4",
        "Es una muy buena pregunta la verdad Auronplay.mp4",
        "Ese compa ya esta muerto, nomas no le han avisado.mp4",
        "Ese es un verdadero hombre.mp4",
        "Espartanos Au Au Au.mp4",
        "Esta informacion vale millones.mp4",
        "Estoy cansado jefe.mp4",
        "GRITO DE CRISTIANO SIUUU.mp4",
        "Gato, gato esto es esparta.mp4",
        "Gohan Sad.mp4",
        "Goku enojado.mp4",
        "Has flipao ehh.mp4",
        "Helicopter Helicopter.mp4",
        "Hola Dios soy yo de nuevo.mp4",
        "Hombre de negocios.mp4",
        "Huele A Venganza, Jesucristo Te Quiero Nene.mp4",
        "JA GAY.mp4",
        "JAJAJAJAJA.mp4",
        "Jiren asustado Dragon Ball.mp4",
        "La historia de dragón ball a llegado a su final.mp4",
        "La historia nunca olvidara tu coraje y sacrificio.mp4",
        "Libera tu mente Matrix.mp4",
        "Llamen a la policia, me estan matando!!.mp4",
        "Lo logro ese loco hijo del demonio lo logro.mp4",
        "Lo mismo pero mas barato.mp4",
        "Mas vale que te calmes, maldito asesino.mp4",
        "Me tientas, me tientas, hagamoslo.mp4",
        "Mi pierna,mi piernaaaaaaa.mp4",
        "Negro que piensa.mp4",
        "No cabron eso es pasarse de pinche lanza.mp4",
        "No digas mamádas meriyen.mp4",
        "No lo se tu dime.mp4",
        "No se muy bien como empezar esto.mp4",
        "No tengo pruebas Pero tampoco dudas.mp4",
        "Palmada en la frente.mp4",
        "Pueden cuestionar mis métodos, pero no pueden cuestionar mis resultados.mp4",
        "Que Es Eso  Bob Esponja.mp4",
        "Que Gay Hora De Aventura.mp4",
        "Rompiendo la computadora en el trabajo.mp4",
        "Se está volviendo salvaje.mp4",
        "Se marcho y a su barco lo llamó libertad.mp4",
        "Soy Francesco Virgolini fiuuuum.mp4",
        "Ta bien Goku.mp4",
        "Talvez no sepa lo que hago pero luzco genial haciéndolo.mp4",
        "Yamete kudasai meme gato.mp4",
        "a cambio de eso tuculseraparami.mp4",
        "a mi me llevan preso djmario.mp4",
        "afirmatorio me han funado.mp4",
        "ahhhh ahh ah.mp4",
        "alguien tiene que hacer algo porfavor.mp4",
        "alienigena riendose.mp4",
        "arriba España.mp4",
        "asi es bandita, esto es cine.mp4",
        "atrapada ayudaaa pokemon.mp4",
        "auron bailando.mp4",
        "awww meme shrek.mp4",
        "ay que miedo yo me voy.mp4",
        "ayudame loco.mp4",
        "chica metiendose dedo en la boca.mp4",
        "chico electrocutado.mp4",
        "chico llorando.mp4",
        "chico riendose.mp4",
        "chill de cojones.mp4",
        "chiste malo tambores.mp4",
        "cj sorprendido.mp4",
        "como tan muchacho.mp4",
        "creditos finales.mp4",
        "diablo que dificil me la pusiste.mp4",
        "eh peerdido coñoo.mp4",
        "el macho.mp4",
        "elegancia.mp4",
        "en efecto, es cine.mp4",
        "en ese momento cell sintio el verdadero terror.mp4",
        "es bellisimo.mp4",
        "es ho, es hoy.mp4",
        "ese verga es mi idolo a la verga.mp4",
        "eso me prende.mp4",
        "eso no me lo esperaba.mp4",
        "eso si que es otra onda.mp4",
        "eso sí que es otra onda.mp4",
        "esparta patada.mp4",
        "esta pequeña parte de mi vida se llama felicidad.mp4",
        "este muchacho me llena de orgullo.mp4",
        "esto va a ser epico papus.mp4",
        "estoy mamadisimo.mp4",
        "ey ey ey pequeña no digas eso.mp4",
        "fin el humano es disparado.mp4",
        "fiumba.mp4",
        "foca mirando meme.mp4",
        "gato negro cantando.mp4",
        "ha vuelto optimus esta aqui.mp4",
        "han pasado 84 año.mp4",
        "hasta la proxima.mp4",
        "hay uno negro eh, hay dos negros xokas.mp4",
        "hemos vuelto hijos de la gran put xokas.mp4",
        "hiciste lo correcto bob.mp4",
        "hombre de negocio.mp4",
        "homero bailando nene malo.mp4",
        "homero por que no escuchas tu cerebro.mp4",
        "huele a historiaa.mp4",
        "ibai riendose.mp4",
        "impresionado.mp4",
        "la decepcion, la traicion hermano.mp4",
        "la queso, la que soporte.mp4",
        "la roca meme.mp4",
        "lluvia de hamburguesas todos mirando al cielo.mp4",
        "maravillosa jugada.mp4",
        "marica aaa.mp4",
        "maxima potencia.mp4",
        "me engañaste, me mentiste.mp4",
        "me impacta.mp4",
        "me siento estafado.mp4",
        "meme grito.mp4",
        "mente pensando y explotando.mp4",
        "menudo monton de mierda.mp4",
        "mi primer hacktrik vinicius.mp4",
        "mmmm Niño Del Oxxo.mp4",
        "moco pinguino.mp4",
        "negro riendose fuerte.mp4",
        "negro riendose.mp4",
        "negro sorprendido.mp4",
        "negros mirandose de cerca.mp4",
        "nene bailando.mp4",
        "nene enojado jugando a la play.mp4",
        "nmms que asco.mp4",
        "no pueden matarme.mp4",
        "no puedo martha.mp4",
        "no-no-no-bueno-si.mp4",
        "noooooo.mp4",
        "nooooooo ya ni modo.mp4",
        "ohhh nooooo.mp4",
        "paraaaaaa.mp4",
        "pasando tarjeta de credito para comprar.mp4",
        "pase paca diamente para el free.mp4",
        "pedro pedro pedro.mp4",
        "perro feliz.mp4",
        "perro iluminati.mp4",
        "perro riendose fuerte.mp4",
        "perro sorprendido.mp4",
        "perro temblando del miedo frio.mp4",
        "persona aplaudiendo rapido.mp4",
        "persona mirando a la camara.mp4",
        "persona se asusta.mp4",
        "persona sola aplaudiendo.mp4",
        "personajes bailando.mp4",
        "policia lluvia de hamburguesas corriendo.mp4",
        "pucta que rico he.mp4",
        "que bendicion.mp4",
        "que duerman bien mis angelitos.mp4",
        "que miras bobo.mp4",
        "que que queee auron.mp4",
        "que, como que no.mp4",
        "que-buen-servicio.mp4",
        "quien sabe, ahi si no te puedo decir nada.mp4",
        "sida para ti, hijo del diablo.mp4",
        "sigan viendo animado.mp4",
        "silencio saturado among us.mp4",
        "sopa de macaco (Musica con copy).mp4",
        "speed loco.mp4",
        "spider man llorando.mp4",
        "spider man meme.mp4",
        "tanta carne y yo chimuelo.mp4",
        "te la tragas sin pretexto.mp4",
        "tenes que cerrar el estadio.mp4",
        "tia may se le explota la casa.mp4",
        "tia paola.mp4",
        "tortuga corriendo (Musica con copy).mp4",
        "turn Down for what.mp4",
        "uwu.mp4",
        "ven pa aca conshetumare versión GTA.mp4",
        "ven y sana mi dolor dragon ball.mp4",
        "ves eso es racista Pero tengo razón Pero tienes razón.mp4",
        "waaaaa chica queriendo vomitar.mp4",
        "what.mp4",
        "wtf esto es real.mp4",
        "y ya, esa es tu historia desgarradora.mp4",
        "ya no aguanto mas.mp4",
        "ya wey.mp4",
        "yo por ahi no paso.mp4",
        "yo tuve una idea.mp4"
    ];

    const memeMap = {};
    
    const VIDEO_STYLE = {
        maxWidth: '240px',
        maxHeight: '240px',
        borderRadius: '8px',
        marginTop: '8px',
        marginBottom: '8px',
        display: 'block',
        clear: 'both',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        border: '2px solid rgba(255,255,255,0.1)',
        backgroundColor: '#000'
    };

    memeFiles.forEach(file => {
        const nameWithoutSpaces = file.replace(/\s+/g, '-');
        const trigger = `:${nameWithoutSpaces}:`.toLowerCase();
        const url = MEME_BASE_PATH + encodeURIComponent(file);
        memeMap[trigger] = url;
    });

    console.log(`[ChatMemes] v3 Cargado. ${Object.keys(memeMap).length} memes listos.`);

    function normalizeText(text) {
        return text.toLowerCase().replace(/\s+/g, '').trim();
    }

    function checkAndInject(element) {
        if (!element || element.dataset.memeProcessed) return;

        const rawText = element.innerText || element.textContent || "";
        const cleanText = normalizeText(rawText);

        if (cleanText.length < 5) return;

        for (const [trigger, url] of Object.entries(memeMap)) {
            const cleanTrigger = trigger.replace(/-/g, '').replace(/:/g, '');

            if (rawText.toLowerCase().includes(trigger) || cleanText.includes(trigger.replace(/-/g, ''))) {
                console.log(`[ChatMemes] ¡MEME DETECTADO! Trigger: ${trigger}`);

                let targetContainer = element;
                const tag = targetContainer.tagName;
                
                while (targetContainer && targetContainer.tagName !== 'DIV' && targetContainer.tagName !== 'LI' && targetContainer !== document.body) {
                    targetContainer = targetContainer.parentElement;
                }

                if (!targetContainer || targetContainer === document.body) return; // Evitar inyectar en body

                if (targetContainer.querySelector('.chat-meme-wrapper')) {
                    element.dataset.memeProcessed = "true";
                    return;
                }

                const messageHash = rawText + "_" + trigger;
                
                let shouldAutoplay = true;
                if (window.memeHistory.has(messageHash)) {
                    console.log("[ChatMemes] Mensaje ya visto, desactivando autoplay.");
                    shouldAutoplay = false;
                } else {
                    window.memeHistory.add(messageHash);
                }

                element.dataset.memeProcessed = "true";
                targetContainer.dataset.memeProcessed = "true"; 

                try {
                    const walker = document.createTreeWalker(targetContainer, NodeFilter.SHOW_TEXT);
                    let textNode;
                    while (textNode = walker.nextNode()) {
                        if (textNode.textContent.includes(':') && (textNode.textContent.includes('.mp4') || textNode.textContent.includes('.webm') || textNode.textContent.includes(trigger.replace(/:/g,'')))) {
                             textNode.textContent = "";
                        }
                    }
                } catch(e) { console.warn("Error limpiando texto", e); }

                const container = document.createElement('div');
                container.className = 'chat-meme-wrapper';
                container.style.cssText = "display: block; width: 100%; clear: both; margin-top: 5px; position: relative; z-index: 9999;";
                
                const video = document.createElement('video');
                video.src = url;
                Object.assign(video.style, VIDEO_STYLE);
                
                video.autoplay = shouldAutoplay; // Solo reproduce si es la primera vez
                video.controls = false;
                video.loop = false; // Se reproduce una sola vez
                video.muted = false;

                
                video.onended = () => {
                     video.pause();
                };

                video.onloadeddata = () => {
                     if (shouldAutoplay) {
                         video.play().catch(() => {
                             video.muted = true;
                             video.play();
                         });
                     } else {
                        video.pause();
                        video.currentTime = 0;
                     }
                };
                
                video.onerror = () => {
                    console.error(`[ChatMemes] Error cargando: ${url}`);
                    container.innerText = "❌ Error loading meme";
                    container.style.color = "red";
                    container.style.fontSize = "10px";
                };

                container.appendChild(video);
                targetContainer.appendChild(container);
                
                return; 
            }
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    checkAndInject(node);
                    const children = node.querySelectorAll('*');
                    children.forEach(checkAndInject);
                }
            });
        });
    });

    setTimeout(() => {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log("[ChatMemes] Observer activado en BODY");
            document.body.querySelectorAll('*').forEach(checkAndInject);
        }
    }, 2000);

})();
