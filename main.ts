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

    // Priority Inhibition State (Subsumption Architecture)
    let _activePriority: number = 0;
    let _lastHighPriorityTime: number = 0;

    /**
     * Window of time (in milliseconds) that a higher-priority behavior holds
     * exclusive control over lower-priority behaviors.
     * 
     * Rationale for 200 ms:
     * Sensors on the micro:bit (such as ultrasonic sonar or infrared line sensors)
     * are typically polled in loops every 30 to 100 ms. A 200 ms window covers 
     * approximately 3 to 4 sensor polling cycles, preventing low-priority behaviors
     * from "glitching" or "flickering" the actuators in between sensor readings.
     * If a high-priority behavior stops executing for more than 200 ms, the inhibition
     * automatically expires and lower-priority behaviors resume smoothly.
     */
    const INHIBITION_WINDOW_MS = 200;

    /**
     * Internal helper function that checks whether a behavior with the given priority
     * is allowed to execute or is currently inhibited by a higher-priority behavior.
     */
    function shouldExecute(priority: number): boolean {
        let now = control.millis();

        // 1. If the inhibition window has expired, reset active priority back to base level (0)
        if (now - _lastHighPriorityTime > INHIBITION_WINDOW_MS) {
            _activePriority = 0;
        }

        // 2. If the current behavior's priority is lower than active priority, it is INHIBITED
        if (priority < _activePriority) {
            return false;
        }

        // 3. If equal or higher priority, claim or renew control
        _activePriority = priority;
        _lastHighPriorityTime = now;
        return true;
    }

    /**
     * Executes an action once in the background after the agent starts.
     */
    //% block="one shot $name||priority $priority"
    //% blockId="microspade_add_oneshot"
    //% name.defl="task"
    //% priority.defl=0
    //% priority.min=0 priority.max=100
    //% group="Behaviours"
    //% weight=70
    export function addOneShotBehaviour(name: string, handler: () => void, priority: number = 0): void {
        if (!handler) return;

        control.runInBackground(() => {
            if (running && shouldExecute(priority)) {
                handler();
            }
        });
    }

    /**
     * Executes an action continuously in a loop in the background while the agent is running.
     */
    //% block="cyclic $name||priority $priority"
    //% blockId="microspade_add_cyclic"
    //% name.defl="task"
    //% priority.defl=0
    //% priority.min=0 priority.max=100
    //% group="Behaviours"
    //% weight=80
    export function addCyclicBehaviour(name: string, handler: () => void, priority: number = 0): void {
        if (!handler) return;

        control.runInBackground(() => {
            while (running) {
                if (shouldExecute(priority)) {
                    handler();
                }
                basic.pause(10); // Yield CPU to other fibres
            }
        });
    }

    /**
     * Executes an action periodically in the background at fixed time intervals.
     */
    //% block="periodic $name every $periodMs ms||priority $priority"
    //% blockId="microspade_add_periodic"
    //% name.defl="task"
    //% periodMs.defl=1000
    //% priority.defl=0
    //% priority.min=0 priority.max=100
    //% group="Behaviours"
    //% weight=75
    export function addPeriodicBehaviour(name: string, periodMs: number, handler: () => void, priority: number = 0): void {
        if (!handler) return;

        control.runInBackground(() => {
            while (running) {
                if (shouldExecute(priority)) {
                    handler();
                }
                basic.pause(periodMs);
            }
        });
    }

    /**
     * Executes an action once in the background after a specified delay once the agent starts.
     */
    //% block="timeout $name after $timeoutMs ms||priority $priority"
    //% blockId="microspade_add_timeout"
    //% name.defl="task"
    //% timeoutMs.defl=2000
    //% priority.defl=0
    //% priority.min=0 priority.max=100
    //% group="Behaviours"
    //% weight=65
    export function addTimeoutBehaviour(name: string, timeoutMs: number, handler: () => void, priority: number = 0): void {
        if (!handler) return;

        control.runInBackground(() => {
            basic.pause(timeoutMs);
            if (running && shouldExecute(priority)) {
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
