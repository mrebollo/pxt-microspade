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
microspade.agentName = "sender_agent";

// Test 1: Creación de Mensajes
let msg = microspade.createMessage("receiver_agent", "hello world", microspade.MessagePerformative.Request);
assert(microspade.getMessageField(msg, microspade.MessageField.To) === "receiver_agent", "Destination should be 'receiver_agent'");
assert(microspade.getMessageField(msg, microspade.MessageField.Sender) === "sender_agent", "Sender should be auto-filled to 'sender_agent'");
assert(microspade.getMessageField(msg, microspade.MessageField.Performative) === "request", "Performative should be 'request'");
assert(microspade.getMessageField(msg, microspade.MessageField.Body) === "hello world", "Body should be 'hello world'");

// Test 2: Codificación básica en Buffer
let rawBuf = msg.encodeBuffer();
assert(rawBuf !== null && rawBuf.length > 4, "Encoded buffer should be valid");

// Test 3: Decodificación básica desde Buffer
let decoded = microspade.Message.decodeBuffer(rawBuf);
assert(decoded !== null, "Decoded message should not be null");
assert(microspade.getMessageField(decoded, microspade.MessageField.Performative) === "request", "Decoded performative should match");
assert(microspade.getMessageField(decoded, microspade.MessageField.Body) === "hello world", "Decoded body should match");

// Test 4: Codificación y decodificación con caracteres especiales (|)
let msgSpecial = microspade.createMessage("receiver_agent", "one|two|three", microspade.MessagePerformative.Inform);
let rawBufSpecial = msgSpecial.encodeBuffer();
let decodedSpecial = microspade.Message.decodeBuffer(rawBufSpecial);
assert(microspade.getMessageField(decodedSpecial, microspade.MessageField.Body) === "one|two|three", "Special character handling in buffer failed");

// Test 6: Crear respuesta (makeReply y makeReplyNumber)
let reply = microspade.makeReply(msg, "got your message");
assert(reply.getTo() === "sender_agent", "Reply destination should be 'sender_agent'");
assert(reply.getSender() === "sender_agent", "Reply sender should be 'sender_agent'");
assert(reply.getBody() === "got your message", "Reply body should be 'got your message'");

let replyNum = microspade.makeReplyNumber(msg, 42.5);
assert(replyNum.getTo() === "sender_agent", "ReplyNum destination should be 'sender_agent'");
assert(replyNum.getSender() === "sender_agent", "ReplyNum sender should be 'sender_agent'");
assert(microspade.getMessageBodyNumber(replyNum) === 42.5, "ReplyNum body should unpack float32 42.5");

// Test 6b: Verificar performativa por defecto y personalizada en respuestas
assert(reply.getPerformative() === microspade.MessagePerformative.Inform, "Default reply performative should be 'Inform'");
assert(replyNum.getPerformative() === microspade.MessagePerformative.Inform, "Default replyNum performative should be 'Inform'");

let replyCustom = microspade.makeReply(msg, "agreed", microspade.MessagePerformative.Agree);
assert(replyCustom.getPerformative() === microspade.MessagePerformative.Agree, "Custom reply performative should be 'Agree'");

let replyCustomNum = microspade.makeReplyNumber(msg, 100, microspade.MessagePerformative.Confirm);
assert(replyCustomNum.getPerformative() === microspade.MessagePerformative.Confirm, "Custom reply number performative should be 'Confirm'");
assert(microspade.getMessagePerformative(replyCustomNum) === microspade.performative(microspade.MessagePerformative.Confirm), "getMessagePerformative should match performative selector helper");

serial.writeLine("All Message & Serialization tests completed successfully!");

// Test 7: Pruebas del Buzón de Entrada y Plantillas de Filtrado
serial.writeLine("Starting Mailbox & Template tests...");

// Vaciar el buzón si tuviera algo
while (microspade.receive() !== null) { }

// Crear mensajes de prueba
let msgInform = microspade.createMessage("pinger", "value: 22", microspade.MessagePerformative.Inform);
let msgRequest = microspade.createMessage("pinger", "action: turn_on", microspade.MessagePerformative.Request);

// Encolar en el buzón
microspade.queueMessage(msgInform);
microspade.queueMessage(msgRequest);

// Test 7.1: Recepción con filtro de tipo (Request)
let receivedReq = microspade.receive(microspade.PerformativeFilter.Request);

assert(receivedReq !== null, "Should have received a message matching Request filter");
assert(microspade.getMessageField(receivedReq, microspade.MessageField.Body) === "action: turn_on", "Should match the Request body");

// Test 7.2: Recepción del restante (Inform) sin filtro
let receivedInf = microspade.receive();
assert(receivedInf !== null, "Should have received the remaining Inform message");
assert(microspade.getMessageField(receivedInf, microspade.MessageField.Body) === "value: 22", "Should match the Inform body");

// Test 7.2b: Recepción con filtro de contenido en el cuerpo (body)
let msgCFP = microspade.createMessage("pinger", "action: cfp", microspade.MessagePerformative.Inform);
microspade.queueMessage(msgCFP);
let receivedCFP = microspade.receive(null, "cfp");
assert(receivedCFP !== null, "Should have received a message matching body 'cfp'");
assert(microspade.getMessageField(receivedCFP, microspade.MessageField.Body) === "action: cfp", "Should match the CFP body");

// Test 7.3: Recepción de buzón vacío
assert(microspade.receive() === null, "Mailbox should be empty now");

serial.writeLine("Mailbox & Template tests completed successfully!");

// Test 8: Ciclo de vida y onAgentStart
serial.writeLine("Starting Agent Lifecycle tests...");
let setupExecuted = false;
microspade.onAgentStart("lifecycle_agent", function () {
    setupExecuted = true;
});
assert(microspade.agentName === "lifecycle_agent", "Agent name should be 'lifecycle_agent'");
assert(setupExecuted, "Setup callback should run immediately");
assert(microspade.running, "Agent should be running by default");

// Test 9: Parada del agente y onAgentStop
let stopExecuted = false;
microspade.onAgentStop(function () {
    stopExecuted = true;
});
microspade.stopAgent();
assert(!microspade.running, "Agent should not be running after stopAgent");
assert(stopExecuted, "Stop callback should run when agent stops");

// Test 10: Filtrado de mensajes propios en el receptor de radio
serial.writeLine("Starting Radio self-message filtering test...");
let selfMsg = microspade.createMessage("lifecycle_agent", "test self filter");
let selfBuf = selfMsg.encodeBuffer();
let selfMsgDecoded = microspade.Message.decodeBuffer(selfBuf);
assert(selfMsgDecoded !== null, "Self message decoded should not be null");

serial.writeLine("Agent Lifecycle tests completed successfully!");
