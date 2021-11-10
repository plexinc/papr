import fs from 'fs';
import jsdocApi from 'jsdoc-api';
import jsdocParse from 'jsdoc-parse';
import ts from 'typescript';

const DOCS = [
  {
    input: 'src/index.ts',
    output: 'docs/api/papr.md',
    title: 'Papr'
  },
  {
    input: 'src/model.ts',
    output: 'docs/api/model.md',
    title: 'Model'
  },
  {
    input: 'src/schema.ts',
    output: 'docs/api/schema.md',
    title: 'Schema'
  },
  {
    input: 'src/types.ts',
    output: 'docs/api/types.md',
    title: 'Types'
  },
  {
    input: 'src/utils.ts',
    output: 'docs/api/utils.md',
    title: 'Utilities'
  }
];
const WARNING = '<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->';

function transpileTS(tsCode) {
  const options = {
    module: ts.ModuleKind.ES2015,
    noResolve: true,
    target: ts.ScriptTarget.Latest,
  };

  const result = ts.transpileModule(tsCode, { compilerOptions: options });

  return result.outputText;
}

function type(names) {
  return names.map(name => name.replace(/\.</g, '<').replace(/^"(.+)"$/, '$1').replace(/\|/g, ' | '));
}

function getParameters(params) {
  const header = '| Name | Type | Attribute |';
  const separator = '| --- | --- | --- |';

  const rows = params
    .map(param => `| \`${param.name}\` | \`${type(param.type.names).join(' \\| ')}\` | ${param.optional ? 'optional' : 'required'} |`)
    .join('\n');

  return `${header}\n${separator}\n${rows}`;
}

function getReturns(returns) {
  const value = `\`${type(returns.type.names).join('')}\``;
  const description = returns.description || '';
  const isURL = description.match(/^https:/);

  return isURL ? `[${value}](${description})` : `${value} ${description}`;
}

DOCS.forEach(doc => {
  const source = fs.readFileSync(doc.input, 'utf-8');

  const sourceTranspiled = transpileTS(source);

  const jsdoc = jsdocApi.explainSync({ source: sourceTranspiled });
  const parsed = jsdocParse(jsdoc);

  const intro = parsed.find(item => item.kind === 'module' && item.name === 'intro');

  const list = parsed
    .filter(item => item.kind === 'constructor' || item.kind === 'function' || item.kind === 'member')
    .map(item => {
      const { description, params } = item;

      const parameters = params?.length > 0 ? `**Parameters:**\n\n${getParameters(params)}\n\n` : '';
      const returns = item.returns ? `**Returns:**\n\n${getReturns(item.returns[0])}\n\n` : '';
      const examples = item.examples ? `**Example:**\n\n\`\`\`ts\n${item.examples.join('\n')}\n\`\`\`\n` : '';
      const types = item.type ? `**Type:**\`${type(item.type.names)}\`\n\n` : '';

      return `## \`${item.name}\`\n\n${description}\n\n${types}${parameters}${returns}${examples}`;
    })
    .join('\n\n');

  const result = `${WARNING}\n\n# ${doc.title}\n\n${intro ? intro.description : ''}\n\n${list}`;

  fs.writeFileSync(doc.output, result);
});
