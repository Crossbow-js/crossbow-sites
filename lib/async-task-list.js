var tasks = require("./asyncTasks").tasks;

module.exports.tasklist = [
    {
        step: "Preparing global vars, such as `site` & `compiled`",
        fn: tasks.prepareFrontVars
    },
    {
        step: "Adding context-aware HB Helpers",
        fn: tasks.transformData
    },
    {
        step: "Flatten the item before transforms",
        fn: tasks.flattenBeforeTransforms
    },
    {
        step: "Run before item render hooks",
        fn: tasks.beforeRenderHooks
    },
    {
        step: "Add initial connect to for first {{content}} block",
        fn: tasks.addInitialContent
    },
    {
        step: "Build Layouts from the inside out.",
        fn: tasks.buildLayouts
    }
    //{
    //    step: "Handle Simple mode",
    //    fn: tasks.handleSimpleMode
    //}
];