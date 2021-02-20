export default function encodeName(name) {
  let formattedName = name;

  if (typeof name === "string" && name.includes('"')) {
    /**
     * Unicode Hex notation was used to avoid double quotes in SQL.
     * On some android devices when we use the escape it sets the value twice.
     * 
     * Ex:
     *   input:  'I know, "You Rock"'.replace(/"/, '\\"')
     *   output: 'I know, \\"You Rock\\"'
     * 
     * Due to this problem, \x22\x22 ("") was used as an escape.
     * 
     * Ex: 
     *   input:  'I know, "You Rock"'.replace(/"/, '\x22\x22')
     *   output: 'I know, ""You Rock""'
     * 
     * This is not the most correct way, however, it works at this moment.
     * 
     * Obs: Please don't try to reproduce these examples in a browser, because 
     * the browser and the Android device (consider old devices) are totally
     * different.
     */
    formattedName = name.replace(/"/g, "\x22\x22");
  }

  return `"${formattedName}"`;
}
