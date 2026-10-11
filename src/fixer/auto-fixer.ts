import ts from 'typescript';

export interface AutoFixResult {
  modified: boolean;
  content: string;
  appliedFixes: string[];
  warnings: string[];
  syntaxValid: boolean;
}

export class AutoFixer {
  /**
   * AST-based, side-effect aware surgical code repair with rollback safety.
   */
  public static fix(content: string, fileName = 'snippet.ts'): AutoFixResult {
    const originalContent = content;
    const appliedFixes: string[] = [];
    const warnings: string[] = [];

    const isTsOrJs = /\.(ts|tsx|js|jsx)$/i.test(fileName) || (!fileName.includes('.') && !content.trim().startsWith('<'));

    if (!isTsOrJs) {
      // Non-JS/TS files: HTML / text rules
      return AutoFixer.fixNonJs(content, fileName);
    }

    // 1. Initial Parse Check
    const sourceFile = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true,
      fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    // Track replacements
    let modified = false;

    // Helper: detect if an expression might have runtime side-effects (function calls, assignments, etc.)
    const hasSideEffects = (node: ts.Node): boolean => {
      let sideEffectFound = false;
      const visit = (n: ts.Node) => {
        if (
          ts.isCallExpression(n) ||
          ts.isNewExpression(n) ||
          ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.EqualsToken || n.operatorToken.kind >= ts.SyntaxKind.FirstCompoundAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastCompoundAssignment) ||
          ts.isPrefixUnaryExpression(n) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) ||
          ts.isPostfixUnaryExpression(n) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) ||
          ts.isAwaitExpression(n) ||
          ts.isYieldExpression(n)
        ) {
          sideEffectFound = true;
          return;
        }
        ts.forEachChild(n, visit);
      };
      visit(node);
      return sideEffectFound;
    };

    // Transformer factory
    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      return (rootNode) => {
        const visit: ts.Visitor = (node): ts.Node | undefined | ts.Node[] => {
          // Check for console.log statements
          if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
            const call = node.expression;
            if (
              ts.isPropertyAccessExpression(call.expression) &&
              call.expression.expression.getText(sourceFile) === 'console' &&
              call.expression.name.getText(sourceFile) === 'log'
            ) {
              // Check arguments for side-effects
              const argumentsHaveSideEffects = call.arguments.some((arg) => hasSideEffects(arg));

              if (argumentsHaveSideEffects) {
                warnings.push(
                  `Preserved console.log at position ${call.getStart(sourceFile)} because its arguments contain potential side-effects: "${call.getText(sourceFile)}"`
                );
                return node; // PRESERVE call to prevent breaking side-effects
              }

              // Safe to eliminate
              modified = true;
              appliedFixes.push(`Safely eliminated console.log(${call.arguments.map((a) => a.getText(sourceFile)).join(', ')})`);

              // If parent is an if-statement without block: e.g. if (x) console.log(y);
              if (ts.isIfStatement(node.parent) && node.parent.thenStatement === node) {
                // Replace with empty block so the next statement does not become the 'then' branch!
                return context.factory.createBlock([], false);
              }

              return undefined; // Remove statement cleanly
            }
          }

          // Check if parent is an if-statement containing a non-block console.log
          if (ts.isIfStatement(node)) {
            if (
              ts.isExpressionStatement(node.thenStatement) &&
              ts.isCallExpression(node.thenStatement.expression)
            ) {
              const call = node.thenStatement.expression;
              if (
                ts.isPropertyAccessExpression(call.expression) &&
                call.expression.expression.getText(sourceFile) === 'console' &&
                call.expression.name.getText(sourceFile) === 'log'
              ) {
                if (call.arguments.some((arg) => hasSideEffects(arg))) {
                  warnings.push(`Preserved console.log in if-statement: "${call.getText(sourceFile)}"`);
                  return ts.visitEachChild(node, visit, context);
                }

                modified = true;
                appliedFixes.push(`Replaced single-line if-console.log with safe empty block`);
                return context.factory.updateIfStatement(
                  node,
                  node.expression,
                  context.factory.createBlock([], false),
                  node.elseStatement
                );
              }
            }
          }

          return ts.visitEachChild(node, visit, context);
        };

        return ts.visitNode(rootNode, visit) as ts.SourceFile;
      };
    };

    // Apply AST transformations
    const result = ts.transform(sourceFile, [transformer]);
    const transformedSourceFile = result.transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    let outputCode = printer.printFile(transformedSourceFile);
    result.dispose();

    // 2. Post-Transformation Verification (Compiler Parse Check)
    const verificationFile = ts.createSourceFile(
      'verify_' + fileName,
      outputCode,
      ts.ScriptTarget.Latest,
      true
    );

    const diagnostics = (verificationFile as any).parseDiagnostics || [];
    if (diagnostics.length > 0) {
      // ROLLBACK: transformation broke syntax!
      return {
        modified: false,
        content: originalContent,
        appliedFixes: [],
        warnings: [`Transformation rolled back: generated invalid syntax with ${diagnostics.length} diagnostic error(s).`],
        syntaxValid: false
      };
    }

    return {
      modified,
      content: outputCode,
      appliedFixes,
      warnings,
      syntaxValid: true
    };
  }

  private static fixNonJs(content: string, fileName: string): AutoFixResult {
    let fixed = content;
    const appliedFixes: string[] = [];

    // In HTML: Inject viewport meta tag if missing in full document
    if (/<html/i.test(fixed) && !/<meta[^>]*name=["']viewport["']/i.test(fixed)) {
      fixed = fixed.replace(
        /<head>/i,
        '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
      appliedFixes.push('Injected mobile responsive viewport meta tag');
    }

    // In HTML: Inject alt attribute to unlabelled img tags
    if (/<img\b((?:(?!alt=)[^>])*)>/gi.test(fixed)) {
      fixed = fixed.replace(/<img\b((?:(?!alt=)[^>])*)>/gi, '<img alt="Visual graphic" $1>');
      appliedFixes.push('Added missing accessible alt attributes to images');
    }

    return {
      modified: appliedFixes.length > 0,
      content: fixed,
      appliedFixes,
      warnings: [],
      syntaxValid: true
    };
  }
}
