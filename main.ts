/**
 * microspade — Agentes inteligentes ligeros para BBC micro:bit
 */
//% color="#4a90e2" icon="\u2660" block="Microspade" groups='["Agente", "Comportamientos", "Mensajes"]'
namespace microspade {
    // Variables de estado del Agente (Singleton)
    export let agentName = "agent";
    export let running = false;
    let setupCallback: () => void = null;

    /**
     * Crea e inicializa el agente con un contenedor para variables y comportamientos.
     */
    //% block="create agent $name"
    //% blockId="microspade_create_agent"
    //% name.defl="agent"
    //% handlerStatement=true
    //% group="Agente"
    //% weight=100
    export function createAgent(name: string, handler: () => void): void {
        agentName = name;
        setupCallback = handler;
        running = false;
    }

    /**
     * Arranca el agente y activa sus comportamientos.
     */
    //% block="start agent"
    //% blockId="microspade_start_agent"
    //% group="Agente"
    //% weight=95
    export function startAgent(): void {
        if (setupCallback) {
            setupCallback();
        }

        // Registrar el receptor de radio en segundo plano
        radio.onReceivedString(function (receivedString) {
            let msg = Message.decode(receivedString);
            if (msg) {
                if (msg.getTo() === agentName || msg.getTo() === "*") {
                    queueMessage(msg);
                }
            }
        });

        running = true;
    }

    /**
     * Detiene al agente y apaga sus comportamientos.
     */
    //% block="stop agent"
    //% blockId="microspade_stop_agent"
    //% group="Agente"
    //% weight=90
    export function stopAgent(): void {
        running = false;
    }

    /**
     * Obtiene el nombre del agente actual.
     */
    //% block="agent name"
    //% blockId="microspade_agent_name"
    //% group="Agente"
    //% weight=85
    export function getAgentName(): string {
        return agentName;
    }

    // --- COMPORTAMIENTOS BASADOS EN FIBRAS ---

    /**
     * Ejecuta una acción una sola vez en segundo plano cuando el agente se inicia.
     */
    //% block="add one shot behaviour"
    //% blockId="microspade_add_oneshot"
    //% group="Comportamientos"
    //% weight=70
    export function addOneShotBehaviour(handler: () => void): void {
        control.runInBackground(() => {
            // Espera a que el agente se inicie explícitamente
            while (!running) {
                basic.pause(50);
            }
            handler();
        });
    }

    /**
     * Ejecuta una acción continuamente en bucle en segundo plano mientras el agente esté corriendo.
     */
    //% block="add cyclic behaviour"
    //% blockId="microspade_add_cyclic"
    //% group="Comportamientos"
    //% weight=80
    export function addCyclicBehaviour(handler: () => void): void {
        control.runInBackground(() => {
            // Espera a que el agente se inicie explícitamente
            while (!running) {
                basic.pause(50);
            }
            while (running) {
                handler();
                basic.pause(10); // Pausa de cortesía para ceder la CPU
            }
        });
    }

    /**
     * Ejecuta una acción periódicamente en segundo plano cada intervalo de tiempo.
     */
    //% block="add periodic behaviour every $periodMs ms"
    //% blockId="microspade_add_periodic"
    //% periodMs.defl=1000
    //% group="Comportamientos"
    //% weight=75
    export function addPeriodicBehaviour(periodMs: number, handler: () => void): void {
        control.runInBackground(() => {
            // Espera a que el agente se inicie explícitamente
            while (!running) {
                basic.pause(50);
            }
            while (running) {
                handler();
                basic.pause(periodMs);
            }
        });
    }

    /**
     * Ejecuta una acción una sola vez en segundo plano tras una espera de tiempo una vez iniciado el agente.
     */
    //% block="add timeout behaviour after $timeoutMs ms"
    //% blockId="microspade_add_timeout"
    //% timeoutMs.defl=2000
    //% group="Comportamientos"
    //% weight=65
    export function addTimeoutBehaviour(timeoutMs: number, handler: () => void): void {
        control.runInBackground(() => {
            // Espera a que el agente se inicie explícitamente
            while (!running) {
                basic.pause(50);
            }
            basic.pause(timeoutMs);
            if (running) {
                handler();
            }
        });
    }

