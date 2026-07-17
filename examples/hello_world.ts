// Ejemplo: Agente Saludador (Hello World)

let myname = ""

microspade.onAgentStart("saludador", function () {
    myname = "pepe"
})

microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + myname)
})


