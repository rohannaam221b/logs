import React from 'react';
import styled from 'styled-components';

interface NewsItem {
  source: string;
  timestamp: string;
  headline: string;
  summary: string;
  imageUrl: string;
  link: string;
}

const Container = styled.div`
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NewsItemContainer = styled.article`
  width: 100vw;
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  opacity: 0.8;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 0.6) 40%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0.2) 80%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 2;
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
  padding: 3rem;
  position: relative;
  z-index: 3;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: #a0a0a0;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Source = styled.span`
  color: #f7931a;
  font-weight: 600;
`;

const Timestamp = styled.span`
  position: relative;
  padding-left: 1rem;
  &::before {
    content: '•';
    position: absolute;
    left: 0.3rem;
    color: #666;
  }
`;

const Headline = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
`;

const Summary = styled.p`
  font-size: 1.2rem;
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const ReadMoreButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #f7931a;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(247, 147, 26, 0.3);

  &:hover {
    background: #e8840a;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(247, 147, 26, 0.4);
  }

  &::after {
    content: '→';
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(4px);
  }
`;

const NavigationDots = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
`;

const NavDot = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#f7931a' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${props => props.active ? 'scale(1.2)' : 'scale(1)'};
  box-shadow: ${props => props.active ? '0 0 12px rgba(247, 147, 26, 0.4)' : 'none'};

  &:hover {
    background: rgba(247, 147, 26, 0.6);
    transform: scale(1.1);
  }
`;

const newsItems: NewsItem[] = [
  {
    source: 'CoinDesk',
    timestamp: '2025-07-28 07:30:21',
    headline: 'Bitcoin Surges Above $45,000 as Institutional Adoption Accelerates',
    summary: 'Bitcoin has broken through the $45,000 resistance level following news of major institutional investments from three Fortune 500 companies. The surge comes amid growing regulatory clarity and increased mainstream acceptance of cryptocurrency as a legitimate asset class.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    link: '#'
  },

  {
    source: 'CryptoSlate',
    timestamp: '2025-07-28 07:36:32', // Using the current timestamp
    headline: 'Ethereum 2.0 Staking Rewards Hit New High Amid Network Upgrades',
    summary: 'Ethereum staking yields have reached record highs following the successful implementation of recent network upgrades. The surge in rewards comes as the network experiences increased transaction volumes and growing institutional participation in the staking ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
    link: '#'
  }
  // Add more news items here
];

const CryptoNewsScroller: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const index = Math.round(container.scrollTop / window.innerHeight);
    setActiveIndex(index);
  };

  const scrollToNews = (index: number) => {
    const container = document.getElementById('newsContainer');
    if (container) {
      container.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Container id="newsContainer" onScroll={handleScroll}>
        {newsItems.map((item, index) => (
          <NewsItemContainer key={index}>
            <BackgroundImage src={item.imageUrl} alt="" />
            <Overlay />
            <Content>
              <Meta>
                <Source>{item.source}</Source>
                <Timestamp>{new Date(item.timestamp).toLocaleString()}</Timestamp>
              </Meta>
              <Headline>{item.headline}</Headline>
              <Summary>{item.summary}</Summary>
              <ReadMoreButton href={item.link}>Read Full Article</ReadMoreButton>
            </Content>
          </NewsItemContainer>
        ))}
      </Container>
      <NavigationDots>
        {newsItems.map((_, index) => (
          <NavDot
            key={index}
            active={index === activeIndex}
            onClick={() => scrollToNews(index)}
          />
        ))}
      </NavigationDots>
    </>
  );
};

export default CryptoNewsScroller;