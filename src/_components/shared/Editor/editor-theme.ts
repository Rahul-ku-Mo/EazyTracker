export interface EditorTheme {
    root: string;
    paragraph: string;
    placeholder: string;
    code?: string;
    codeHighlight?: Record<string, string>;
    text: {
      bold: string;
      italic: string;
      underline: string;
      strikethrough: string;
      underlineStrikethrough: string;
    };
    heading: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
    };
    list: {
      ul: string;
      checklist: string;
      listitem: string;
      listitemChecked: string;
      listitemUnchecked: string;
      nested: {
   
        listitem: string;
      };
      olDepth: string[]
    };
    link: string;
    quote: string;
    hr: string;
  }
  
  export const theme: EditorTheme = {
    root: "editor-root",
    paragraph: "editor-paragraph",
    placeholder: "editor-placeholder",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      underlineStrikethrough: "editor-text-underline-strikethrough",
    },
    code: "editor-code",
    codeHighlight: {
      atrule: "editor-tokenAttr",
      attr: "editor-tokenAttr",
      boolean: "editor-tokenProperty",
      builtin: "editor-tokenSelector",
      cdata: "editor-tokenComment",
      char: "editor-tokenSelector",
      class: "editor-tokenFunction",
      "class-name": "editor-tokenFunction",
      comment: "editor-tokenComment",
      constant: "editor-tokenProperty",
      deleted: "editor-tokenProperty",
      doctype: "editor-tokenComment",
      entity: "editor-tokenOperator",
      function: "editor-tokenFunction",
      important: "editor-tokenVariable",
      inserted: "editor-tokenSelector",
      keyword: "editor-tokenAttr",
      namespace: "editor-tokenVariable",
      number: "editor-tokenProperty",
      operator: "editor-tokenOperator",
      prolog: "editor-tokenComment",
      property: "editor-tokenProperty",
      punctuation: "editor-tokenPunctuation",
      regex: "editor-tokenVariable",
      selector: "editor-tokenSelector",
      string: "editor-tokenSelector",
      symbol: "editor-tokenProperty",
      tag: "editor-tokenProperty",
      url: "editor-tokenOperator",
      variable: "editor-tokenVariable",
    },
    heading: {
      h1: "editor-heading-h1 editor-heading-font",
      h2: "editor-heading-h2 editor-heading-font",
      h3: "editor-heading-h3 editor-heading-font",
      h4: "editor-heading-h4 editor-heading-font",
      h5: "editor-heading-h5 editor-heading-font",
      h6: "editor-heading-h6 editor-heading-font",
    },
    list: {
      ul: "editor-list-ul",
      checklist: "editor-list-checklist",
      listitem: "editor-list-item",
      listitemChecked: "editor-list-item-checked",
      listitemUnchecked: "editor-list-item-unchecked",
      nested: {
        listitem: "editor-nested-list-item",
      },
      olDepth: [
        'editor-list-ol1',
        'editor-list-ol2',
        'editor-list-ol3',
        'editor-list-ol4',
        'editor-list-ol5',
      ],
    },
    link: "editor-link",
    quote: "editor-quote",
    hr: "editor-hr",
  };


 