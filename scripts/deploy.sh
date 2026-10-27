#!/usr/bin/env bash
set -euo pipefail
umask 022
archive=${1:?Expected deployment archive}
app_name=${2:?Expected existing web PM2 process name}
port=${3:?Expected web port}
revision=${4:?Expected Git revision}
app_dir=/var/www/barwaqt.com
[[ "$app_name" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]]
[[ "$port" =~ ^[0-9]+$ ]] && ((port >= 1 && port <= 65535))
[[ "$revision" =~ ^[0-9a-f]{40}$ ]]
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 24
fi
for tool in node npm pm2 rsync curl flock; do
  command -v "$tool" >/dev/null || { echo "Missing prerequisite: $tool" >&2; exit 1; }
done
[[ -d "$app_dir" ]]
pm2 describe "$app_name" >/dev/null
# Bring the server's Git checkout to the revision that was just deployed, so the
# deployment account never needs a manual `git pull` and `git log`/`git status`
# report what is actually running. Best effort: the release is already live and
# healthy, so a failed fetch warns instead of failing the deployment.
sync_git_checkout() {
  [[ -n "${revision:-}" ]] || return 0
  git -C "$app_dir" rev-parse --git-dir >/dev/null 2>&1 || return 0
  if ! GIT_TERMINAL_PROMPT=0 timeout 60 git -C "$app_dir" \
    fetch --quiet --prune origin </dev/null; then
    echo "Warning: cannot fetch origin; Git checkout left unsynced." >&2
    return 0
  fi
  if git -C "$app_dir" reset --hard --quiet "$revision" </dev/null; then
    echo "Git checkout synced to $revision"
  else
    echo "Warning: cannot move the Git checkout to $revision." >&2
  fi
  return 0
}
exec 9>"$app_dir/.deploy.lock"
flock -w 600 9
stage=$(mktemp -d /var/www/.barwaqt-web-build.XXXXXXXX)
trap 'rm -rf "$stage"; rm -f "$archive"' EXIT
tar -xzf "$archive" -C "$stage"
for env_file in .env .env.local .env.production .env.production.local; do
  if [[ -f "$app_dir/$env_file" ]]; then
    cp "$app_dir/$env_file" "$stage/$env_file"
    chmod 600 "$stage/$env_file"
  fi
done
cd "$stage"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PUBLIC_DEPLOY_REVISION="$revision"
# Install build-time tooling even when the SSH environment sets NODE_ENV=production.
npm ci --include=dev
NODE_ENV=production npm run build
# Only change the running app after the production build succeeds.
# Retain destination-only assets and runtime files, including production .env files.
rsync -ac \
  --exclude='.git/' --exclude='.env' --exclude='.env.*' \
  --exclude='.deploy.lock' --exclude='uploads/' --exclude='.next/' \
  "$stage/" "$app_dir/"
# Remove obsolete compiled routes/manifests while preserving immutable static assets
# that browsers from the previous release may still request.
rsync -ac --delete --exclude='static/' "$stage/.next/" "$app_dir/.next/"
rsync -ac "$stage/.next/static/" "$app_dir/.next/static/"
cd "$app_dir"
export PM2_APP_NAME="$app_name" WEB_PORT="$port"
pm2 startOrRestart ecosystem.config.cjs --only "$app_name" --update-env
for attempt in {1..12}; do
  served_revision=$(curl --fail --silent --show-error --max-time 10 "http://127.0.0.1:$port/api/deployment?expected=$revision" || true)
  if [[ "$served_revision" == "$revision" ]] && curl --fail --silent --output /dev/null --max-time 10 "http://127.0.0.1:$port/"; then
    printf '%s\n' "$revision" > .deployed-revision
    sync_git_checkout
    pm2 save
    echo "Web deployment complete: $revision"
    exit 0
  fi
  sleep 5
done
echo "Web health check failed. Inspect: pm2 logs $app_name --lines 80 --nostream" >&2
exit 1
