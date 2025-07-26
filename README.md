This is a nice [Next.js](https://nextjs.org) project backed by [PocketBase](https://pocketbase.io/).

## Project installation

### PocketBase setup

- Download the pocketbase binary from [here](https://github.com/pocketbase/pocketbase/releases/tag/v0.22.21)
- Unzip the downloaded file and place the binary in the project root directory (named as `pocketbase`)

### Project setup
- Run the following command to install the project dependencies
```bash
npm install
```
- Create the `.env.local` file with the required environment variables from the [env.js](./app/lib/env.js)
```bash
OPENAI_API_KEY=sk....
...
...
```

## Starting the project

First, run the development server:

```bash
pocketbase serve
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Learn More NextJS

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

## Learn More PocketBase

To learn more about PocketBase, take a look at the following resources:
- [PocketBase Documentation](https://pocketbase.io/docs) - learn about PocketBase features and API.
