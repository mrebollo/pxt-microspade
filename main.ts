/**
 * microspade — Agentes inteligentes ligeros para BBC micro:bit
 */
//% color="#4a90e2" icon="\uf0e8" block="Microspade"
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
    //% handler.statement=true
    //% weight=100
    export function createAgent(name: string, setup: () => void): void {
        agentName = name;
        setupCallback = setup;
        running = false;
    }

    /**
     * Arranca el agente y activa sus comportamientos.
     */
    //% block="start agent"
    //% blockId="microspade_start_agent"
    //% weight=95
    export function startAgent(): void {
        if (setupCallback) {
            setupCallback();
        }
        running = true;
    }

    /**
     * Detiene al agente y apaga sus comportamientos.
     */
    //% block="stop agent"
    //% blockId="microspade_stop_agent"
    //% weight=90
    export function stopAgent(): void {
        running = false;
    }

    // --- COMPORTAMIENTOS BASADOS EN FIBRAS ---

    /**
     * Ejecuta una acción una sola vez en segundo plano cuando el agente se inicia.
     */
    //% block="add one shot behaviour"
    //% blockId="microspade_add_oneshot"
    //% weight=80
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
    //% weight=75
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
    //% weight=70
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
            let perfStr = _performativeNames[this.performative] || "inform";
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

            let idx = _performativeNames.indexOf(performativeStr);
            let performative = idx >= 0 ? idx : MessagePerformative.Inform;

            return new Message(to, sender, performative, body);
        }

        /**
         * Crea un mensaje de respuesta invirtiendo destinatario y emisor.
         */
        //% block="make reply from %this with body $replyBody"
        //% blockId="microspade_message_make_reply"
        //% weight=60
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
    //% weight=85
    export function createMessage(to: string, body: string, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return new Message(to, agentName, performative, body);
    }

    /**
     * Obtiene el valor de un campo específico de un mensaje.
     */
    //% block="message $field of $message"
    //% blockId="microspade_message_get_field"
    //% weight=70
    export function getMessageField(message: Message, field: MessageField): string {
        return message.getField(field);
    }
}
