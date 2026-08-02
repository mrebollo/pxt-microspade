/**
 * microspade — Lightweight intelligent agents for BBC micro:bit
 */
//% color="#4a90e2" icon="\u2660" block="Micro:spade" groups='["Agent", "Behaviours", "Messages"]'
namespace microspade {
    // Agent state variables (Singleton)
    export let agentName = "agent";
    export let running = true; // The agent starts active by default

    let stopCallback: () => void = null;
    let messageReceivedHandler: (message: Message) => void = null;
    let _radioInitialized = false;

    const BROADCAST_ID = 255;

    function nameToId(name: string): number {
        if (!name || name === "*") return BROADCAST_ID;
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) & 0xFF;
        }
        return hash === BROADCAST_ID ? 254 : hash;
    }

    // Lazy initialization of the radio module
    function initRadio(): void {
        if (_radioInitialized) return;
        _radioInitialized = true;
        radio.onReceivedBuffer(function (buf) {
            if (!running || !buf) return;
            let msg = Message.decodeBuffer(buf);
            if (msg) {
                let myId = nameToId(agentName);
                if (nameToId(msg.getSender()) === myId) return; // Ignore self-sent messages
                let toId = nameToId(msg.getTo());
                if (toId === myId || toId === BROADCAST_ID) {
                    if (messageReceivedHandler) {
                        control.runInBackground(() => {
                            messageReceivedHandler(msg);
                        });
                    } else {
                        queueMessage(msg);
                    }
                }
            }
        });
    }

    /**
     * Configures the agent's identity and runs initialization code on startup.
     */
    //% block="on agent start $name"
    //% blockId="microspade_on_agent_start"
    //% name.defl="agent"
    //% group="Agent"
    //% weight=100
    export function onAgentStart(name: string, handler: () => void): void {
        agentName = name;
        handler(); // Run variable initialization synchronously
    }

    /**
     * Stops the agent and shuts down its behaviours.
     */
    //% block="stop agent"
    //% blockId="microspade_stop_agent"
    //% group="Agent"
    //% weight=90
    export function stopAgent(): void {
        running = false;
        if (stopCallback) {
            stopCallback();
        }
    }

    /**
     * Registers code to execute when the agent stops.
     */
    //% block="on agent stop"
    //% blockId="microspade_on_agent_stop"
    //% group="Agent"
    //% weight=88
    export function onAgentStop(handler: () => void): void {
        stopCallback = handler;
    }

    /**
     * Gets the name of the current agent.
     */
    //% block="agent name"
    //% blockId="microspade_agent_name"
    //% group="Agent"
    //% weight=85
    export function getAgentName(): string {
        return agentName;
    }

    // --- FIBRE-BASED BEHAVIOURS ---

    /**
     * Executes an action once in the background after the agent starts.
     */
    //% block="one shot $name"
    //% blockId="microspade_add_oneshot"
    //% name.defl="task"
    //% group="Behaviours"
    //% weight=70
    export function addOneShotBehaviour(name: string, handler: () => void): void {
        if (!handler) return;

        control.runInBackground(() => {
            if (running) {
                handler();
            }
        });
    }

    /**
     * Executes an action continuously in a loop in the background while the agent is running.
     */
    //% block="cyclic $name"
    //% blockId="microspade_add_cyclic"
    //% name.defl="task"
    //% group="Behaviours"
    //% weight=80
    export function addCyclicBehaviour(name: string, handler: () => void): void {
        if (!handler) return;

        control.runInBackground(() => {
            while (running) {
                handler();
                basic.pause(20); // Yield CPU to other fibres
            }
        });
    }

    /**
     * Executes an action periodically in the background at fixed time intervals.
     */
    //% block="periodic $name every $periodMs ms"
    //% blockId="microspade_add_periodic"
    //% name.defl="task"
    //% periodMs.defl=1000
    //% group="Behaviours"
    //% weight=75
    export function addPeriodicBehaviour(name: string, periodMs: number = 1000, handler: () => void): void {
        if (!handler) return;

        control.runInBackground(() => {
            while (running) {
                handler();
                basic.pause(periodMs);
            }
        });
    }

    /**
     * Executes an action once in the background after a specified delay once the agent starts.
     */
    //% block="timeout $name after $timeoutMs ms"
    //% blockId="microspade_add_timeout"
    //% name.defl="task"
    //% timeoutMs.defl=2000
    //% group="Behaviours"
    //% weight=65
    export function addTimeoutBehaviour(name: string, timeoutMs: number = 2000, handler: () => void): void {
        if (!handler) return;

        control.runInBackground(() => {
            basic.pause(timeoutMs);
            if (running) {
                handler();
            }
        });
    }

    export enum MessageField {
        //% block="destination"
        To,
        //% block="sender"
        Sender,
        //% block="performative"
        Performative,
        //% block="body"
        Body
    }

    //% enumIdentity="microspade.MessagePerformative"
    export enum MessagePerformative {
        //% block="inform"
        Inform = 0,
        //% block="request"
        Request = 1,
        //% block="query"
        Query = 2,
        //% block="confirm"
        Confirm = 3,
        //% block="disconfirm"
        Disconfirm = 4,
        //% block="agree"
        Agree = 5,
        //% block="refuse"
        Refuse = 6,
        //% block="failure"
        Failure = 7
    }

    export enum PerformativeFilter {
        //% block="any"
        Any = -1,
        //% block="inform"
        Inform = MessagePerformative.Inform,
        //% block="request"
        Request = MessagePerformative.Request,
        //% block="query"
        Query = MessagePerformative.Query,
        //% block="confirm"
        Confirm = MessagePerformative.Confirm,
        //% block="disconfirm"
        Disconfirm = MessagePerformative.Disconfirm,
        //% block="agree"
        Agree = MessagePerformative.Agree,
        //% block="refuse"
        Refuse = MessagePerformative.Refuse,
        //% block="failure"
        Failure = MessagePerformative.Failure
    }

    const _performativeNames = ["inform", "request", "query", "confirm", "disconfirm", "agree", "refuse", "failure"];

    /**
     * Class representing a Message between agents.
     */
    //% blockNamespace="microspade" class="Message"
    export class Message {
        public to: string;
        public sender: string;
        public performative: MessagePerformative;
        public body: string;

        public isNumber: boolean;

        constructor(to: string, sender: string, performative: MessagePerformative, body: string, isNumber: boolean = false) {
            this.to = to;
            this.sender = sender;
            this.performative = performative;
            this.body = body;
            this.isNumber = isNumber;
        }

        public getField(field: MessageField): string {
            switch (field) {
                case MessageField.To: return this.to;
                case MessageField.Sender: return this.sender;
                case MessageField.Performative: return _performativeNames[this.performative] || "inform";
                case MessageField.Body: return this.body;
            }
            return "";
        }

        public getTo(): string {
            return this.to;
        }

        public getSender(): string {
            return this.sender;
        }

        public getPerformative(): MessagePerformative {
            return this.performative;
        }

        public getBody(): string {
            return this.body;
        }

        /**
         * Encodes the message into a compact binary Buffer.
         * Header: [ToID (1B), SenderID (1B), Performative (1B), IsNumber (1B)]
         */
        public encodeBuffer(): Buffer {
            let bodyBuf = this.isNumber ? pins.createBuffer(4) : control.createBufferFromUTF8(this.body || "");
            if (this.isNumber) {
                bodyBuf.setNumber(NumberFormat.Float32LE, 0, parseFloat(this.body) || 0);
            }

            let buf = pins.createBuffer(4 + bodyBuf.length);
            buf.setNumber(NumberFormat.UInt8LE, 0, nameToId(this.to));
            buf.setNumber(NumberFormat.UInt8LE, 1, nameToId(this.sender));
            buf.setNumber(NumberFormat.UInt8LE, 2, (this.performative >= 0 && this.performative <= 7) ? this.performative : 0);
            buf.setNumber(NumberFormat.UInt8LE, 3, this.isNumber ? 1 : 0);
            buf.write(4, bodyBuf);
            return buf;
        }

        /**
         * Decodes a binary Buffer into a Message object.
         */
        public static decodeBuffer(buf: Buffer): Message {
            if (!buf || buf.length < 4) return null;

            let toId = buf.getNumber(NumberFormat.UInt8LE, 0);
            let senderId = buf.getNumber(NumberFormat.UInt8LE, 1);
            let perf = buf.getNumber(NumberFormat.UInt8LE, 2);
            let isNum = buf.getNumber(NumberFormat.UInt8LE, 3) === 1;

            let to = (toId === BROADCAST_ID) ? "*" : "agent_" + toId;
            let sender = "agent_" + senderId;

            let body = "";
            if (isNum && buf.length >= 8) {
                let val = buf.getNumber(NumberFormat.Float32LE, 4);
                body = "" + val;
            } else if (!isNum) {
                let bodyBuf = buf.slice(4);
                body = bodyBuf.toString();
            }

            return new Message(to, sender, perf, body, isNum);
        }

        // Legacy string methods for backward compatibility
        public encode(): string {
            return this.encodeBuffer().toString();
        }

        public static decode(raw: string): Message {
            return Message.decodeBuffer(control.createBufferFromUTF8(raw));
        }
    }

    /**
     * Creates a new message, auto-filling the sender with the current agent's name.
     */
    //% block="create message to $to body $body||performative $performative"
    //% blockId="microspade_create_message"
    //% to.defl="agent"
    //% performative.defl=MessagePerformative.Inform
    //% group="Messages"
    //% weight=60
    export function createMessage(to: string, body: string, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return new Message(to, agentName, performative, body, false);
    }

    /**
     * Creates a structured message with a numeric body.
     */
    //% block="create message to $to body number $body || performative $performative"
    //% blockId="microspade_create_message_number"
    //% to.defl="agent"
    //% body.defl=0
    //% performative.defl=MessagePerformative.Inform
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% group="Messages"
    //% weight=58
    export function createMessageNumber(to: string, body: number, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return new Message(to, agentName, performative, "" + body, true);
    }

    /**
     * Creates a reply message by inverting the destination and setting the sender as the current agent.
     */
    //% block="reply to $message with body $replyBody||performative $performative"
    //% blockId="microspade_message_make_reply"
    //% performative.defl=MessagePerformative.Inform
    //% group="Messages"
    //% weight=35
    export function makeReply(message: Message, replyBody: string, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return message ? createMessage(message.getField(MessageField.Sender), replyBody, performative) : null;
    }

    /**
     * Creates a reply message by inverting the destination and setting the sender as the current agent, with a numeric body.
     */
    //% block="reply to $message with body number $replyBody||performative $performative"
    //% blockId="microspade_message_make_reply_number"
    //% performative.defl=MessagePerformative.Inform
    //% group="Messages"
    //% weight=34
    export function makeReplyNumber(message: Message, replyBody: number, performative: MessagePerformative = MessagePerformative.Inform): Message {
        return message ? createMessageNumber(message.getField(MessageField.Sender), replyBody, performative) : null;
    }

    /**
     * Gets a performative value for comparison or filtering.
     */
    //% block="$performative"
    //% blockId="microspade_performative"
    //% group="Messages"
    //% weight=30
    export function performative(performative: MessagePerformative): MessagePerformative {
        return performative;
    }

    /**
     * Gets the performative of a message.
     */
    //% block="get performative of $message"
    //% blockId="microspade_message_get_performative"
    //% group="Messages"
    //% weight=46
    export function getMessagePerformative(message: Message): MessagePerformative {
        if (!message) return MessagePerformative.Inform;
        return message.getPerformative();
    }

    /**
     * Gets the value of a specific field from a message.
     */
    //% block="get $field of $message"
    //% blockId="microspade_message_get_field"
    //% group="Messages"
    //% weight=45
    export function getMessageField(message: Message, field: MessageField): string {
        if (!message) return "";
        return message.getField(field);
    }

    /**
     * Gets the body of a message interpreted as a number.
     */
    //% block="get body as number of $message"
    //% blockId="microspade_message_get_body_number"
    //% group="Messages"
    //% weight=44
    export function getMessageBodyNumber(message: Message): number {
        if (!message) return 0;
        let num = parseFloat(message.getField(MessageField.Body));
        return isNaN(num) ? 0 : num;
    }

    /**
     * Checks if a message exists (is not null or undefined).
     */
    //% block="$message exists"
    //% blockId="microspade_message_exists"
    //% group="Messages"
    //% weight=42
    export function messageExists(message: Message): boolean {
        return message !== null && message !== undefined;
    }

    // Agent's incoming mailbox (FIFO queue)
    let _mailbox: Message[] = [];
    const MAX_MAILBOX_SIZE = 10;

    /**
     * Manually adds a message to the mailbox queue (useful for local tests).
     */
    export function queueMessage(msg: Message): void {
        if (!msg) return;
        if (_mailbox.length >= MAX_MAILBOX_SIZE) {
            _mailbox.shift(); // Remove oldest message to free up RAM
        }
        _mailbox.push(msg);
    }

    /**
     * Sends a message via radio using compact binary buffer.
     */
    //% block="send message $msg"
    //% blockId="microspade_send_message"
    //% group="Messages"
    //% weight=55
    export function sendMessage(msg: Message): void {
        if (!msg) return;
        initRadio();
        radio.sendBuffer(msg.encodeBuffer());
    }

    /**
     * Event that runs automatically when the agent receives a message addressed to it.
     */
    //% block="on message received $message"
    //% blockId="microspade_on_message_received"
    //% draggableParameters="reporter"
    //% group="Messages"
    //% weight=48
    export function onMessageReceived(handler: (message: Message) => void): void {
        initRadio();
        messageReceivedHandler = handler;
    }

    /**
     * Extracts and returns the first message from the mailbox matching the filter (if specified).
     * Returns null if no matching message is found.
     */
    //% block="receive message||matching performative $performative body contains $body sender $sender destination $to"
    //% blockId="microspade_receive_message"
    //% performative.defl=PerformativeFilter.Any
    //% body.defl=null
    //% sender.defl=null
    //% to.defl=null
    //% group="Messages"
    //% weight=50
    export function receive(performative: PerformativeFilter = null, body: string = null, sender: string = null, to: string = null): Message {
        initRadio();
        if (_mailbox.length === 0) return null;

        let perfVal = (performative === null || performative === undefined) ? -1 : (performative as number);

        let hasFilter = (perfVal !== -1) ||
            (body !== null && body !== undefined && body !== "") ||
            (sender !== null && sender !== undefined && sender !== "") ||
            (to !== null && to !== undefined && to !== "");
        if (!hasFilter) {
            return _mailbox.shift(); // Standard FIFO
        }

        // Find the first message that matches the filter
        for (let i = 0; i < _mailbox.length; i++) {
            let msg = _mailbox[i];

            // Check destination
            if (to && msg.getTo() !== to) continue;
            // Check sender
            if (sender && msg.getSender() !== sender) continue;
            // Check performative
            if (perfVal !== -1 && msg.getPerformative() !== perfVal) continue;
            // Check body
            if (body && msg.getBody().indexOf(body) === -1) continue;

            _mailbox.splice(i, 1); // Extract it from the mailbox
            return msg;
        }
        return null;
    }
}
