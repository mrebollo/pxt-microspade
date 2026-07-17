let received: microspade.Message = null
microspade.onAgentStart("cli", function () {
	
})
microspade.addCyclicBehaviour(function () {
    received = microspade.receive()
    if (microspade.messageExists(received)) {
        basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
    }
})
