microspade.addOneShotBehaviour(function () {
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.To))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Performative))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Body))
})
microspade.createAgent("ping", function () {
    msg = microspade.createMessage("pong", "hello", "inform")
})
let msg: microspade.Message = null
microspade.startAgent()
