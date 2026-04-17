#!/bin/bash
# 【紧急】安全漏洞修复执行脚本
# 用法: bash fix_security_issue.sh
# 或在Windows PowerShell中手动执行各步骤

echo "🔴 开始执行安全漏洞修复..."
echo ""

# 第1步: 备份数据库
echo "📋 第1步: 备份数据库"
if [ -f "YSXS/ysxs.db" ]; then
    cp YSXS/ysxs.db YSXS/ysxs.db.backup.$(date +%s)
    echo "✅ 数据库已备份"
else
    echo "⚠️  未找到YSXS/ysxs.db，跳过备份"
fi
echo ""

# 第2步: 清除旧会话
echo "📋 第2步: 清除旧会话文件"
if [ -d "YSXS/instance/flask_session" ]; then
    rm -rf YSXS/instance/flask_session/*
    echo "✅ 会话文件已清除"
else
    echo "⚠️  未找到会话目录，跳过"
fi
echo ""

# 第3步: 检查.env文件
echo "📋 第3步: 验证.env配置"
if grep -q "YSXS_SECRET_KEY=" .env; then
    KEY=$(grep "YSXS_SECRET_KEY=" .env | cut -d'=' -f2)
    echo "✅ SECRET_KEY已配置: ${KEY:0:20}..."
else
    echo "🔴 错误: .env中未找到YSXS_SECRET_KEY"
    echo "请手动在.env中添加: YSXS_SECRET_KEY=<64位随机字符串>"
    exit 1
fi
echo ""

# 第4步: 重启应用提示
echo "📋 第4步: 重启应用"
echo ""
echo "⚠️  请手动停止应用后执行以下命令:"
echo ""
echo "Windows (PowerShell):"
echo "  conda activate YSZJ"
echo "  cd 'g:\\GitHub\\个人主页\\yshome'"
echo "  python -m YSXS.app"
echo ""
echo "Linux/Mac:"
echo "  source activate YSZJ"
echo "  python -m YSXS.app"
echo ""
read -p "按Enter键继续..."
echo ""

# 第5步: 验证
echo "📋 第5步: 验证修复"
echo ""
echo "运行测试:"
echo "1. 用不同用户在不同浏览器登陆"
echo "2. 验证每个浏览器显示正确的用户"
echo "3. 查看日志: tail -f YSXS/logs/app.log"
echo ""
echo "✅ 所有步骤已完成"
echo ""
echo "📞 如有问题,请查看:"
echo "- INCIDENT_SUMMARY.md - 完整分析"
echo "- SECURITY_HOTFIX.md - 技术文档"  
echo "- QUICK_FIX_CHECKLIST.md - 修复清单"
