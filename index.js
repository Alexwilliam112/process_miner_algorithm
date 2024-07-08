const { spawn } = require("child_process");
const data = require("./data.json");

const IGNORED_ACTION_PREFIX = [
  "CREATE",
  "APPROVE",
  "POST",
  "REVIEW",
  "RESPOND",
  "VERIFY",
  "COMPLETE",
  "INITIATE",
  "ASSIGN",
  "RESOLVE",
  "PUBLISH",
]; // ignored words for caseId assignments

async function caseId_Clustering(data, IGNORED_ACTION_PREFIX) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      "process_clustering.py",
      JSON.stringify(data),
      JSON.stringify(IGNORED_ACTION_PREFIX),
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

async function processMining(data) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["process_miner_all.py", JSON.stringify(data)]);

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

async function main() {
  try {
    const caseId_Clustered_Data = await caseId_Clustering(data, IGNORED_ACTION_PREFIX);
    console.log("Clustered Data:", caseId_Clustered_Data);

    const petriNetData = await processMining(caseId_Clustered_Data);
    console.log("Petri Net Data:", petriNetData);

    for (const key in petriNetData) {
      if (Object.hasOwnProperty.call(petriNetData, key)) {
        const element = petriNetData[key];
        console.table(element.places)
      }
    }

    return { caseId_Clustered_Data, petriNetData };
  } catch (error) {
    console.error(error);
  }
}

main();
