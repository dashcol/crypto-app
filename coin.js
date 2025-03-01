let myChart;
async function displayData(coinId = "bitcoin") {
  const data = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  if (data) {
    const coinImg = document.getElementById("coin-img");
    const coinHead = document.getElementById("coin-head");
    const coinDesc = document.getElementById("coin-desc");
    const coinRank = document.getElementById("coin-rank");
    const coinPrice = document.getElementById("coin-price");
    const coinMarketCap = document.getElementById("coin-market-cap");

    coinImg.src = data.image.large || "";
    coinHead.textContent = data.name || "";

    const fullDesc = data.description.en || "Description not available.";
    const truncatedDesc = fullDesc.split(". ").slice(0, 3).join(". ") + ".";
    coinDesc.textContent =
      truncatedDesc.length > 0 ? truncatedDesc : "Description not available.";

    coinRank.textContent = `Rank: ${data.market_cap_rank || "N/A"}`;
    coinPrice.textContent = `Current Price: $${
      data.market_data.current_price.usd || "N/A"
    }`;
    coinMarketCap.textContent = `Market Cap: $${
      data.market_data.market_cap.usd || "N/A"
    }`; // Set market cap
  }
}

async function chartData(coinId = "bitcoin", days = "30") {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const data = await fetch(url)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  const prices = data.prices.map((priceData) => priceData[1]); // Extract price
  const labels = data.prices.map((priceData) =>
    new Date(priceData[0]).toLocaleDateString()
  );

  if (!myChart) {
    createChart();
  }
  updateChart(labels, prices);
}

function createChart() {
  const ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Price USD",
          data: [],
          borderColor: "#EEBC1D",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
        },
        y: {
          display: true,
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return `$${value}`;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `$${context.parsed.y}`;
            },
          },
        },
      },
    },
  });
}

function updateChart(labels, prices) {
  myChart.data.labels = labels;
  myChart.data.datasets[0].data = prices;
  myChart.update();
}

const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    buttons.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    const days = e.target.id === "24h" ? 1 : e.target.id === "30d" ? 30 : 90;
    chartData("bitcoin", days);
  });
});
displayData();
chartData();
