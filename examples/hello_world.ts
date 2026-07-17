let text = ""
microspade.onAgentStart("agent", function () {
    text = "pepe"
})
microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + text)
})
