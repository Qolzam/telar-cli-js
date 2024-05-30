export interface Store {
    solutions: Solution[];
    version:   string;
}

export interface Solution {
    defaultTemplate: string;
    description:     string;
    name:            string;
    templates:       Templates;
    title:           string;
}

export interface Templates {
   [key:string]: string;
}