    export enum MessageField {
        //% block="destination"
        To,
        //% block="sender"
        Sender,
        //% block="performative"
        Performative,
        //% block="body"
        Body
    }

    export enum MessagePerformative {
        //% block="inform"
        Inform,
        //% block="request"
        Request,
        //% block="query"
        Query,
        //% block="confirm"
        Confirm,
        //% block="disconfirm"
        Disconfirm,
        //% block="agree"
        Agree,
        //% block="refuse"
        Refuse,
        //% block="failure"
        Failure
    }

    const _performativeNames = ["inform", "request", "query", "confirm", "disconfirm", "agree", "refuse", "failure"];

    /**
     * Clase que representa un Mensaje entre agentes.
     */
    //% blockNamespace="microspade" class="Message"
    export class Message {
        public to: string;
        public sender: string;
        public performative: MessagePerformative;
        public body: string;

        constructor(to: string, sender: string, performative: MessagePerformative, body: string) {
            this.to = to;
            this.sender = sender;
            this.performative = performative;
            this.body = body;
        }

        public getField(field: MessageField): string {
            switch (field) {
                case MessageField.To: return this.to;
                case MessageField.Sender: return this.sender;
                case MessageField.Performative: return _performativeNames[this.performative] || "inform";
                case MessageField.Body: return this.body;
            }
            return "";
        }

        public getTo(): string {
            return this.to;
        }

        public getSender(): string {
            return this.sender;
        }

        public getPerformative(): MessagePerformative {
            return this.performative;
        }

        public getBody(): string {
            return this.body;
        }

        /**
         * Codifica el mensaje en una cadena de texto para su envío por radio.
         */
        public encode(): string {
            let bodyEncoded = this.body ? this.body.split("|").join("\\|") : "";
            // Enviar el índice de la performativa (0-7) para ahorrar espacio por radio (máximo 19 caracteres en v1/simulador)
            let perfStr = "" + this.performative;
            return (this.to || "") + "|" + (this.sender || "") + "|" + perfStr + "|" + bodyEncoded;
        }

        /**
         * Decodifica una cadena de texto recibida por radio en un objeto Message.
         */
        public static decode(raw: string): Message {
            if (!raw) return null;
            let idx1 = raw.indexOf("|");
            if (idx1 < 0) return null;
            let idx2 = raw.indexOf("|", idx1 + 1);
            if (idx2 < 0) return null;
            let idx3 = raw.indexOf("|", idx2 + 1);
            if (idx3 < 0) return null;

            let to = raw.substr(0, idx1);
            let sender = raw.substr(idx1 + 1, idx2 - idx1 - 1);
            let performativeStr = raw.substr(idx2 + 1, idx3 - idx2 - 1);
            let bodyEncoded = raw.substr(idx3 + 1);
            let body = bodyEncoded.split("\\|").join("|");

            // Convertimos el carácter del índice de la performativa de vuelta a su valor numérico
            let perfCode = performativeStr.charCodeAt(0) - 48; // '0' es 48 en ASCII
            let performative = (perfCode >= 0 && perfCode <= 7) ? perfCode : MessagePerformative.Inform;

            return new Message(to, sender, performative, body);
        }

        /**
         * Crea un mensaje de respuesta invirtiendo destinatario y emisor.
         */
        //% block="make reply from %this with body $replyBody"
        //% blockId="microspade_message_make_reply"
        //% group="Mensajes"
        //% weight=35
        public makeReply(replyBody: string): Message {
            return new Message(this.sender, this.to, this.performative, replyBody);
        }
    }

