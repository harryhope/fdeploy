#!/usr/bin/env node
const { Lambda } = require('@aws-sdk/client-lambda')
const AdmZip = require('adm-zip')
const dotenv = require('dotenv')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const deploy = async (funcName, dir, region) => {
  const folder = path.resolve(dir || process.cwd())
  const envPath = path.resolve(dir || process.cwd(), '.env')

  dotenv.config({ path: envPath })
  
  const ora = await import('ora')
  const chalk = (await import ('chalk')).default
  const spinner = ora.default('Zipping folder').start()
  
  if (!funcName || !folder) {
    throw new Error('You must provide the function name and folder to zip')
  }
  
  const zip = new AdmZip()
  zip.addLocalFolder(folder)
  
  zip.toBuffer(buffer => {
    spinner.text = 'Uploading to Lambda'
    const lambda = new Lambda({
      region,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      }
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
