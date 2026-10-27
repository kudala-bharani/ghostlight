# Upload this prepared source

The public repository exists at https://github.com/kudala-bharani/ghostlight but is currently empty. The application is not live yet.

1. Extract `Ghostlight_Week4_Source.zip`. Open its inner `ghostlight` folder.
2. On a Mac, press Command–Shift–period in Finder to show hidden items. Select the **contents** of the folder, including `.github` and `.gitignore`, not the outer `ghostlight` folder.
3. Open https://github.com/kudala-bharani/ghostlight/upload . Drag the selected files and folders into the upload area. Verify `.github/workflows/pages.yml`, `package.json`, `src/main.js` and `index.html` are at their expected paths. Commit to `main`.
4. Open repository **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**. This is the public-repository free Pages setup; do not choose a paid plan.
5. In **Actions**, open **Deploy Ghostlight to Pages**. If the first run failed because Pages was not enabled yet, rerun it; otherwise use **Run workflow** on `main`. Wait for both build and deploy jobs to succeed.
6. Return with the successful run link or let the assistant verify it. The expected demo address is `https://kudala-bharani.github.io/ghostlight/`, but it is not confirmed live until deployment succeeds.

Do not upload `node_modules`, model weights, tokens, or a `.env` file. None are in this ZIP. If the browser cannot preserve the hidden `.github` workflow folder, use a normal authenticated local Git push instead, or ask for help; do not silently omit it.

The MIT license is owner-approved. DEV contest submission is separate and has not been performed. Browser/model testing still needs the reachable demo.