    /**
     * Crea un nuevo mensaje rellenando el emisor automáticamente con el nombre del agente.
     */
    //% block="create message to $to body $body||performative $performative"
    //% blockId="microspade_create_message"
    //% blockSetVariable="message"
    //% to.defl="agent"
    //% performative.defl=MessagePerformative.Inform
    //% group="Mensajes"
    //% weight=60
    export function createMessage(to: string, body: string, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return new Message(to, agentName, performative, body);
    }

    /**
     * Obtiene el valor de un campo específico de un mensaje.
     */
    //% block="message $field of $message"
    //% blockId="microspade_message_get_field"
    //% group="Mensajes"
    //% weight=45
    export function getMessageField(message: Message, field: MessageField): string {
        if (!message) return "";
        return message.getField(field);
    }

    // Buzón de entrada de mensajes del Agente (Cola FIFO)
    let _mailbox: Message[] = [];
    const MAX_MAILBOX_SIZE = 10;

    /**
     * Añade manualmente un mensaje al buzón de entrada (útil para pruebas locales).
     */
    export function queueMessage(msg: Message): void {
        if (!msg) return;
        if (_mailbox.length >= MAX_MAILBOX_SIZE) {
            _mailbox.shift(); // Elimina el mensaje más antiguo para liberar RAM
        }
        _mailbox.push(msg);
    }

    /**
     * Envía un mensaje por radio.
     */
    //% block="send message $msg"
    //% blockId="microspade_send_message"
    //% group="Mensajes"
    //% weight=55
    export function sendMessage(msg: Message): void {
        if (!msg) return;
        radio.sendString(msg.encode());
    }

    /**
     * Plantilla para filtrar mensajes del buzón.
     */
    //% blockNamespace="microspade" class="MessageTemplate"
    export class MessageTemplate {
        public to: string;
        public sender: string;
        public performative: MessagePerformative;

        constructor(to: string, sender: string, performative: MessagePerformative) {
            this.to = to || "";
            this.sender = sender || "";
            this.performative = performative;
        }

        public match(msg: Message): boolean {
            if (!msg) return false;

            // Comprobación de destinatario (si está definido)
            if (this.to && msg.getTo() !== this.to) return false;

            // Comprobación de emisor (si está definido)
            if (this.sender && msg.getSender() !== this.sender) return false;

            // Comprobación de performativa: -1 (o undefined en JS) significa "any" / no filtrar
            if (this.performative !== undefined && this.performative !== -1 && msg.getPerformative() !== this.performative) {
                return false;
            }
            return true;
        }
    }

    /**
     * Crea una plantilla para filtrar mensajes en el buzón.
     */
    //% block="template matching||destination $to sender $sender performative $performative"
    //% blockId="microspade_create_template"
    //% blockSetVariable="template"
    //% to.defl=""
    //% sender.defl=""
    //% group="Mensajes"
    //% weight=40
    export function createMessageTemplate(to: string = "", sender: string = "", performative?: MessagePerformative): MessageTemplate {
        let perf = (performative === undefined) ? -1 : performative;
        return new MessageTemplate(to, sender, perf);
    }

    /**
     * Extrae y devuelve el primer mensaje del buzón que coincida con la plantilla (si se especifica).
     * Devuelve null si no hay ningún mensaje coincidente.
     */
    //% block="receive message||matching template $template"
    //% blockId="microspade_receive_message"
    //% group="Mensajes"
    //% weight=50
    export function receive(template?: MessageTemplate): Message {
        if (_mailbox.length === 0) return null;

        if (!template) {
            return _mailbox.shift(); // FIFO estándar
        }

        // Buscar el primer mensaje que coincida con el filtro
        for (let i = 0; i < _mailbox.length; i++) {
            if (template.match(_mailbox[i])) {
                let msg = _mailbox[i];
                _mailbox.splice(i, 1); // Lo extraemos del buzón
                return msg;
            }
        }
        return null;
    }
}
