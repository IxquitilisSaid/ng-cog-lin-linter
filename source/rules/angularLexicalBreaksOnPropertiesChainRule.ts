import {tsquery} from "@phenomnomnominal/tsquery";
import * as Lint from "tslint";
import * as ts from "typescript";
import * as peer from "../support/peer";
import {couldBeType} from "../support/util";

export class Rule extends Lint.Rules.TypedRule {
    public static metadata: Lint.IRuleMetadata = {
        deprecationMessage: peer.v5 ? peer.v5NotSupportedMessage : undefined,
        description: "enforces lexical breaks on properties chain",
        options: null,
        optionsDescription: "Not configurable.",
        requiresTypeInfo: true,
        ruleName: "angular-lexical-breaks-on-properties-chain",
        type: "formatting",
        typescriptOnly: true,
        hasFix: true
    };

    public static FAILURE_STRING = "Use lexical breaks on properties chain";

    public applyWithProgram(
        sourceFile: ts.SourceFile,
        program: ts.Program
    ): Lint.RuleFailure[] {
        const failures: Lint.RuleFailure[] = [];
        const typeChecker = program.getTypeChecker();

        const classDeclarations = tsquery(
            sourceFile,
            `ClassDeclaration:has(Decorator[expression.expression.name="Component"])`
        );

        classDeclarations.forEach(classDeclaration => {
            const propertyAccessExpressions = tsquery(
                classDeclaration,
                `CallExpression PropertyAccessExpression[name.name="subscribe"]`
            );

            propertyAccessExpressions.forEach(node => {
                const propertyAccessExpression = node as ts.PropertyAccessExpression;
                const type = typeChecker.getTypeAtLocation(
                    propertyAccessExpression.expression
                );

                if (couldBeType(type, "Observable")) {
                    const {name} = propertyAccessExpression;

                    failures.push(
                        new Lint.RuleFailure(
                            sourceFile,
                            name.getStart(),
                            name.getStart() + name.getWidth(),
                            Rule.FAILURE_STRING,
                            this.ruleName
                        )
                    );
                }
            });
        });

        return failures;
    }

    /**
   * Checks a component class for occurrences of .subscribe() and corresponding takeUntil() requirements
   */
    // private checkComponentClassDeclaration(
    //     sourceFile: ts.SourceFile,
    //     program: ts.Program,
    //     componentClassDeclaration: ts.ClassDeclaration
    // ): Lint.RuleFailure[] {
    //     const failures: Lint.RuleFailure[] = [];
    //     const typeChecker = program.getTypeChecker();

    //     /** list of destroy subjects used in takeUntil() operators */
    //     const destroySubjectNamesUsed: {
    //         [destroySubjectName: string]: boolean;
    //     } = {};

    //     // find observable.subscribe() call expressions
    //     const subscribePropertyAccessExpressions = tsquery(
    //     componentClassDeclaration,
    //     `CallExpression > PropertyAccessExpression[name.name="subscribe"]`
    //     );

    //     // check whether it is an observable and check the takeUntil before the subscribe
    //     subscribePropertyAccessExpressions.forEach(node => {
    //         const propertyAccessExpression = node as ts.PropertyAccessExpression;
    //         const type = typeChecker.getTypeAtLocation(
    //             propertyAccessExpression.expression
    //         );

    //         if (couldBeType(type, "Observable")) {
    //             const subscribeFailures = this.checkTakeuntilBeforeSubscribe(
    //                 sourceFile,
    //                 propertyAccessExpression
    //             );

    //             failures.push(...subscribeFailures.failures);

    //             if (subscribeFailures.destroySubjectName) {
    //                 destroySubjectNamesUsed[subscribeFailures.destroySubjectName] = true;
    //             }
    //         }
    //     });

    //     // find observable.pipe() call expressions
    //     const pipePropertyAccessExpressions = tsquery(
    //         componentClassDeclaration,
    //         `CallExpression > PropertyAccessExpression[name.name="pipe"]`
    //     );

    //     // check whether it is an observable and check the takeUntil before operators requiring it
    //     pipePropertyAccessExpressions.forEach(node => {
    //         const propertyAccessExpression = node as ts.PropertyAccessExpression;
    //         const pipeCallExpression = node.parent as ts.CallExpression;
    //         const type = typeChecker.getTypeAtLocation(
    //             propertyAccessExpression.expression
    //         );

    //         if (couldBeType(type, "Observable")) {
    //             const pipeFailures = this.checkTakeuntilBeforeOperatorsInPipe(
    //                 sourceFile,
    //                 pipeCallExpression.arguments
    //             );

    //             failures.push(...pipeFailures.failures);
    //             pipeFailures.destroySubjectNames.forEach(destroySubjectName => {
    //                 if (destroySubjectName) {
    //                     destroySubjectNamesUsed[destroySubjectName] = true;
    //                 }
    //             });
    //         }
    //     });

    //     // check the ngOnDestroyMethod
    //     const destroySubjectNamesUsedList = Object.keys(destroySubjectNamesUsed);

    //     destroySubjectNamesUsedList.forEach(destroySubjectNameUsed => {
    //         // look for ngOnDestroy in class and in all parent classes
    //         const classesToCheck = [
    //             componentClassDeclaration,
    //             ...this.findParentClasses(program, componentClassDeclaration)
    //         ];

    //         const ngOnDestroyFailuresList = classesToCheck.map(classDeclaration => this.checkNgOnDestroy(
    //             sourceFile,
    //             classDeclaration,
    //             destroySubjectNameUsed
    //         ));

    //         // if there is no correct implementation of ngOnDestroy in any of the classes to be checked
    //         if (ngOnDestroyFailuresList.length > 0 && !ngOnDestroyFailuresList.find(failures => failures.length === 0)) {
    //             failures.push(...ngOnDestroyFailuresList[0]);
    //         }
    //     });

    //     return failures;
    // }
}
