# Customer web deployment

This workflow belongs to `Barwaqt/customer_web`. Pushes to `main` run ESLint, auth proxy regression tests and a production Next.js build, then deploy to `/var/www/barwaqt.com`. Pull requests only run CI. Manual runs on main also deploy. No VPS `git pull` is needed.

## Ubuntu setup

Use the SSH user that owns the existing web PM2 process. As an administrator, install `rsync`, `curl` and `util-linux` (for flock). The deployment user needs write access to `/var/www` for the temporary build directory and to `/var/www/barwaqt.com`. It needs Node 24, npm and PM2; NVM installations are supported with `nvm use 24`.

The configured default process is `barwaqt-customer`, currently owned by `root`. It must run `npm start` from `/var/www/barwaqt.com` and listen on the port configured in Nginx. Verify its configuration with `pm2 describe PROCESS_NAME`. This pipeline restarts an existing process and does not create one or change Nginx.

Keep production settings in `/var/www/barwaqt.com/.env.local` (or the existing production env file):

```dotenv
API_URL=https://api.barwaqt.com/api/v1
```

Builds run in a temporary directory using copies of the VPS `.env`, `.env.local`, `.env.production` and `.env.production.local`. Next.js applies its normal precedence. Production env files remain on the VPS. Existing PM2 environment values take precedence; update those separately if needed. The VPS needs outbound access to npm and Google Fonts for the build.

## GitHub configuration

In the customer_web repository, create **Settings → Environments → production**. Configure these **environment secrets**, not variables. Backend repository secrets are not automatically shared with this repository.

| Secret | Value |
| --- | --- |
| DEPLOY_HOST | VPS public IP or SSH hostname |
| DEPLOY_USER | Owner of the existing web PM2 process |
| DEPLOY_SSH_KEY | Complete private deployment key, with line breaks |
| DEPLOY_KNOWN_HOSTS | Verified known_hosts entry matching the VPS host and SSH port |

Authorize the corresponding public SSH key in the deployment user's `~/.ssh/authorized_keys`. You may use the already configured deployment key for this same VPS account. Do not commit keys or env files.

Add these **environment variables**:

| Variable | Value |
| --- | --- |
| PM2_APP_NAME | Default `barwaqt-customer`; override only if the process name changes |
| WEB_PORT | Existing web listening port, default 3000 |
| DEPLOY_PORT | SSH port, default 22 |

Restrict production deployment branches to main. Required environment reviewers or wait timers pause deployment; leave them disabled if unattended deployment is intended. Configure branch protection to require the test job before merging.

## Verify and recover

Push these files to main and check **Actions → Web CI and deployment**. Both test and deploy must pass. The pipeline installs dependencies and builds before copying files, restarts the selected PM2 process, checks the local website, then checks `https://barwaqt.com/`. It records the successful local deployment commit in `/var/www/barwaqt.com/.deployed-revision` and then moves the server's Git checkout to that revision, so `git log` and `git status` on the VPS report what is running and no server-side `git pull` is needed. The sync is best effort: a directory that is not a Git checkout is left alone, and a failed fetch only warns.

This is an in-place deployment with brief restart downtime and no automatic rollback. `rsync` deletes nothing, and the checkout sync afterwards removes only tracked files that the new revision no longer contains; production env files, the uploads directory and other untracked runtime data are never deleted, so keep custom runtime data outside tracked source paths. Removed dependencies under `node_modules` can remain; review that separately. Existing files with matching source paths are updated. On failure inspect the Actions job and `pm2 logs PROCESS_NAME --lines 80 --nostream`. Revert the faulty commit on main and push to deploy a corrected revision. The backend and database are not modified by this workflow.

## Public request origin

Production requests are checked against `https://barwaqt.com` for CSRF protection, independently of the internal Nginx URL. For another deployment hostname, set `APP_ORIGIN` to its exact public origin in the frontend production environment file and rebuild/restart. For example, a customer staging deployment uses `APP_ORIGIN=https://stagging.barwaqt.com`. Missing and foreign Origin headers on mutations remain rejected.
