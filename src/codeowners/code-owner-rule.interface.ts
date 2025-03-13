export interface CodeOwnerRule {
  pattern: string;
  regexPattern: RegExp;
  lineNumber: number;
  owners: string[];
}
