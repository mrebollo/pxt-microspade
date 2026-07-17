microspade.addPeriodicBehaviour(1000, function () {
    if (on) {
        basic.showIcon(IconNames.Diamond)
    } else {
        basic.showIcon(IconNames.SmallDiamond)
    }
    on = !(on)
})
microspade.onAgentStart("launcher", function () {
    on = true
})
let on = false

