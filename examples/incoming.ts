let received: microspade.Message = null
microspade.onAgentStart("listener", function () {

})
input.onButtonPressed(Button.A, function () {
	microspade.sendMessage(microspade.createMessage("listener", "hello", microspade.MessagePerformative.Inform))
})
microspade.onMessageReceived(function (message) {
	received = message
	basic.showString(microspade.getMessageField(received, microspade.MessageField.Body))
})
