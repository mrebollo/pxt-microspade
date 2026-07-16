// Casos de prueba para la extensión microspade (Contenedor y Arranque Explícito)
// Estos test se ejecutan localmente o en el simulador de MakeCode.

function assert(condition: boolean, message: string) {
    if (!condition) {
        control.panic(101);
        serial.writeLine("TEST FAILED: " + message);
    } else {
        serial.writeLine("TEST PASSED: " + message);
    }
}

serial.writeLine("Starting microspade Container & Explicit Start tests...");

let counter = 0;
let oneShotExecuted = false;

// Test 1: Creación del Agente (contenedor de configuración)
microspade.createAgent("test_agent", function () {
    assert(microspade.agentName === "test_agent", "Agent name should be set during creation");
    assert(microspade.running === false, "Agent should not be running yet");

    // Registrar comportamientos dentro del contenedor
    microspade.addOneShotBehaviour(function () {
        oneShotExecuted = true;
        serial.writeLine("OneShotBehaviour executed.");
    });

    microspade.addPeriodicBehaviour(500, function () {
        counter++;
        serial.writeLine("Periodic tick. Counter: " + counter);
    });

    microspade.addTimeoutBehaviour(2200, function () {
        serial.writeLine("Timeout triggered. Stopping agent...");
        microspade.stopAgent();
    });
});

// Verificar que, antes de arrancar, ningún comportamiento ha empezado
basic.pause(600);
assert(oneShotExecuted === false, "OneShot should NOT have run before startAgent()");
assert(counter === 0, "Counter should still be 0 before startAgent()");

// Test 2: Arranque explícito del agente
serial.writeLine("Starting agent explicitly now...");
microspade.startAgent();
assert(microspade.running === true, "Agent should be running now");

// Esperar 3 segundos para dejar que corran y terminen en segundo plano
basic.pause(3000);

// Verificar resultados finales
assert(oneShotExecuted === true, "OneShot behavior should have run after start");
assert(microspade.running === false, "Agent should have been stopped by timeout");
assert(counter >= 4 && counter <= 5, "Counter should be between 4 and 5 (got: " + counter + ")");

serial.writeLine("All Container & Explicit Start tests completed successfully!");
