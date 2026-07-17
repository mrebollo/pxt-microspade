microspade.addCyclicBehaviour(function () {
    received = microspade.receive()
    if (received != null) {
        serial.writeString(microspade.getMessageField(received, microspade.MessageField.Body))
        basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
    }
})
let received: microspade.Message = null
microspade.onAgentStart("cli", function () {
	
})

