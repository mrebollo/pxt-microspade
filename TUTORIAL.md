# First Agent: Hello World!

## Introduction @unplugged
Welcome to the **micro:spade** tutorial!
In this guide, you will learn how to create your first autonomous intelligent agent on your micro:bit, which will show a personalized greeting on the screen in the background when it starts.

## Step 1: Configure the agent's identity
Drag the floating block `on agent start` from the **Microspade** category onto the workspace.
Type the name of your agent (for example, `"greeter"`).

```blocks
microspade.onAgentStart("greeter", function () {
	
})
```

## Step 2: Create a startup variable
Inside your `on agent start` block, create a variable named `name` and set it to `"pepe"` (or any name you prefer).
This will represent the initial state of the agent on startup.

```blocks
let name = ""
microspade.onAgentStart("greeter", function () {
    name = "pepe"
})
```

## Step 3: Add a One Shot behaviour
Drag the block `add one shot behaviour` onto the workspace.
This block will run its contents in the background immediately after the agent starts.

```blocks
let name = ""
microspade.onAgentStart("greeter", function () {
    name = "pepe"
})
microspade.addOneShotBehaviour(function () {
	
})
```

## Step 4: Display the personalized greeting
Inside `add one shot behaviour`, place a `show string` block from the **Basic** category.
Make it show the text `"Hello "` joined with the value of the `name` variable.

```blocks
let name = ""
microspade.onAgentStart("greeter", function () {
    name = "pepe"
})
microspade.addOneShotBehaviour(function () {
    basic.showString("Hello " + name)
})
```

## Completed! @unplugged
Excellent work! You have built your first autonomous agent with its own lifecycle and variable initialization.
You can now see the greeting run in the simulator or download the code to your physical micro:bit board.
