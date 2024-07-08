const { spawn } = require("child_process");
const sourceData = require("../../simulation/data/simulation_1.json");

async function processMining(data) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      "./miners/taskLayer/task_miner.py",
      JSON.stringify(data),
    ]);

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stdout.on("end", () => {
      try {
        const output = JSON.parse(result);
        resolve(output);
      } catch (error) {
        reject(`Error parsing JSON: ${error}`);
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      reject(`Error from Python script: ${data}`);
    });
  });
}

module.exports = async function main() {
  try {
    const petriNetData = await processMining(sourceData);
    console.log("Petri Net Data:", petriNetData);

    for (const key in petriNetData) {
      if (Object.hasOwnProperty.call(petriNetData, key)) {
        const element = petriNetData[key];
        console.table(element.places);
      }
    }

    return { petriNetData };
  } catch (error) {
    console.error(error);
  }
}