# Documentation
https://community-scripts.github.io/ProxmoxVE/scripts?id=homepage&category=Dashboards+%26+Frontends
https://technotim.com/posts/homepage-dashboard/

# Files
.env file is unser "/opt/homepage/"
Config file is under "/opt/homepage/config/"

# Initial setup (on the LXC console)
This repo IS `/opt/homepage/config` - clone it directly in place instead of editing the
generated files by hand.

```bash
cd /opt/homepage
mv config config.bak                                 # keep the generated files as a fallback
git clone https://github.com/Pewtas/homelab-homepage.git config
diff -rq config.bak config                            # sanity check, then remove config.bak
```

`.env` lives one level up at `/opt/homepage/.env` and is NOT part of this clone - it holds real
secrets and is maintained only on the container. This repo's `.env.example` documents the
variable names only; fill in the real values on the container by hand:

```bash
nano /opt/homepage/.env
```

# Config updates
Edit the yaml files locally, commit, push, then on the LXC console:

```bash
cd /opt/homepage/config && git pull
```

Homepage watches `config/` and hot-reloads most changes automatically. If a change adds a new
`HOMEPAGE_VAR_*` variable to `.env.example`, add it to `/opt/homepage/.env` and restart the service
new env var is picked up:

```bash
systemctl restart homepage   # or `docker restart homepage` if it runs containerized inside the LXC
```

# Container image updates
To update the homepage container image itself, log in to proxmox and start the LXC container shell
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/homepage.sh)"
```

# UNAS read-only user (for the `unifi_drive` widget)
The UNAS tile in `services.yaml` uses the `unifi_drive` widget to poll storage stats
(`total`, `used`, `available`, `status`). It authenticates with
`HOMEPAGE_VAR_UNAS_USERNAME` / `HOMEPAGE_VAR_UNAS_PASSWORD`, which must be a dedicated,
least-privilege account on the UNAS itself, not a personal admin account. Steps to create it:

1. Open the UNAS's own UniFi OS console on the LAN (e.g. `https://unas.home`), logged in
   locally - not via the `unifi.ui.com` cloud portal. Creating the account from the local
   console is what lets it be scoped as local-only in the next step.
2. Go to **Settings > Admins** (People) **> Add Admin / Create New User**.
3. Turn **Remote Access off** so the account is local-only:
   - it lives only on this UNAS, not tied to a Ubiquiti cloud/SSO identity
   - a leaked credential can't be used to sign in to `unifi.ui.com` or any other console
   - local accounts don't support MFA, so this is a real tradeoff - keep the password long,
     random, and unique to this account (a password manager-generated one, not reused
     anywhere else)
4. Set a username and password - these are what go into `.env` in step 6.
5. Under per-application permissions, set the storage/drive application to **View Only** (if possible, else full-access) and
   every other application (Network, Protect, Access, etc.) to **None**. View Only can read
   status but cannot change configuration or delete data.
6. Create the user, then on the homepage container fill in the real values (this repo's
   `.env.example` only documents the variable names, see above):
   ```bash
   nano /opt/homepage/.env
   # HOMEPAGE_VAR_UNAS_USERNAME=...
   # HOMEPAGE_VAR_UNAS_PASSWORD=...
   systemctl restart homepage   # or `docker restart homepage`
   ```
7. Confirm the UNAS tile on the dashboard shows total/used/available/status with no API error.
   If it shows a stale/incorrect value after fixing bad credentials, restart the homepage
   service/container again to clear its cache.

# Read User for the Proxmox Backup Server
Run the commands below on the pbs VM
```bash
# dedicated user in the PBS realm (no password needed for token-only use)
proxmox-backup-manager user create homepage@pbs

# create the token; the secret is printed ONCE, so copy it now
proxmox-backup-manager user generate-token homepage@pbs homepage

# Audit on / for both the user and the token
proxmox-backup-manager acl update / Audit --auth-id homepage@pbs
proxmox-backup-manager acl update / Audit --auth-id 'homepage@pbs!homepage'
```

```yaml
# Add this to the services.yaml and add the secrets to the /opt/homepage/.env then restart
 - Proxmox Backup Server:
     icon: proxmox.png
     href: https://pbs.home:8007
     description: Backups
     widget:
       type: proxmoxbackupserver
       url: https://pbs.home:8007
       username: homepage@pbs!homepage        # full token ID
       password: "{{HOMEPAGE_VAR_PROXMOXBACKUPSERVER_TOKEN}}" # token secret
       datastore: main                        # optional
       fields: ["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]
```
