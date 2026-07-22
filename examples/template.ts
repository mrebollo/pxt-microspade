let selected: microspade.Message = null
microspade.onAgentStart("listener", function () {

})
input.onButtonPressed(Button.A, function () {
	microspade.sendMessage(microspade.createMessage("listener", "temp:22", microspade.MessagePerformative.Inform))
})
input.onButtonPressed(Button.B, function () {
	microspade.sendMessage(microspade.createMessage("listener", "turn_on", microspade.MessagePerformative.Request))
})
microspade.addCyclicBehaviour("templateReader", function () {
	selected = microspade.receive(microspade.PerformativeFilter.Inform, "temp")
	if (microspade.messageExists(selected)) {
		basic.showString(microspade.getMessageField(selected, microspade.MessageField.Body))
	}
})
