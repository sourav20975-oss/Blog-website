## Linux Shell and File Basics

```bash
pwd
ls -la
cd folder
cd ..
cd ~
mkdir project
touch file.txt
cp file.txt backup.txt
mv old.txt new.txt
rm file.txt
rm -r folder
```

> Remember: `/` is the filesystem root directory. `/root` is the root user's home directory — two different things!

### The Linux Filesystem Map

Knowing where things live is half of Linux:

```
/
├── bin        essential binaries (ls, cp, cat)
├── etc        configuration files (nginx, ssh, hosts, passwd)
├── home       regular users' home dirs (/home/sourav)
├── root       root user's home
├── var        variable data (logs in /var/log, www in /var/www)
├── tmp        temporary files (cleared on reboot)
├── usr        installed software / user programs
└── proc       virtual kernel/process info (/proc/cpuinfo)
```

---

## Reading & Searching Files

```bash
cat file.txt
less file.txt
head -n 20 file.txt
tail -f server.log
grep "error" server.log
grep -i "error" server.log     # case-insensitive
grep -n "error" server.log     # show line numbers
grep -r "MongoDB" .            # recursive search in folder
find . -name "*.js"
find . -type f
find . -type d
```

`tail -f` is the daily driver for watching logs while an app runs.

---

## Pipes, Redirection & Chaining

```bash
ls -la | grep ".js"
echo "hello" > file.txt        # overwrite
echo "new line" >> file.txt    # append
mkdir app && cd app            # run next only after success
npm test || echo "test failed" # run next after failure
pwd; ls                        # run both regardless
```

| Symbol | Meaning |
| --- | --- |
| `\|` | pipe output of one command into another |
| `>` | overwrite file with output |
| `>>` | append output to file |
| `&&` | run next only after success |
| `\|\|` | run next only after failure |
| `;` | run next regardless |

### Exit Codes and stderr

Every command returns an exit code: `0` = success, non-zero = failure.

```bash
echo $?                # check last command's exit code

node app.js 2> error.log   # redirect only errors
node app.js > out.log 2>&1 # capture both stdout and stderr
```

`2>` redirects stderr (file descriptor 2), which is where most error messages actually go — this is why `> log.txt` alone often still leaves your terminal full of red text.

---

## Bash Variables & Loops

```bash
name="Sourav"
echo "$name"

for i in {1..10}; do
  echo $i
done

# One line version
for i in {1..10}; do echo $i; done
```

> Note: Bash syntax such as `for i in {1..1000}; do ... done` should be run in Bash/WSL, not directly at a PowerShell prompt.

### Environment Variables and PATH

```bash
export PORT=5000          # set for current session
echo $PORT
printenv | grep PORT      # view env vars

echo $PATH                # where shell looks for executables
which node                # full path of a command's binary
```

---

## Users & Groups

```bash
whoami
sudo useradd sourav
sudo userdel sourav
sudo userdel -r sourav         # remove with home directory

sudo groupadd developers
sudo groupdel developers
sudo gpasswd -a sourav developers           # add one user
sudo gpasswd -M sourav,rahul developers     # replace member list!
getent group developers                     # verify members

su sourav        # switch user
su -             # become root with login environment
```

> `gpasswd -M` sets the group's entire member list. `gpasswd -a` is generally safer when simply adding one user.

---

## Linux Permissions

```bash
ls -l
```

Permission values:

```
r = 4
w = 2
x = 1

chmod 755 script.sh    # rwxr-xr-x
chmod 644 file.txt     # rw-r--r--
chmod +x script.sh     # add execute for all

chown sourav file.txt
chown sourav:developers file.txt
chown -R sourav:developers folder
chgrp developers file.txt
umask                  # default permissions for new files
```

Directory rule: creating an entry inside a directory normally requires write + execute (`w+x`) on the parent directory.

### Special Permission Bits

Special bits appear in place of execute positions:

