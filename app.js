const http = require("http");
const Io = require("./Io");

const users = new Io("./users.json");
const bodyParser = (req) => {
  return new Promise((resolve, reject) => {
    req.on("data", (data) => {
      resolve(JSON.parse(data));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
};

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/users" && req.method === "POST") {
      const { text, title, isCompleted } = await bodyParser(req);
      const data = await users.read();
      const id = (data[data.length - 1]?.id || 0) + 1;
      const time = new Date();
      const inf = {
        text,
        id,
        time,
        title,
        isCompleted,
      };
      await users.write(!data.length ? [inf] : [...data, inf]);
      res.end("success");
    } else if (req.url === "/users" && req.method === "GET") {
      const data = await users.read();
      res.end(JSON.stringify(data));
    } else if (req.url === "/users" && req.method === "PUT") {
      const data = await users.read();
      const { id, text, title, isCompleted } = await bodyParser(req);
      console.log(id, text);
      const inf = data.map((item) => {
        if (item.id === id) {
          item.text = text;
          item.title = title;
          item.isCompleted = isCompleted;
        }

        return item;
      });

      console.log(inf);
      await users.write(inf);

      res.end("success");
    } else if (req.url === "/users" && req.method === "DELETE") {
      const data = await users.read();
      const { id } = await bodyParser(req);

      const inf = await data.filter((item) => item.id !== id);

      await users.write(inf);
      res.end("success");
    } else if (req.url === "/about" && req.method === "PUT") {
      const { id } = await bodyParser(req);
      const data = await users.read();
      const inf = data.find((item) => item.id === id);
      res.end(JSON.stringify(inf));
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  })
  .listen(5000, "localhost", () => {
    console.log("working on 5000");
  });
