
const { useEffect, useState } = React;
const { Card, CardContent } = window['@material-ui/core'];
const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } = window.Recharts;

const fetchCryptoData = async (source) => {
  const urls = {
    coingecko: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc",
    coinmarketcap: "https://api.coinmarketcap.com/v1/ticker/?limit=10",
    coinglass: "https://coinglass.com/api/top-gainers-losers",
    coinranking: "https://api.coinranking.com/v2/coins?orderBy=change",
    coincarp: "https://api.coincarp.com/api/gainers-losers"
  };

  try {
    const response = await fetch(urls[source]);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from", source, error);
    return [];
  }
};

function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const sources = ["coingecko", "coinmarketcap", "coinglass", "coinranking", "coincarp"];

  useEffect(() => {
    const fetchData = async () => {
      const allData = {};
      const newAlerts = [];
      for (const source of sources) {
        const data = await fetchCryptoData(source);
        allData[source] = data;

        data?.slice(0, 5).forEach((coin) => {
          if (coin.price_change_percentage_24h > 10) {
            newAlerts.push(`${coin.name} surged ${coin.price_change_percentage_24h.toFixed(2)}%`);
          }
        });
      }
      setCryptoData(allData);
      setAlerts(newAlerts);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      {alerts.length > 0 && (
        <div className="col-span-3 bg-yellow-200 p-4 rounded-lg">
          <h2 className="text-lg font-bold">Alerts</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}
      {sources.map((source) => (
        <Card key={source}>
          <CardContent>
            <h2 className="text-xl font-bold capitalize">{source} Top Gainers</h2>
            <ul>
              {cryptoData[source]?.slice(0, 5).map((coin, index) => (
                <li key={index} className="mt-2">
                  {coin.name} ({coin.symbol.toUpperCase()}): ${coin.current_price}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

ReactDOM.render(<CryptoDashboard />, document.getElementById('root'));
