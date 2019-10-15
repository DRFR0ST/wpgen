module.exports = 
/**
* Executes a shell command and return it as a Promise.
* @param cmd {string}
* @return {Promise<string>}
*/
function execShellCommand(cmd) {
   const exec = require('child_process').exec;
   return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
     resolve(/*stdout? stdout : stderr,*/ error);
    });
   });
  };