let on = false
microspade.addPeriodicBehaviour("blinkTask", 1000, function () {
    if (on) {
        basic.showIcon(IconNames.Diamond)
    } else {
        basic.showIcon(IconNames.SmallDiamond)
    }
    on = !(on)
})
