import React, { useState } from 'react';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { BarChart3, ChevronUp, ChevronDown, Clock, Percent, Search, TrendingUp } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

type MarketCategory = 'crypto' | 'sports' | 'politics' | 'entertainment' | 'other';

interface PredictionMarketItem {
  id: string;
  title: string;
  category: MarketCategory;
  endDate: string;
  volume: string;
  yesPrice: number;
  noPrice: number;
  liquidity: string;
}

const SAMPLE_MARKETS: PredictionMarketItem[] = [
  {
    id: '1',
    title: 'Will Bitcoin exceed $100,000 by end of 2025?',
    category: 'crypto',
    endDate: '2025-12-31',
    volume: '1.2M USDC',
    yesPrice: 0.62,
    noPrice: 0.38,
    liquidity: '450K USDC'
  },
  {
    id: '2',
    title: 'Will Ethereum switch to a new consensus algorithm in 2025?',
    category: 'crypto',
    endDate: '2025-12-31',
    volume: '850K USDC',
    yesPrice: 0.28,
    noPrice: 0.72,
    liquidity: '320K USDC'
  },
  {
    id: '3',
    title: 'Will the USA win the most gold medals in the 2026 Winter Olympics?',
    category: 'sports',
    endDate: '2026-02-28',
    volume: '750K USDC',
    yesPrice: 0.55,
    noPrice: 0.45,
    liquidity: '280K USDC'
  }
];

const PredictionMarket: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = SAMPLE_MARKETS.filter(market => 
    (activeCategory === 'all' || market.category === activeCategory) &&
    (searchQuery === '' || market.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gold-gradient-text">
          Prediction Market
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trade on future outcomes with our decentralized prediction markets
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button 
              variant={activeCategory === 'all' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={activeCategory === 'crypto' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('crypto')}
            >
              Crypto
            </Button>
            <Button 
              variant={activeCategory === 'sports' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('sports')}
            >
              Sports
            </Button>
            <Button 
              variant={activeCategory === 'politics' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('politics')}
            >
              Politics
            </Button>
            <Button 
              variant={activeCategory === 'entertainment' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('entertainment')}
            >
              Entertainment
            </Button>
            <Button 
              variant={activeCategory === 'other' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveCategory('other')}
            >
              Other
            </Button>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="pl-10 pr-4 py-2 w-full md:w-[300px] bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map(market => (
              <GlassCard key={market.id}>
                <GlassCardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <GlassCardTitle className="text-xl">{market.title}</GlassCardTitle>
                      <GlassCardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        Ends: {market.endDate}
                        <span className="mx-2">•</span>
                        <TrendingUp className="h-4 w-4" />
                        Volume: {market.volume}
                      </GlassCardDescription>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <span className="text-sm text-white/40">Category</span>
                        <div className="capitalize text-white">{market.category}</div>
                      </div>
                      <BarChart3 className="h-5 w-5 text-[var(--gold-accent)]" />
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="flex justify-between items-center">
                    <div className="w-full max-w-md mx-auto">
                      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-[var(--gold-accent)]" 
                          style={{ width: `${market.yesPrice * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <div className="flex items-center">
                          <ChevronUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-white">{(market.yesPrice * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-white">{(market.noPrice * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 text-right">
                      <div className="text-sm text-white/40">Liquidity</div>
                      <div className="font-medium text-white">{market.liquidity}</div>
                    </div>
                  </div>
                </GlassCardContent>
                <GlassCardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" disabled={!isWalletConnected}>
                    <Percent className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={!isWalletConnected}>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button variant="secondary" size="sm" disabled={!isWalletConnected}>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                </GlassCardFooter>
              </GlassCard>
            ))
          ) : (
            <GlassCard>
              <GlassCardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-medium mb-2 text-white">No Markets Found</h3>
                <p className="text-white/60 mb-4">No prediction markets match your current filters.</p>
                <Button variant="outline" onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}>
                  Clear Filters
                </Button>
              </GlassCardContent>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionMarket;
