# Github-Bucket
ab
> A GitHub App built with [Probot](https://github.com/probot/probot) that Github&#x27;s Bot in bucket :D

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t Github-Bucket .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> Github-Bucket
```

## Contributing

If you have suggestions for how Github-Bucket could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 xhyrom <generalkubo@gmail.com>
