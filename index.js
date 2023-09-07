const fs = require("node:fs");
const readline = require("node:readline");

const args = process.argv.slice(2);

fs.promises.readdir("./collections").then(async (files) => {
  for (const file of files) {
    if (file === ".gitkeep") continue;

    const folder = file.replace(".json", "");

    // mkdir if dir not exist
    if (!fs.existsSync(`./output/${folder}`)) {
      fs.mkdirSync(`./output/${folder}`);
    }

    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(`./collections/${file}`),
        crlfDelay: Infinity,
      });

      let jsonStr = "";

      // readline limit
      let count = parseInt(args[0]) || Infinity;

      for await (let line of rl) {
        if (count <= 0) {
          break;
        }

        if (line === "[{") {
          line = "{";
        }

        if (line === "}," || line === "}]") {
          jsonStr += "}";
          // handle first line of the file
          const json = JSON.parse(jsonStr);
          fs.writeFileSync(`./output/${folder}/${json._id.$oid}.json`, jsonStr);

          jsonStr = "";

          continue;
        }

        jsonStr += `${line}\n`;

        count--;
      }

      console.log("Done.");
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Ram usage: ~ ${Math.round(used * 100) / 100} MB`);
    } catch (err) {
      console.error(err);
    }
  }
});
