// Ejemplo: Agente Saludador (Hello World)

let myname = ""

microspade.createAgent("saludador", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + myname)
})

microspade.startAgent()
