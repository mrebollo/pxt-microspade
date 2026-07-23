# Examples

This page collects all micro:spade examples in one place. Each entry includes a short description and a link to the corresponding docs page.

## Basic behaviours

- [hello_world](./examples/hello_world): Initializes an agent and runs a one-shot greeting.
- [counter](./examples/counter): Uses a cyclic behaviour to run a countdown and stop the agent at zero.
- [periodic](./examples/periodic): Uses a periodic behaviour to alternate icons every second.
- [timeout](./examples/timeout): Uses a timeout behaviour to run a delayed action.
- [multiple_behaviours](./examples/multiple_behaviours): Combines one-shot, cyclic, and periodic behaviours in a coordinated alarm.
- [priority](./examples/priority): Demonstrates behaviour priority inhibition (Subsumption Architecture) where an obstacle avoidance task overrides patrol movement.

## Message handling

- [ping_pong](./examples/ping_pong): Creates and inspects a basic message.
- [incoming](./examples/incoming): Reacts to messages with the on-message-received event.
- [template](./examples/template): Receives messages using filters (templates) by performative and body content.

## Mailbox usage

- [mailbox](./examples/mailbox): Overview of mailbox-based communication.
- [mailbox_server](./examples/mailbox_server): Sender agent that publishes temperature periodically.
- [mailbox_client](./examples/mailbox_client): Receiver agent that consumes messages from the mailbox.
