# Doku
https://community-scripts.github.io/ProxmoxVE/scripts?id=homepage&category=Dashboards+%26+Frontends
https://technotim.com/posts/homepage-dashboard/

# Files
.env file is unser "/opt/homepage/"
Config file is under "/opt/homepage/config/"

# Updates
To update the container image, log in to proxmox and start the LXC container shell
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/homepage.sh)"
```