# 🔧 硬件工程师工具箱

一站式硬件工程师实用工具集合，纯前端静态网站，可部署到 **GitHub Pages**。

## 🛠 工具列表

| 工具 | 说明 |
|------|------|
| 🔵 **电容单位换算** | pF ↔ nF ↔ µF ↔ mF ↔ F 快速换算 |
| 🟢 **电阻单位换算** | mΩ ↔ Ω ↔ kΩ ↔ MΩ ↔ GΩ 快速换算 |
| 🌈 **电阻色环码计算** | 4色环/5色环电阻色码 ↔ 阻值 互转 |
| ⚡ **欧姆定律计算** | 输入任意两个参数（V/I/R/P），自动求解其余 |
| 💡 **LED 限流电阻** | 计算LED串联限流电阻，含常用LED预设 |
| 🔻 **分压计算器** | 电阻分压电路 Vout 计算 |

## 🚀 使用方法

### 本地运行
直接用浏览器打开 `index.html` 即可，无需任何构建工具或服务器。

### 部署到 GitHub Pages
1. Fork 或上传本项目到你的 GitHub 仓库
2. 进入仓库 Settings → Pages
3. Source 选择 `main` 分支，根目录 `/`
4. 保存后等待部署完成

## 📁 项目结构

```
hardware-tools/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式（深色主题）
├── js/
│   ├── app.js              # 主应用逻辑 & 工具注册
│   └── tools/
│       ├── capacitor-converter.js   # 电容单位换算
│       ├── resistor-converter.js    # 电阻单位换算
│       ├── resistor-color-code.js   # 电阻色环码计算
│       ├── ohms-law.js              # 欧姆定律计算器
│       ├── led-resistor.js          # LED 限流电阻
│       └── voltage-divider.js       # 分压计算器
└── README.md
```

## 🔮 计划添加的工具

- 电容串联/并联计算
- 电阻串联/并联计算
- 555定时器计算
- 运放增益计算
- 色环电感计算
- PCB走线宽度计算
- 数字逻辑转换
- 常用芯片引脚速查

## 📄 License

MIT — 自由使用，欢迎贡献。
