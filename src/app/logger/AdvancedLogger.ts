import chalk, { Chalk } from 'chalk';
import { dump } from 'js-yaml';
import { highlight, Theme } from 'cli-highlight';
import { SimpleLogger } from '@/app/logger/SimpleLogger';
import { LogLevel } from '@/app/logger/Logger';

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

  private static readonly magics: Record<string, (param: string, value: string) => string> = {
    hl: (language, code) => highlight(code, { language, theme: AdvancedLogger.theme }),
    chalk: (param, value) => {
      const f = param.split('-').reduce<Chalk>((c: any, str) => {
        if (str in c) {
          return c[str] as Chalk;
        }
        console.info(`Unknown chalk function: ${str}`);
        return c;
      }, chalk);
      return f(value);
    },
  };
  private static readonly toBeReplacedRegExp = /<TO-BE-REPLACED-(\d+)>/g;

  protected handleMessage(level: LogLevel, msg: string): string {
    const highlighted = this.handleHighlight(msg);
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

    return this.handleHighlight(dumped);
  }

  private handleHighlight(str: string) {
    // This next step rewrites the partially highlighted string using regex,
    // and stores further pieces of code inside an array. Then, the rewritten
    // string is highlighted as YAML using cli-highlight.
    const toBeHighlighted: string[] = [];
    const partiallyHighlighted = highlight(
      str.replace(SimpleLogger.magicTagRegExp, (_, type, param, value) => {
        const s = `<TO-BE-REPLACED-${toBeHighlighted.length}>`;
        toBeHighlighted.push(AdvancedLogger.magics[type](param, value));
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
    return partiallyHighlighted.replace(AdvancedLogger.toBeReplacedRegExp, (_, index) => {
      return toBeHighlighted[Number(index)];
    });
  }

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
