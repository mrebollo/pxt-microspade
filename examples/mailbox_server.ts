microspade.addPeriodicBehaviour(2000, function () {
    temp = input.temperature()
    basic.showNumber(temp)
    serial.writeNumber(temp)
    message = microspade.createMessage("cli", convertToText(temp))
    microspade.sendMessage(message)
})
let message: microspade.Message = null
let temp = 0
microspade.createAgent("ter", function () {
	
})
microspade.startAgent()