```
drwsr-sr-t
 ^^^  ^^^  ^^^
owner group others

rws = read + write + setuid + execute
r-s = read + setgid + execute
r-t = read + sticky bit + execute
```

- **setuid (s on owner)** — program runs with owner's rights (e.g., `passwd`)
- **setgid (s on group)** — new files inherit the group
- **sticky bit (t)** — only the owner can delete their files (e.g., `/tmp`)

---

## Compression: zip and tar

```bash
# zip
zip myfiles.zip file1.txt file2.txt
zip -r project.zip project/
unzip myfiles.zip
unzip myfiles.zip -d extracted/

# tar.gz — the standard on Linux servers
tar -czvf archive.tar.gz folder/      # create
tar -xzvf archive.tar.gz              # extract
tar -tzvf archive.tar.gz              # list contents
```

Flags memory trick for tar: **c**reate, e**x**tract, **t**list, **z**=gzip, **v**=verbose, **f**=file.

---

## Processes & System Info

```bash
ps
ps aux
ps aux | grep node
top
kill PID
kill -9 PID        # force kill (SIGKILL)

whoami
uname -a
hostname
date
df -h              # disk space by filesystem
du -sh .           # size of current folder
```

---

## Ubuntu / Debian Packages

```bash
apt update
apt install -y <package>
apt upgrade
apt remove <package>
```

Important package names from practice:

| Command | Package |
| --- | --- |
| `ifconfig` | net-tools |
| `nslookup` | dnsutils |
| `mtr` | mtr |

```bash
apt update && apt install -y net-tools dnsutils mtr traceroute
```

---

## WSL (Windows Subsystem for Linux)

```powershell
wsl --status
wsl -l -v
wsl
```

Inside WSL:

```bash
uname -a
cat /etc/os-release
```

WSL 2 uses real virtualization and is commonly used together with Docker Desktop on Windows.

---

## Docker Commands Refresher

```bash
docker --version
docker ps
docker ps -a
docker images
docker logs <container>
docker logs -f <container>
docker exec -it <container> bash
docker compose up -d
docker compose down
docker compose up --build
docker compose logs -f backend
```

---

# Linux Networking Commands

Use this section for network interface, IP, routing, DNS, connectivity, ports, HTTP and troubleshooting revision.

---

## IP & Network Interfaces

```bash
ip a                    # interfaces + IP addresses
ip addr                 # same as ip a
ip link                 # interfaces only (state, MAC)
ip route                # routing table
ip route get 8.8.8.8    # which route/interface reaches this IP

# Legacy alternative
ifconfig
```

Modern preference: use `ip a` instead of `ifconfig`. If `ifconfig` is required in a minimal Debian/Ubuntu container, install `net-tools`.

---

## Ping — Reachability & Latency

```bash
ping google.com
ping -c 4 google.com
```

Ping checks reachability and round-trip latency. Stop a continuous ping with `Ctrl+C`.

---

## DNS: nslookup & dig

```bash
nslookup placementor.online
dig placementor.online
dig A placementor.online
dig MX example.com
dig +short placementor.online    # just the answer
```

DNS resolves domain names and also provides records such as A, AAAA, MX, CNAME and TXT.

| Record | Purpose |
| --- | --- |
| A | domain → IPv4 address |
| AAAA | domain → IPv6 address |
| CNAME | alias to another domain |
| MX | mail servers |
| TXT | free-form text (SPF, verification keys) |

---

## The /etc/hosts File

Before asking DNS, Linux checks `/etc/hosts` — perfect for local testing:

```
127.0.0.1    localhost
192.168.1.50 myapp.local
```

Docker's container-name DNS works similarly at the network level: service names resolve before public DNS ever gets involved.

---

## traceroute, tracepath & mtr

```bash
traceroute placementor.online
tracepath placementor.online
mtr placementor.online
mtr -r -c 10 placementor.online    # report mode, 10 cycles
```

