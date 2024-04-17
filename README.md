# fdeploy
A simple CLI-tool for deploying Lambdas.

## Usage
```
fdeploy <command>

Commands:
  fdeploy lambda  Deploy a lambda function to AWS                   [aliases: l]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

To use `fdeploy`, open a terminal window in your Lambda function's folder.

`fdeploy` uses [dotenv](https://www.dotenv.org) to read AWS keys from your project's folder. By default it will read `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` environment variables. They must corrispond to an IAM key that has Lambda deployment access.

A simple deployment command may look like:
```
fdeploy lambda -n your-lambda-name
```

Running this command from a folder containing your Lambda's code will zip and upload the file to AWS and deploy it as a Lambda function named `your-lambda-name`.