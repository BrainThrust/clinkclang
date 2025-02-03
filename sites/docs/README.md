# sites/docs

## Purpose

This is the documentation site for the [Clinkclang](https://clinkclang.com) library.

## Writing documentation

The documentation is written in [Markdown](https://www.markdownguide.org/) and is located in the `sites/docs/src/content` directory.

### Writing new pages

To write new pages, create a new file in the `sites/docs/src/content` directory. The file name should be the slug of the page, and the file should have the `.md` extension. If components are needed, use the `.svx` extension. 

Best practice is found in [example.svx](src/content/example.svx) and [example.md](src/content/example.md).

## Developing

```bash
pnpm install
pnpm run dev
# or start the server and open the app in a new browser tab
pnpm run dev -- --open

# Manually compile the paraglide messages
pnpm run compile
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.