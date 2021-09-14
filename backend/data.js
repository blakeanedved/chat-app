const { v4: uuidv4 } = require("uuid");

let users = [
  {
    name: "Blake",
    id: uuidv4(),
  },
  {
    name: "Aaron",
    id: uuidv4(),
  },
  {
    name: "Nick",
    id: uuidv4(),
  },
];

let channels = [
  {
    name: "general",
    id: uuidv4(),
  },
  {
    name: "games",
    id: uuidv4(),
  },
  {
    name: "help",
    id: uuidv4(),
  },
];

let messages = [
  {
    message: "Hey this server is really cool! 😁",
    from: users[1].id,
    channel: channels[0].id,
    id: uuidv4(),
  },
  {
    message: "For sure! 😎",
    from: users[0].id,
    channel: channels[0].id,
    id: uuidv4(),
  },
  {
    message:
      "Have you guys seen the new {x} game? I think it looks awesome. 🎮",
    from: users[0].id,
    channel: channels[1].id,
    id: uuidv4(),
  },
  {
    message: "Yeah the graphics are insane ✨",
    from: users[2].id,
    channel: channels[1].id,
    id: uuidv4(),
  },
  {
    message: "Its also free, which I like 💸",
    from: users[1].id,
    channel: channels[1].id,
    id: uuidv4(),
  },
  {
    message:
      "I really need help to make sure I did this algebra correctly, can anyone help? `2x=4` -> `x=2` 🤔",
    from: users[1].id,
    channel: channels[2].id,
    id: uuidv4(),
  },
  {
    message: "Looks correct to me ✅",
    from: users[2].id,
    channel: channels[2].id,
    id: uuidv4(),
  },
  {
    message: "I agree",
    from: users[0].id,
    channel: channels[2].id,
    id: uuidv4(),
  },
];

module.exports = { users, channels, messages };
