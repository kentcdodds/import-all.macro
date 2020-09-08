import path from 'path'
import pluginTester from 'babel-plugin-tester'
import prettier from 'prettier'
import {prettier as prettierConfig} from 'kcd-scripts/config'

const projectRoot = path.join(__dirname, '../../../').replace(/\\/g, '/')

expect.addSnapshotSerializer({
  print(val) {
    return val
      .split(projectRoot)
      .join('<PROJECT_ROOT>/')
      .replace(/fixtures/g, 'files')
      .replace(/..\/macro/, 'import-all.macro')
  },
  test(val) {
    return typeof val === 'string'
  },
})

export function createMacroTests(pluginTesterOptions) {
  pluginTester({
    snapshot: true,
    formatResult(result) {
      return prettier.format(result, {...prettierConfig, parser: 'babel'})
    },
    ...pluginTesterOptions,
  })
}
