const { faker } = require("@faker-js/faker");
const { writeFileSync } = require("fs");
const ruleSchema = require("./schema");

function generateSimulationData(rule, numberOfEntries) {
  const data = [];

  for (let i = 0; i < numberOfEntries; i++) {
    const entry = {
      caseId: rule.caseId,
      eventName: faker.helpers.arrayElement(rule.eventNames),
      timestamp: faker.date.recent().toISOString(),
      originator: {
        name: faker.person.fullName(),
        position: faker.person.jobTitle(),
        department: rule.department,
      },
    };

    data.push(entry);
  }

  return data;
}

function createSimulation(numberOfEntries, ruleInputs) {
  let allSimulationData = [];
  ruleInputs.forEach((rule) => {
    const simulationData = generateSimulationData(rule, numberOfEntries);
    console.log(simulationData);
    allSimulationData = allSimulationData.concat(simulationData);
  });

  console.table(allSimulationData);
  const result = JSON.stringify(allSimulationData, null, 2)
  writeFileSync('./simulation/data/simulation_1.json', result)
}

createSimulation(50, ruleSchema)