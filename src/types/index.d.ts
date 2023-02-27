interface ITemplateItem {
  name: string;
  url: string;
  description: string;
  type: ('git' | 'npm') & string;
}
