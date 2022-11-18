/**
 * Create a yaml file
 * @param {*} data Data to parse in yaml
 * @param {string} filePath The file path to write the YAML file
 */
export declare const createYaml: (data: any, filePath: string) => void;
/**
 * Load yaml file
 * @param {string} filePath The file path to write the YAML file
 * @returns {*} yaml content in object
 */
export declare const loadYaml: (filePath: string) => unknown;
