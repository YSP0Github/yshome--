# SeisY 下载目录说明

本目录用于存放 **官网 SeisY 下载页面**使用的版本信息与二进制文件。

## 目录结构

- `releases.json`：页面读取的版本清单与下载链接
- `releases/`：实际安装包与便携版压缩包

## 当前约定

- 安装版文件名：`SeisY-0.1.6-Setup.exe`
- 便携版文件名：`SeisY-0.1.6-Portable.zip`

## 更新新版本的步骤

1. 把新的安装包放进 `downloads/seisy/releases/`
2. 把新的便携版目录压缩成 zip 后放进 `downloads/seisy/releases/`
3. 修改 `downloads/seisy/releases.json` 中的：
   - `latest.version`
   - `latest.published_at`
   - `latest.notes`
   - `latest.artifacts[*].filename/url/size/description`
4. 如需保留版本记录，在 `history` 里追加一条
5. 本地打开 `HTML/SeisY.html` 检查下载卡片是否正常显示

## Git 约定

大体积二进制文件已在仓库 `.gitignore` 中忽略：

- `downloads/seisy/releases/*`

因此：

- 页面结构与 `releases.json` 可以提交
- 安装包与 zip 不会被误提交到 GitHub

如果以后需要把安装包放到别的静态目录或对象存储，也只需要改 `releases.json` 里的 `url`。
