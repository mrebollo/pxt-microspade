let on = false
microspade.addPeriodicBehaviour(1000, function () {
    if (on) {
        basic.showIcon(IconNames.Diamond)
    } else {
        basic.showIcon(IconNames.SmallDiamond)
    }
    on = !(on)
})
