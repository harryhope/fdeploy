const aws = require('aws-sdk')
const ora = require('ora')
const chalk = require('chalk')
const AdmZip = require('adm-zip')
const dotenv = require('dotenv')
const path = require('path')

const deploy = (funcName, dir, region) => {
  const folder = path.resolve(dir || process.cwd())
  const envPath = path.resolve(dir || process.cwd(), '.env')

  dotenv.config({ path: envPath })
  
  const spinner = ora('Zipping folder').start()
  
  if (!funcName || !folder) {
    throw new Error('You must provide the function name and folder to zip')
  }
  
  const zip = new AdmZip()
  zip.addLocalFolder(folder)
  
  zip.toBuffer(buffer => {
    spinner.text = 'Uploading to Lambda'
    const lambda = new aws.Lambda({
      region,
      apiVersion: '2015-03-31',
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    })
    
    const params = {
      FunctionName: funcName,
      Publish: true,
      ZipFile: buffer
    }
    
    lambda.updateFunctionCode(params, (err, data) => {
      spinner.stop()
      if (err) {
        console.error(err)
        console.log()
        console.log(chalk.bgRed.bold(`Failed to deploy ${funcName}`))
      } else {
        console.log(data)
        console.log()
        console.log(chalk.bgGreen.bold(`${funcName} deployed successfully`))
        console.log()
      }
    })
  })
}




yargs(hideBin(process.argv))
  .command(
    ['lambda', 'l'], 
    'Deploy a lambda function to AWS',
    {
      directory: {
        alias: 'd',
        describe: 'The directory to zip and deploy'
      },
      name: {
        alias: 'n',
        describe: 'The name of the lambda function'
      },
      region: {
        alias: 'r',
        describe: 'The AWS region to deploy the lambda to',
        default: 'us-east-1'
      }
    },
    argv => { deploy(argv.name, argv.directory, argv.region)}
  )
  .help()
  .demandCommand(1, 'Enter a command from the list above')
  .parse()
