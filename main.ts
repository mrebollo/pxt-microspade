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
}
