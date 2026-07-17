microspade.addOneShotBehaviour(function () {
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.To))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Performative))
    basic.showString(microspade.getMessageField(msg, microspade.MessageField.Body))
})
microspade.onAgentStart("ping", function () {
    msg = microspade.createMessage("pong", "hello", microspade.MessagePerformative.Inform)
})
let msg: microspade.Message = null

