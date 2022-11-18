export interface Store {
    version:   string;
    solutions: Solution[];
}

export interface Solution {
    title:           string;
    name:            string;
    description:     string;
    templates:       Templates;
    defaultTemplate: string;
}

export interface Templates {
   [key:string]: string;
}
