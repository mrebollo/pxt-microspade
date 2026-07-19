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

    // Lazy initialization of the radio module
    function initRadio(): void {
        if (_radioInitialized) return;
        _radioInitialized = true;
        radio.onReceivedString(function (receivedString) {
            if (!running) return;
            let msg = Message.decode(receivedString);
            if (msg) {
                if (msg.getTo() === agentName || msg.getTo() === "*") {
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
    //% block="one shot behaviour"
    //% blockId="microspade_add_oneshot"
    //% group="Behaviours"
    //% weight=70
    export function addOneShotBehaviour(handler: () => void): void {
        control.runInBackground(() => {
            if (running) {
                handler();
            }
        });
    }

    /**
     * Executes an action continuously in a loop in the background while the agent is running.
     */
    //% block="cyclic behaviour"
    //% blockId="microspade_add_cyclic"
    //% group="Behaviours"
    //% weight=80
    export function addCyclicBehaviour(handler: () => void): void {
        control.runInBackground(() => {
            while (running) {
                handler();
                basic.pause(10); // Yield CPU to other fibres
            }
        });
    }

    /**
     * Executes an action periodically in the background at fixed time intervals.
     */
    //% block="periodic behaviour every $periodMs ms"
    //% blockId="microspade_add_periodic"
    //% periodMs.defl=1000
    //% group="Behaviours"
    //% weight=75
    export function addPeriodicBehaviour(periodMs: number, handler: () => void): void {
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
    //% block="timeout behaviour after $timeoutMs ms"
    //% blockId="microspade_add_timeout"
    //% timeoutMs.defl=2000
    //% group="Behaviours"
    //% weight=65
    export function addTimeoutBehaviour(timeoutMs: number, handler: () => void): void {
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

    export enum MessagePerformative {
        //% block="inform"
        Inform,
        //% block="request"
        Request,
        //% block="query"
        Query,
        //% block="confirm"
        Confirm,
        //% block="disconfirm"
        Disconfirm,
        //% block="agree"
        Agree,
        //% block="refuse"
        Refuse,
        //% block="failure"
        Failure
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

        constructor(to: string, sender: string, performative: MessagePerformative, body: string) {
            this.to = to;
            this.sender = sender;
            this.performative = performative;
            this.body = body;
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
         * Encodes the message into a string for radio transmission.
         */
        public encode(): string {
            let bodyEncoded = this.body ? this.body.split("|").join("\\|") : "";
            // Send the performative index (0-7) to save radio payload space (max 19 chars on v1/simulator)
            let perfStr = "" + this.performative;
            return (this.to || "") + "|" + (this.sender || "") + "|" + perfStr + "|" + bodyEncoded;
        }

        /**
         * Decodes a string received via radio into a Message object.
         */
        public static decode(raw: string): Message {
            if (!raw) return null;
            let idx1 = raw.indexOf("|");
            if (idx1 < 0) return null;
            let idx2 = raw.indexOf("|", idx1 + 1);
            if (idx2 < 0) return null;
            let idx3 = raw.indexOf("|", idx2 + 1);
            if (idx3 < 0) return null;

            let to = raw.substr(0, idx1);
            let sender = raw.substr(idx1 + 1, idx2 - idx1 - 1);
            let performativeStr = raw.substr(idx2 + 1, idx3 - idx2 - 1);
            let bodyEncoded = raw.substr(idx3 + 1);
            let body = bodyEncoded.split("\\|").join("|");

            // Convert the performative index character back to its numeric value
            let perfCode = performativeStr.charCodeAt(0) - 48; // '0' is 48 in ASCII
            let performative = (perfCode >= 0 && perfCode <= 7) ? perfCode : MessagePerformative.Inform;

            return new Message(to, sender, performative, body);
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
        return new Message(to, agentName, performative, body);
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
        return new Message(to, agentName, performative, "" + body);
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
        if (!message) return null;
        // The destination is the original sender, and the sender is the current agent
        let to = message.getField(MessageField.Sender);
        let sender = agentName;
        return new Message(to, sender, performative, replyBody);
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
        if (!message) return null;
        // The destination is the original sender, and the sender is the current agent
        let to = message.getField(MessageField.Sender);
        let sender = agentName;
        return new Message(to, sender, performative, "" + replyBody);
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
        let body = message.getField(MessageField.Body);
        if (!body) return 0;
        let num = parseFloat(body);
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
     * Sends a message via radio.
     */
    //% block="send message $msg"
    //% blockId="microspade_send_message"
    //% group="Messages"
    //% weight=55
    export function sendMessage(msg: Message): void {
        if (!msg) return;
        initRadio();
        radio.sendString(msg.encode());
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
     * Template to filter mailbox messages.
     */
    //% blockNamespace="microspade" class="MessageTemplate"
    export class MessageTemplate {
        public to: string;
        public sender: string;
        public performative: MessagePerformative;

        constructor(to: string, sender: string, performative: MessagePerformative) {
            this.to = to || "";
            this.sender = sender || "";
            this.performative = performative;
        }

        public match(msg: Message): boolean {
            if (!msg) return false;

            // Check destination (if specified)
            if (this.to && msg.getTo() !== this.to) return false;

            // Check sender (if specified)
            if (this.sender && msg.getSender() !== this.sender) return false;

            // Check performative: -1 (or undefined in JS) means "any" / do not filter
            if (this.performative !== undefined && this.performative !== -1 && msg.getPerformative() !== this.performative) {
                return false;
            }
            return true;
        }
    }

    /**
     * Creates a template to filter messages in the mailbox.
     */
    //% block="template matching||destination $to sender $sender performative $performative"
    //% blockId="microspade_create_template"
    //% to.defl=""
    //% sender.defl=""
    //% group="Messages"
    //% weight=40
    export function createMessageTemplate(to: string = "", sender: string = "", performative?: MessagePerformative): MessageTemplate {
        let perf = (performative === undefined) ? -1 : performative;
        return new MessageTemplate(to, sender, perf);
    }

    /**
     * Extracts and returns the first message from the mailbox matching the template (if specified).
     * Returns null if no matching message is found.
     */
    //% block="receive message||matching template $template"
    //% blockId="microspade_receive_message"
    //% group="Messages"
    //% weight=50
    export function receive(template?: MessageTemplate): Message {
        initRadio();
        if (_mailbox.length === 0) return null;

        if (!template) {
            return _mailbox.shift(); // Standard FIFO
        }

        // Find the first message that matches the filter
        for (let i = 0; i < _mailbox.length; i++) {
            if (template.match(_mailbox[i])) {
                let msg = _mailbox[i];
                _mailbox.splice(i, 1); // Extract it from the mailbox
                return msg;
            }
        }
        return null;
    }
}