`mtr` combines traceroute-style hop information with repeated latency/loss measurements.

MTR columns explained:

- **Loss%** = packet loss per hop
- **Last** = latest latency
- **Avg** = average latency
- **Best / Wrst** = minimum / maximum seen

---

## Ports & Listening Services

```bash
ss -tulpn               # all listening TCP+UDP with process names
ss -ltnp                # TCP only
ss -lunp                # UDP only
ss -tulpn | grep 5000

# Legacy
netstat -tulpn
```

Common development/service ports:

| Port | Service |
| --- | --- |
| 3000 | React/Next.js |
| 5173 | Vite dev server |
| 5000 | Node/Express |
| 27017 | MongoDB |
| 6379 | Redis |
| 5672 | RabbitMQ AMQP |
| 15672 | RabbitMQ management UI |
| 5432 | PostgreSQL |

---

## curl — HTTP/API Testing

```bash
# GET
curl https://example.com

# Headers only
curl -I https://example.com

# Status code
curl -sS -o /dev/null -w "%{http_code}\n" https://example.com

# Request time
curl -sS -o /dev/null -w "%{time_total}\n" https://example.com

# POST JSON
curl -X POST "https://example.com/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sourav"}'
```

Meaning: `-sS` keeps output quiet but still reports errors; `-o /dev/null` discards the response body; `-w` prints selected metrics.

### curl + Bash Loop

```bash
for i in {1..10}; do
  curl -sS -o /dev/null -w "Request $i: %{http_code} %{time_total}s\n" "https://example.com"
done
```

Useful for basic repeated testing of your own application. For serious load/performance testing, use a dedicated load-testing tool.

### HTTP Status Codes Worth Memorizing

| Code | Meaning | Typical cause |
| --- | --- | --- |
| 200 | OK | normal success |
| 201 | Created | successful POST |
| 301/302 | Redirect | moved permanently/temporarily |
| 400 | Bad Request | invalid input from client |
| 401 | Unauthorized | not logged in / bad token |
| 403 | Forbidden | logged in, but no permission |
| 404 | Not Found | wrong URL or missing resource |
| 429 | Too Many Requests | rate limiting |
| 500 | Internal Server Error | bug in server code |
| 502/504 | Bad Gateway / Timeout | reverse proxy can't reach app (very common on Render/deployments!) |

When a deployed site shows 502/504, your app process usually crashed or never started — check deployment logs first.

---

## Services with systemd

On Ubuntu servers, long-running apps are managed by systemd:

```bash
systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl enable app     # start on boot
journalctl -u app -f          # follow service logs
```

If you deploy on a VPS someday, `systemctl status` + `journalctl -u <service> -f` will be your best friends.

---

## Cron Jobs (Scheduled Tasks)

The project's cron workers do exactly what crontab does on Linux:

```bash
crontab -e          # edit current user's schedule
crontab -l          # list schedules
```

Syntax:

```
* * * * *  command
│ │ │ │ │
│ │ │ │ └─ day of week (0-7, 0=Sunday)
│ │ │ └─── month (1-12)
│ │ └───── day of month (1-31)
│ └─────── hour (0-23)
└───────── minute (0-59)
```

Examples:

```
*/5 * * * *  curl -s https://mysite.com/api/health > /dev/null
0 3 * * *    /home/sourav/backup.sh
```

First line = every 5 minutes; second = daily at 03:00.

---

## SSH — Connecting to Servers

Daily-driver commands for any cloud VM/VPS:

```bash
ssh sourav@192.168.1.20                  # connect
ssh -i ~/.ssh/mykey.pem ubuntu@server    # connect with a key

# create a key pair
ssh-keygen -t ed25519 -C "sourav@laptop"
ssh-copy-id sourav@server                # passwordless login afterwards

# copy files over SSH
scp file.txt sourav@server:/home/sourav/
scp -r project/ sourav@server:/var/www/
```

