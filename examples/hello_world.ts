let text = ""
microspade.onAgentStart("agent", function () {
    text = "pepe"
})
microspade.addOneShotBehaviour("helloTask", function () {
    basic.showString("Hello " + text)
})
