# Mailbox

This example is split into two agents running on different micro:bit boards. The **server** measures the temperature and sends it as a message. The **client** reads messages from its mailbox and shows them on the display.

## Server agent

Use the server page when you want a micro:bit to publish the temperature periodically.

- [mailbox_server](../../docs/examples/mailbox_server)

## Client agent

Use the client page when you want a micro:bit to receive and display the messages sent by the server.

- [mailbox_client](../../docs/examples/mailbox_client)

If you prefer event-driven reception, see [incoming](../../docs/examples/incoming).

---
Source in repository: [examples/mailbox_server.ts](../../examples/mailbox_server.ts) and [examples/mailbox_client.ts](../../examples/mailbox_client.ts)
```package
microspade=github:mrebollo/pxt-microspade
```

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>
  makeCodeRender("https://makecode.microbit.org/", "mrebollo/pxt-microspade");
</script>