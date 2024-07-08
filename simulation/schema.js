const ruleSchema = [
  {
    caseId: "Marketing Campaign",
    department: "Marketing",
    eventNames: ["CREATE", "PROPOSE", "APPROVE"],
  },
  {
    caseId: "Transactions",
    department: "Operations",
    eventNames: ["CREATE", "APPROVE", "POST"],
  },
  {
    caseId: "Inventory In",
    department: "Merchandising",
    eventNames: ["CREATE", "POST"],
  },
  {
    caseId: "Buying",
    department: "Merchandising",
    eventNames: ["CREATE", "PROPOSE", "APPROVE", "POST", "DONE"],
  },
]
module.exports = ruleSchema