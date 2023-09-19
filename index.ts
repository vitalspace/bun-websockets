// Imports the serve function from Bun
import { ServerWebSocket, serve } from "bun";

// Stores active websocket connections
const users = new Set();

// Generates random unique IDs
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Handles incoming messages
const handleMessage = (ws: ServerWebSocket<unknown>, msg: string | Buffer) => {
  // Parses the message
  //@ts-ignore
  const { type, body } = JSON.parse(msg);

  switch (type) {
    // Sends back the unique connection ID
    case "giveMyId":
      //@ts-ignore
      ws.send(JSON.stringify({ type: "giveMyId", body: { id: ws.id } }));
      break;

    // Forwards the message
    case "message":
      ws.send(JSON.stringify({ type: "message", body }));
      break;

    // Sums two numbers
    case "sum":
      const result = parseInt(body.num1) + parseInt(body.num2);
      ws.send(JSON.stringify({ type: "sum", body: { result } }));
      break;

    // Prints a message to the console
    case "hello":
      //@ts-ignore
      console.log(`${ws.id} says: ${body.message}`);
      //@ts-ignore
      ws.send(JSON.stringify({ type: "hello", body: { id: ws.id } }));
      break;

    // Sends back current time
    case "date":
      const date = new Date();
      ws.send(
        JSON.stringify({ type: "date", body: { date: date.toTimeString() } })
      );
      break;
  }
};

// Creates the server
const server = serve({
  // Handles HTTP requests
  //@ts-ignore
  async fetch(req, ctx) {
    ctx.upgrade(req);
  },

  // Handles websocket connections
  websocket: {
    // On connection
    open(ws) {
      users.add(ws);
      //@ts-ignore
      ws.id = uuidv4();
      //@ts-ignore
      console.log(`${ws.id} connected`);
    },

    // On receiving messages
    message(ws, msg) {
      handleMessage(ws, msg);
    },

    // On disconnection
    close(ws) {
      users.delete(ws);
      //@ts-ignore
      console.log(`${ws.id} disconnected`);
    },
  },
});

// Prints the port
console.log(`Listening on http://localhost:${server.port}`);
