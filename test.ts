// Casos de prueba para la extensión microspade (Clase Message y Serialización)
// Estos test se ejecutan localmente o en el simulador de MakeCode.

function assert(condition: boolean, message: string) {
    if (!condition) {
        control.panic(101);
        serial.writeLine("TEST FAILED: " + message);
    } else {
        serial.writeLine("TEST PASSED: " + message);
    }
}

serial.writeLine("Starting microspade Message & Serialization tests...");

// Configurar nombre del agente para el test
microspade.initAgent("sender_agent");

// Test 1: Creación de Mensajes
let msg = microspade.createMessage("receiver_agent", "hello world", microspade.MessagePerformative.Request);
assert(microspade.getMessageField(msg, microspade.MessageField.To) === "receiver_agent", "Destination should be 'receiver_agent'");
assert(microspade.getMessageField(msg, microspade.MessageField.Sender) === "sender_agent", "Sender should be auto-filled to 'sender_agent'");
assert(microspade.getMessageField(msg, microspade.MessageField.Performative) === "request", "Performative should be 'request'");
assert(microspade.getMessageField(msg, microspade.MessageField.Body) === "hello world", "Body should be 'hello world'");

// Test 2: Codificación básica
let raw = msg.encode();
assert(raw === "receiver_agent|sender_agent|request|hello world", "Encoded string mismatch: " + raw);

// Test 3: Decodificación básica
let decoded = microspade.Message.decode(raw);
assert(decoded !== null, "Decoded message should not be null");
assert(microspade.getMessageField(decoded, microspade.MessageField.To) === "receiver_agent", "Decoded destination should match");
assert(microspade.getMessageField(decoded, microspade.MessageField.Sender) === "sender_agent", "Decoded sender should match");
assert(microspade.getMessageField(decoded, microspade.MessageField.Performative) === "request", "Decoded performative should match");
assert(microspade.getMessageField(decoded, microspade.MessageField.Body) === "hello world", "Decoded body should match");

// Test 4: Codificación con caracteres especiales (escape de |)
let msgSpecial = microspade.createMessage("receiver_agent", "one|two|three", microspade.MessagePerformative.Inform);
let rawSpecial = msgSpecial.encode();
assert(rawSpecial === "receiver_agent|sender_agent|inform|one\\|two\\|three", "Special character encoding failed: " + rawSpecial);

// Test 5: Decodificación con caracteres especiales
let decodedSpecial = microspade.Message.decode(rawSpecial);
assert(microspade.getMessageField(decodedSpecial, microspade.MessageField.Body) === "one|two|three", "Special character decoding failed: " + microspade.getMessageField(decodedSpecial, microspade.MessageField.Body));

// Test 6: Crear respuesta (makeReply)
let reply = msg.makeReply("got your message");
assert(reply.getTo() === "sender_agent", "Reply destination should be 'sender_agent'");
assert(reply.getSender() === "receiver_agent", "Reply sender should be 'receiver_agent'");
assert(reply.getBody() === "got your message", "Reply body should be 'got your message'");

serial.writeLine("All Message & Serialization tests completed successfully!");
