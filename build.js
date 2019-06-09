const ts = require("typescript")

function compile(fileNames, options) {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();

    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            let {
                line,
                character
            } = diagnostic.file.getLineAndCharacterOfPosition(
                diagnostic.start
            );
            let message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                "\n"
            );
            console.log(
                `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
            );
        } else {
            console.log(
                `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
            );
        }
    });

    if (emitResult.emitSkipped) process.exit(1)
}

compile(["cli"], {
    target: ts.ScriptTarget.ES5,
    esModuleInterop: true,
    strict: true
});
