/**
 * microspade — Agentes inteligentes ligeros para BBC micro:bit
 */
//% color="#4a90e2" icon="\uf0e8" block="Microspade"
namespace microspade {

    /**
     * Clase principal que representa un Agente.
     */
    //% blockNamespace="microspade" class="Agent"
    export class Agent {
        public name: string;
        public running: boolean;
        private _kb: {[key: string]: any};

        constructor(name: string) {
            this.name = name;
            this.running = false;
            this._kb = {};
        }

        /**
         * Arranca el agente y activa su bucle de ejecución.
         */
        //% block="start agent %this(agent)"
        //% blockId="microspade_agent_start"
        //% weight=90
        public start(): void {
            this.running = true;
        }

        /**
         * Detiene al agente y apaga sus comportamientos.
         */
        //% block="stop agent %this(agent)"
        //% blockId="microspade_agent_stop"
        //% weight=80
        public stop(): void {
            this.running = false;
        }

        /**
         * Almacena un valor en la base de conocimientos (KB) del agente.
         */
        //% block="agent %this(agent) set $key to $value"
        //% blockId="microspade_agent_set"
        //% weight=70
        public set(key: string, value: any): void {
            this._kb[key] = value;
        }

        /**
         * Obtiene un valor de la base de conocimientos (KB) del agente.
         */
        //% block="agent %this(agent) get $key"
        //% blockId="microspade_agent_get"
        //% weight=60
        public get(key: string): any {
            if (this._kb.hasOwnProperty(key)) {
                return this._kb[key];
            }
            return null;
        }
    }

    /**
     * Función constructora de conveniencia para crear un agente.
     */
    //% block="create agent $name"
    //% blockId="microspade_create_agent"
    //% blockSetVariable="agent"
    //% weight=100
    export function createAgent(name: string): Agent {
        return new Agent(name);
    }
}
