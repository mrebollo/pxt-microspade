# micro:spade — Developer & Technical Architecture Manual

This document provides a detailed technical explanation of the internal architecture, design decisions, and hardware-constrained implementation details of the **micro:spade** extension for the BBC micro:bit.

---

## 1. Architectural Overview

**micro:spade** implements a lightweight **Multi-Agent System (MAS)** framework tailored for embedded execution on the BBC micro:bit using Static TypeScript in MakeCode.

The design bridges two domains:
- **High-level Agent Theory**: FIPA-ACL compliant communicative acts (performatives), agent identity, and concurrent behaviour-based execution.
- **Low-level Hardware Constraints**: CODAL fiber scheduling, restricted RAM, and 19-byte radio payload bounds.

---

## 2. Compact Binary Radio Protocol

MakeCode's `radio` subsystem wraps hardware packets with a 9 to 13-byte protocol header (packet type, system timestamp, and serial number), leaving a maximum usable user payload of **19 bytes** per packet.

To maximize throughput and prevent data corruption, **micro:spade** uses a custom posicional binary buffer format over `radio.sendBuffer` and `radio.onReceivedBuffer`.

### 2.1 Packet Layout (Max 19 Bytes Payload)

| Byte Offset | Field | Type | Description |
| :--- | :--- | :--- | :--- |
| `0` | **Destination ID** | `uint8` | 1-byte hash of destination agent name (0..254), or `255` (`*`) |
| `1` | **Sender ID** | `uint8` | 1-byte hash of sender agent name (0..254) |
| `2` | **Performative** | `uint8` | Performative index (`0` to `7`) |
| `3` | **IsNumber Flag** | `uint8` | `1` if body is binary Float32LE; `0` if UTF-8 string |
| `4 .. N` | **Body Payload** | `bytes` | **Float32LE (4 bytes)** or UTF-8 text string (up to 15 bytes) |

### 2.2 1-Byte Agent ID Hashing (`nameToId`)

Agent names (e.g., `"cli"`, `"ter"`, `"ping"`) are mapped to a 1-byte integer (`0..254`) using a deterministic 8-bit hash function:

```typescript
const BROADCAST_ID = 255;

function nameToId(name: string): number {
    if (!name || name === "*") return BROADCAST_ID;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) & 0xFF;
    }
    return hash === BROADCAST_ID ? 254 : hash;
}
```

- **Broadcast Constant (`255`)**: Reserved exclusively for wildcard broadcast messages (`"*"`).
- **Fast Reception Filtering**: Incoming radio packets check `Byte 0` immediately upon arrival in `radio.onReceivedBuffer`. Non-matching packets are discarded in a single instruction cycle without string allocation or payload parsing.

### 2.3 Binary Float32 Encoding vs. String Formatting

Converting floating-point numbers to strings (`"" + num`) produces variable-length text (e.g., `3.14159265` takes 10 bytes) and can be truncated or corrupted by radio text delimiters.

When sending numbers via `createMessageNumber` or `makeReplyNumber`:
- The `IsNumber` byte is set to `1`.
- The float is written as 4 exact IEEE 754 LE bytes (`NumberFormat.Float32LE`).
- Total numeric packet size: **Exactly 8 bytes** (4-byte header + 4-byte float).

---

## 3. Concurrency & Behaviour Execution Model

The micro:bit executes Static TypeScript using CODAL fibers (lightweight cooperative threads). **micro:spade** exposes four non-blocking behaviour primitives managed via `control.runInBackground`:

1. **One-Shot (`addOneShotBehaviour`)**: Runs once asynchronously in the background.
2. **Timeout (`addTimeoutBehaviour`)**: Pauses for a specified duration (`basic.pause(ms)`) before executing once.
3. **Cyclic (`addCyclicBehaviour`)**: Executes continuously in a `while (running)` loop. Calls `basic.pause(20)` at the end of each iteration to yield CPU time to other fibers.
4. **Periodic (`addPeriodicBehaviour`)**: Executes in a loop with an explicit delay (`basic.pause(periodMs)`).

---

## 4. RAM Management & FIFO Mailbox

RAM is limited on micro:bit microcontrollers. To prevent memory leaks:

- **Bounded Queue**: Incoming messages without an active handler (`onMessageReceived`) are pushed to `_mailbox`.
- **Queue Cap**: `MAX_MAILBOX_SIZE = 10`. When full, the oldest message is shifted out (`_mailbox.shift()`) to free RAM before pushing new ones.
- **In-Place Template Filtering**: The `receive(...)` function scans `_mailbox` and extracts matching messages in-place via `_mailbox.splice(i, 1)`.

---

## 5. MakeCode Block Annotations & Dropdown UI

To ensure a seamless visual Block programming experience in MakeCode:

- **`enumIdentity`**: The `MessagePerformative` enum is annotated with `//% enumIdentity="microspade.MessagePerformative"` to expose native dropdown selector blocks.
- **Typed Getters**: `getMessagePerformative(msg)` returns the typed `MessagePerformative` enum directly for type-safe block comparisons (`if (getMessagePerformative(msg) == performative(MessagePerformative.Inform))`).

---

## 6. Build & Test Verification

The project includes an automated test suite in `test.ts`.

### Building the Project
```bash
npx pxt build
```

### Running Tests
The tests in `test.ts` execute automatically upon startup in the MakeCode simulator or physical board, printing results to the serial output (`serial.writeLine`).
