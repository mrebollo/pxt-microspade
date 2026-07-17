microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + myname)
})
let myname = ""
microspade.createAgent(""saludador"", function () {
    myname = "pepe"
})
microspade.startAgent()
