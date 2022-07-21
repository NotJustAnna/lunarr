import chalk, { Chalk } from 'chalk';
import { dump } from 'js-yaml';
import { highlight, Theme } from 'cli-highlight';
import { SimpleLogger } from '@/common/logger/SimpleLogger';
import { LogLevel } from '@/common/logger/Logger';

export class AdvancedLogger extends SimpleLogger {
  protected messagePrefix(level: LogLevel, now: Date): string {
    return (
      '[' +
      chalk.blueBright(now.getHours().toString().padStart(2, '0')) +
      ':' +
      chalk.blueBright(now.getMinutes().toString().padStart(2, '0')) +
      ':' +
      chalk.blueBright(now.getSeconds().toString().padStart(2, '0')) +
      '] [' +
      chalk.magenta(this.name) +
      '/' +
      AdvancedLogger.levelColor[level](level.toUpperCase()) +
      ']'
    );
  }

  protected handleMessage(level: LogLevel, msg: string): string {
    const highlighted = msg.replace(SimpleLogger.hlTagRegExp, (_, language, value) => {
      return highlight(value, { language, theme: AdvancedLogger.theme });
    });
    return AdvancedLogger.levelColor[level](highlighted);
  }

  protected handleMetadata(obj: object): string {
    // This function takes a JSON-compatible object, transforms it to YAML,
    // and syntax-highlights it. Additionally, magic Regex code was added in
    // to support highlighting snippets of code in other languages.
    // To see it in action: send `<hl sql>SELECT hello FROM world</hl>`
    // as a string anywhere inside the metadata object.

    // This first step dumps the metadata object as an YAML
    const dumped = dump(obj, SimpleLogger.yamlDumpOptions)
      .split('\n')
      .map((v) => `  ${v}`)
      .join('\n')
      .trimEnd();

    // This next step rewrites the partially highlighted string using regex,
    // and stores further pieces of code inside an array. Then, the rewritten
    // string is highlighted as YAML using cli-highlight.
    const toBeHighlighted: [string, string][] = [];
    const partiallyHighlighted = highlight(
      dumped.replace(SimpleLogger.hlTagRegExp, (_, language, value) => {
        const s = `<HL-TO-BE-REPLACED-${toBeHighlighted.length}>`;
        toBeHighlighted.push([language, value]);
        return s;
      }),
      { language: 'yml', theme: AdvancedLogger.theme },
    );

    // No need to re-highlight a code if no highlight annotations were found.
    if (!toBeHighlighted.length) {
      return partiallyHighlighted;
    }

    // Lastly, the string is rewritten again using Regex in order to add back
    // the previously removed (and stored) strings, each being highlighted
    // using their defined language.
    return partiallyHighlighted.replace(AdvancedLogger.hlToBeReplacedRegExp, (_, index) => {
      const [language, code] = toBeHighlighted[Number(index)];
      return highlight(code, { language, theme: AdvancedLogger.theme });
    });
  }

  private static readonly hlToBeReplacedRegExp = /<HL-TO-BE-REPLACED-(\d+)>/g;

  private static readonly theme: Theme = {
    keyword: chalk.blueBright,
    type: chalk.magentaBright,
    built_in: chalk.magentaBright,
    comment: chalk.gray,
    string: chalk.green,
    regexp: chalk.blueBright,
    literal: chalk.yellowBright,
  };

  private static readonly levelColor: Record<LogLevel, Chalk> = {
    debug: chalk.cyan,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
  };
}
