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

```bash
cd /opt/homepage
mv config config.bak                                 # keep the generated files as a fallba
git clone https://github.com/Pewtas/homelab-homepage.git config
diff -rq config.bak config                            # sanity check, then remove config.ba
```

`.env` lives one level up at `/opt/homepage/.env` and is NOT part of this clone - it holds real
secrets and is maintained only on the container. This repo's `.env` is documentation of the
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
`HOMEPAGE_VAR_*` variable to `.env`, add it to `/opt/homepage/.env` and restart the service
new env var is picked up:

```bash
systemctl restart homepage   # or `docker restart homepage` if it runs containerized inside the LXC
```

# Container image updates
To update the homepage container image itself, log in to proxmox and start the LXC container shell
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/homepage.sh)"
```