Render handles deploys for us, but the moment you touch a raw VPS, these are mandatory skills.

---

## Network Troubleshooting Order

Work top-down to isolate the failing layer:

```
1. Interface / IP        → ip a
2. Routing               → ip route
3. Connectivity          → ping <host>
4. DNS                   → nslookup <domain>, dig <domain>
5. Path / hops           → traceroute <domain>, mtr <domain>
6. Port / service        → ss -tulpn, curl -I https://<domain>
7. Application logs      → docker logs <container>
```

This order helps isolate whether the problem is local networking, routing, DNS, packet path, port/service, HTTP/TLS, or the application itself.

---

## Practical Example — Diagnosing a Site

```bash
# 1. DNS
nslookup placementor.online

# 2. HTTP headers
curl -I https://placementor.online

# 3. HTTP status + response time
curl -sS -o /dev/null -w "HTTP %{http_code} | %{time_total}s\n" https://placementor.online

# 4. Network path
mtr -r -c 10 placementor.online
```

---

## Networking Concepts to Remember

- **IP** — identifies a host/interface
- **Gateway** — router used to reach other networks
- **DNS** — maps names to IPs/other records
- **Port** — identifies a service on a host
- **TCP** — connection-oriented transport (web, DB connections)
- **UDP** — connectionless transport (DNS queries, video calls)
- **Latency** — round-trip/network delay
- **Packet loss** — packets that fail to reach/return

---

## Quick Interview Revision

**What does `ip a` do?** → Shows interfaces and IP addresses.

**ping vs traceroute?** → ping tests reachability/latency; traceroute shows network hops.

**What is mtr?** → Route + repeated latency + packet-loss diagnostics.

**nslookup vs dig?** → Both query DNS; dig is more detailed.

**How to check listening ports?** → `ss -tulpn`

**How to test an HTTP API?** → `curl`

**How to check port 5000?** → `ss -tulpn | grep 5000`

**How to watch Docker logs?** → `docker logs -f <container>`

**How to check current user?** → `whoami`

**What does chmod 755 mean?** → Owner rwx (7), group rx (5), others rx (5).

**Difference between 401 and 403?** → 401 = not authenticated; 403 = authenticated but not allowed.

**Where does Linux look up names before DNS?** → `/etc/hosts`.

**What exit code means success?** → `0`; anything else is an error.

---

## Must-Memorize Cheat Sheet

```bash
# Linux
pwd
ls -la
cd
mkdir
touch
cp
mv
rm
cat
less
head
tail -f
grep
find
chmod
chown
chgrp
ps aux
kill
df -h
du -sh
whoami

# Bash
for i in {1..10}; do echo $i; done
command1 | grep text
command1 && command2
echo text > file.txt
echo text >> file.txt

# Networking
ip a
ip route
ping google.com
nslookup placementor.online
dig placementor.online
traceroute placementor.online
mtr placementor.online
ss -tulpn
curl -I https://placementor.online

# Docker
docker ps
docker logs -f <container>
docker exec -it <container> bash
docker compose up -d
docker compose down
```

---

## Final Mental Model

```
LINUX
Files → Permissions → Users/Groups → Processes → Packages → Services → Logs

NETWORKING
Interface/IP → Route → DNS → Connectivity → Hops → Port → HTTP/TLS → Application

TROUBLESHOOTING
ip a → ip route → ping → DNS → mtr/traceroute → ss → curl → logs
```

> Safety: avoid dangerous commands such as `rm -rf` and `chmod 777 /` on real systems. Use a disposable Docker container for permission experiments.

---

## Conclusion

In this tutorial we covered Linux end-to-end: the shell, files, pipes, permissions, users, processes, packages, WSL, plus complete networking — interfaces, DNS, routing diagnostics, ports, curl, systemd, cron and SSH. Combined with the troubleshooting order, you can now systematically debug almost any "server not working" situation instead of guessing.
