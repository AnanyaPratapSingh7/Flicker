# Flicker

Flicker is a modern, AI-powered DeFi platform that combines the power of natural language processing with blockchain technology to create an intuitive and efficient trading experience.

## Features

- 🤖 AI-Powered Trading: Execute trades using natural language commands
- 🔄 Cross-Chain Support: Trade across multiple blockchains seamlessly
- 💰 Smart Portfolio Management: AI-driven portfolio optimization
- 📊 Advanced Analytics: Real-time market insights and predictions
- 🔒 Enhanced Security: Multi-layer security with AI threat detection
- 🌐 Multi-Chain Support: Trade on Ethereum, BSC, Polygon, and more

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AnanyaPratapSingh7/Flicker.git
cd Flicker
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key
NEXT_PUBLIC_OPENROUTER_MODEL=your_model
NEXT_PUBLIC_OKX_API_KEY=your_okx_api_key
NEXT_PUBLIC_OKX_API_SECRET=your_okx_api_secret
NEXT_PUBLIC_OKX_API_PASSPHRASE=your_okx_api_passphrase
```

4. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
Flicker/
├── src/
│   ├── api/              # API clients and types
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── okx-core/        # OKX integration core
│   └── utils/           # Utility functions
├── docs/                # Documentation
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI capabilities
- [OKX](https://www.okx.com/) for DEX integration
- [Ethers.js](https://docs.ethers.org/) for blockchain interaction
- [React](https://reactjs.org/) for the frontend framework

