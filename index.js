const readline = require('readline');
var mysql = require('mysql');
let execShellCommand = require("./utils");

init();

let appName = "wordpress";

async function init() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Wordpress name? ', async function (answer = appName) {
        appName = answer;

        const depsCheck = await checkDependencies();
        await installDependencies(depsCheck);
        await setupDatabase();
        await downloadWordpress();
        await installWordpress();

        rl.close();
    });
}

async function checkDependencies() {
    let deps = {};
    deps.hasNginx = await execShellCommand("which nginx") === null;
    deps.hasPHP = await execShellCommand("which php") === null;
    deps.hasMySQL = await execShellCommand("which mysql") === null;
    deps.hasWP = await execShellCommand("which wp") === null;
    deps.hasRolldice = await execShellCommand("which rolldice") === null;

    console.log("Installed dependencies", deps);
    return deps;
}

async function installDependencies(deps) {
    let installed = {};
    if (!deps.hasNginx) installed.nginx = await execShellCommand("apt-get install nginx") === null;
    if (!deps.hasPHP) installed.php = await execShellCommand("apt-get install php7.2") === null;
    if (!deps.hasMySQL) installed.mysql = await execShellCommand("apt-get install mysql") === null;
    if (!deps.hasWP) installed.wp = await execShellCommand("curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && php wp-cli.phar --info && chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp") === null;
    if (!deps.hasRolldice) installed.rolldice = await execShellCommand("sudo apt-get install rolldice") === null;

    console.log(`Installed ${Object.keys(installed).length} dependencies. [${Object.keys(installed).join(", ")}]`);
}

async function downloadWordpress() {
    const download = await execShellCommand(`sudo wp core download --path=/var/www/${appName} --allow-root`)
    console.log("Download Wordpress", download);
}

async function installWordpress() {
    const config = await execShellCommand(`sudo wp config --allow-root create --path=/var/www/${appName} --dbname='${appName}' --dbuser='${appName}user' --dbpass='${"super123"}'`);
    console.log("Install Wordpress /Config", config);
    const install = await execShellCommand(`wp core install --url='super.io' --path=/var/www/${appName} --title='${appName}' --admin_user='admin' --admin_password='super123' --path='/var/www/${appName}/' --admin_email='mike.eling97@gmail.com'`);
    console.log("Install Wordpress /Install", install);
}

function setupDatabase() {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Hektoplazma420'
        });

        connection.connect();

        connection.query(`CREATE DATABASE ${appName}`, function (error, results, fields) {
            if (error) throw error;
            //console.log('CREATE DATABASE Result: ', results);

            connection.query(`CREATE USER ${appName}user@localhost IDENTIFIED BY 'super123'`, function (error, results, fields) {
                if (error) throw error;
                //console.log('CREATE USER Result: ', results);
            });

            connection.query(`GRANT ALL PRIVILEGES ON ${appName}.* TO ${appName}user@localhost`, function (error, results, fields) {
                if (error) throw error;
                //console.log('GRANT Result: ', results);
            });

            connection.query(`FLUSH PRIVILEGES`, function (error, results, fields) {
                if (error) throw error;
                //console.log('FLUSH Result: ', results);
                console.log("Database created.")
                connection.end();
                resolve();
            });
        });


    });
}