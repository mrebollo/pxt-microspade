// Casos de prueba para la extensión microspade
// Estos test se ejecutan localmente o en el simulador de MakeCode.

function assert(condition: boolean, message: string) {
    if (!condition) {
        control.panic(101);
        serial.writeLine("TEST FAILED: " + message);
    } else {
        serial.writeLine("TEST PASSED: " + message);
    }
}

serial.writeLine("Starting microspade Agent & KB tests...");

// Test 1: Creación de Agente
let agent = microspade.createAgent("test_agent");
assert(agent.name === "test_agent", "Agent name should be 'test_agent'");
assert(agent.running === false, "Agent should not be running initially");

// Test 2: Control de ciclo de vida básico
agent.start();
assert(agent.running === true, "Agent should be running after start()");
agent.stop();
assert(agent.running === false, "Agent should not be running after stop()");

// Test 3: Almacenamiento en KB (Knowledge Base)
agent.set("temp", 22);
assert(agent.get("temp") === 22, "KB value 'temp' should be 22");

agent.set("status", "active");
assert(agent.get("status") === "active", "KB value 'status' should be 'active'");

agent.set("flag", true);
assert(agent.get("flag") === true, "KB value 'flag' should be true");

assert(agent.get("non_existent") === null, "KB value for non-existent key should be null");

serial.writeLine("All Agent & KB tests completed successfully!");
