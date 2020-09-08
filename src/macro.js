const path = require('path')
// const printAST = require('ast-pretty-print')
const {createMacro} = require('babel-plugin-macros')
const glob = require('glob')

module.exports = createMacro(prevalMacros, {configName: 'importAll'})

function prevalMacros({references, ...macroOptions}) {
  const {babel} = macroOptions
  references.default.forEach(referencePath => {
    if (referencePath.parentPath.type === 'CallExpression') {
      asyncVersion({referencePath, ...macroOptions})
    } else if (
      referencePath.parentPath.type === 'MemberExpression' &&
      referencePath.parentPath.node.property.name === 'sync'
    ) {
      syncVersion({referencePath, ...macroOptions})
    } else if (
      referencePath.parentPath.type === 'MemberExpression' &&
      referencePath.parentPath.node.property.name === 'deferred'
    ) {
      deferredVersion({referencePath, ...macroOptions})
    } else {
      throw new Error(
        `This is not supported: \`${referencePath
          .findParent(babel.types.isExpression)
          .getSource()}\`. Please see the import-all.macro documentation`,
      )
    }
  })
}

function syncVersion({referencePath, state, babel, config}) {
  const {types: t} = babel
  const {
    file: {
      opts: {filename},
    },
  } = state
  const importSources = getImportSources({
    callExpressionPath: referencePath.parentPath.parentPath,
    filename,
    config,
  })

  const {importNodes, objectProperties} = importSources.reduce(
    (all, source) => {
      const id = referencePath.scope.generateUidIdentifier(source)
      all.importNodes.push(
        t.importDeclaration(
          [t.importNamespaceSpecifier(id)],
          t.stringLiteral(source),
        ),
      )
      all.objectProperties.push(t.objectProperty(t.stringLiteral(source), id))
      return all
    },
    {importNodes: [], objectProperties: []},
  )

  const objectExpression = t.objectExpression(objectProperties)

  const program = state.file.path
  program.node.body.unshift(...importNodes)
  referencePath.parentPath.parentPath.replaceWith(objectExpression)
}

function asyncVersion({referencePath, state, babel, config}) {
  const {types: t, template} = babel
  const {
    file: {
      opts: {filename},
    },
  } = state
  const promiseTemplate = template(`
    Promise.all(ALL_IMPORTS).then(function importAllHandler(importVals) {
      return IMPORT_OBJ
    })
  `)
  const importSources = getImportSources({
    callExpressionPath: referencePath.parentPath,
    filename,
    config,
  })

  const {dynamicImports, objectProperties} = importSources.reduce(
    (all, source, index) => {
      all.dynamicImports.push(
        t.callExpression(t.import(), [t.stringLiteral(source)]),
      )
      const computed = true
      all.objectProperties.push(
        t.objectProperty(
          t.stringLiteral(source),
          t.memberExpression(
            t.identifier('importVals'),
            t.numericLiteral(index),
            computed,
          ),
        ),
      )
      return all
    },
    {dynamicImports: [], objectProperties: []},
  )

  referencePath.parentPath.replaceWith(
    promiseTemplate({
      ALL_IMPORTS: t.arrayExpression(dynamicImports),
      IMPORT_OBJ: t.objectExpression(objectProperties),
    }),
  )
}

function deferredVersion({referencePath, state, babel, config}) {
  const {types: t} = babel
  const {
    file: {
      opts: {filename},
    },
  } = state
  const importSources = getImportSources({
    callExpressionPath: referencePath.parentPath.parentPath,
    filename,
    config,
  })

  const objectProperties = importSources.map(source => {
    return t.objectProperty(
      t.stringLiteral(source),
      t.functionExpression(
        null,
        [],
        t.blockStatement([
          t.returnStatement(
            t.callExpression(t.import(), [t.stringLiteral(source)]),
          ),
        ]),
      ),
    )
  })

  const objectExpression = t.objectExpression(objectProperties)

  referencePath.parentPath.parentPath.replaceWith(objectExpression)
}

function getImportSources({callExpressionPath, filename, config}) {
  let globValue
  try {
    globValue = callExpressionPath.get('arguments')[0].evaluate().value
  } catch (error) {
    // ignore the error
    // add a console.log here if you need to know more specifically what's up...
  }
  if (!globValue) {
    throw new Error(
      `There was a problem evaluating the value of the argument for the code: ${callExpressionPath.getSource()}. ` +
        `If the value is dynamic, please make sure that its value is statically deterministic.`,
    )
  }

  const filepaths = glob.sync(globValue, {cwd: path.dirname(filename)})
  if (typeof config.transformModulePath === 'function') {
    return filepaths.map(p => config.transformModulePath(p, filename))
  }

  return filepaths
}
