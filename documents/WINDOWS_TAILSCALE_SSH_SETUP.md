# Windows + Tailscale + SSH 免密配置

## 目标

让 Linux 服务器可以在无人值守情况下，把数据库备份自动传到你的 Windows 电脑：

- 目标电脑 Tailscale IP：`100.78.235.109`
- 目标目录：`G:\GitHub\个人主页\var\yun_data`

## 核心结论

**推荐方式：Windows 开启 OpenSSH Server + 配置 SSH 公钥免密。**

这样：
- 不需要密码
- 定时任务最稳定
- 比把密码写进 `.env` 更安全

---

## 第 1 步：Windows 开启 OpenSSH Server

管理员 PowerShell 执行：

```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

然后放行防火墙：

```powershell
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

检查：

```powershell
Get-Service sshd
```

看到 `Running` 即可。

---

## 第 2 步：确认 Tailscale 在线

你的 Windows 电脑和 Linux 服务器都要登录同一个 tailnet。

Windows 上确认能看到：
- IP：`100.78.235.109`

Linux 服务器测试：

```bash
tailscale ping 100.78.235.109
```

---

## 第 3 步：创建备份目录

Windows 上先手动创建：

```powershell
New-Item -ItemType Directory -Force 'G:\GitHub\个人主页\var\yun_data'
```

注意：OpenSSH/SCP 下建议使用路径写法：

```text
/G:/GitHub/个人主页/var/yun_data
```

这就是你 `.env` 里的 `BACKUP_REMOTE_DIR`。

---

## 第 4 步：Linux 服务器生成 SSH 密钥

如果服务器上还没有专门给备份用的密钥：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_ysxs_backup -C "ysxs-backup"
```

生成后会得到：
- 私钥：`~/.ssh/id_ed25519_ysxs_backup`
- 公钥：`~/.ssh/id_ed25519_ysxs_backup.pub`

---

## 第 5 步：把公钥加入 Windows 的 authorized_keys

### Windows 用户目录一般是：

```text
C:\Users\你的用户名
```

创建目录和文件：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
New-Item -ItemType File -Force "$env:USERPROFILE\.ssh\authorized_keys"
```

把 Linux 服务器公钥内容追加进去。

Linux 查看公钥：

```bash
cat ~/.ssh/id_ed25519_ysxs_backup.pub
```

把输出整行复制到 Windows：

```powershell
notepad $env:USERPROFILE\.ssh\authorized_keys
```

粘贴保存。

---

## 第 6 步：修正 Windows 端 .ssh 权限

管理员 PowerShell：

```powershell
icacls $env:USERPROFILE\.ssh /inheritance:r
icacls $env:USERPROFILE\.ssh /grant "$env:USERNAME:(OI)(CI)F"
icacls $env:USERPROFILE\.ssh\authorized_keys /inheritance:r
icacls $env:USERPROFILE\.ssh\authorized_keys /grant "$env:USERNAME:F"
```

---

## 第 7 步：Linux 服务器写 SSH config

编辑：

```bash
nano ~/.ssh/config
```

加入：

```sshconfig
Host ysxs-backup-pc
    HostName 100.78.235.109
    User 你的Windows用户名
    Port 22
    IdentityFile ~/.ssh/id_ed25519_ysxs_backup
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
```

权限修正：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_ed25519_ysxs_backup
chmod 644 ~/.ssh/id_ed25519_ysxs_backup.pub
```

---

## 第 8 步：测试免密连接

```bash
ssh ysxs-backup-pc
```

如果能直接进入 Windows 的 SSH shell，说明成功。

再测试目录创建：

```bash
ssh ysxs-backup-pc "mkdir -p '/G:/GitHub/个人主页/var/yun_data'"
```

再测试传文件：

```bash
echo test > /tmp/ysxs-test.txt
scp /tmp/ysxs-test.txt 你的Windows用户名@100.78.235.109:/G:/GitHub/个人主页/var/yun_data/
```

---

## 第 9 步：`.env` 推荐写法

```env
BACKUP_REMOTE_HOST=100.78.235.109
BACKUP_REMOTE_PORT=22
BACKUP_REMOTE_USER=你的Windows用户名
BACKUP_REMOTE_DIR=/G:/GitHub/个人主页/var/yun_data
BACKUP_ALERT_EMAIL=yusp519@qq.com
```

### 重点

如果你已经配置了 SSH 密钥免密：

```env
BACKUP_REMOTE_PASSWORD=
```

保持空即可。

**所以答案是：正常情况下，不需要密码。**

---

## 常见坑

### 1. Windows 没开 sshd
现象：`Connection refused`

### 2. authorized_keys 权限不对
现象：仍然要求输入密码

### 3. 路径写成 `G:\...`
SCP/SSH 下不稳定，建议用：

```text
/G:/GitHub/个人主页/var/yun_data
```

### 4. Tailscale 没连上
现象：超时、无法连接

---

## 最后的推荐结论

你的场景最适合：

- **Tailscale 内网互通**
- **Windows OpenSSH Server**
- **SSH 密钥免密**
- **数据库每天自动备份**
- **uploads 每周增量备份**

这是最稳、最省心的组合。
