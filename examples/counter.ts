microspade.addCyclicBehaviour(function () {
    countdown += -1
    basic.showNumber(countdown)
    if (countdown == 0) {
        basic.showArrow(ArrowNames.North)
        microspade.stopAgent()
    }
})
let countdown = 0
microspade.onAgentStart("launcher", function () {
    countdown = 9
    basic.showNumber(countdown)
})

