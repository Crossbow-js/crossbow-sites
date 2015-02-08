var tasks = require("./asyncTasks").tasks;

module.exports.tasklist = [
    tasks.prepareFrontVars,
    //tasks.transformData,
    //tasks.transformContent,
    //tasks.handleSimpleMode,
    tasks.flattenBeforeTransforms,
    tasks.transformContentAfterTemplates,
    tasks.buildLayouts
];