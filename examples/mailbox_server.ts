let temp = 0
microspade.onAgentStart("ter", function () {
	
})
microspade.addPeriodicBehaviour("temperaturePublisher", 2000, function () {
    temp = input.temperature()
    basic.showNumber(temp)
    microspade.sendMessage(microspade.createMessageNumber("cli", temp))
})
