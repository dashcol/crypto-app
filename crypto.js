let currentPage = 1;
let coinsData = [];

async function fetchCoins(page) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-mDVQlm5X8DjvcVy523LnAmB",
    },
  };

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch coins:", error);
    return null;
  }
}

async function render(page, shouldFetch = true) {
  if (shouldFetch) {
    coinsData = await fetchCoins(page);
  }

  const bdoy = document.getElementById("table-body");

  bdoy.innerHTML = "";

  coinsData.forEach((e, index) => {
    const row = document.createElement("tr");
    row.dataset.id = e.id;
    row.innerHTML = `<tr>
    <td>${index + 1}</td>
    <td><img src='${e.image}'/></td>
    <td>${e.name}</td>
   <td>$${e.current_price.toLocaleString()}</td>
    <td>${e.total_volume.toLocaleString()}</td>
   <td>${e.market_cap.toLocaleString()}</td>
    <td><i class="fas fa-heart fav-icon" style="color: grey; cursor: pointer;"></i></td>`;
    row.addEventListener("click", () => {
      const coinId = row.dataset.id;
      console.log("Redirecting to:", `coinPage.html?id=${coinId}`);
      window.location.href = `coinPage.html?id=${coinId}`;
    });

    bdoy.appendChild(row);
  });
  document.getElementById("prev-btn").disabled = page === 1;
  document.getElementById("next-btn").disabled = coinsData.length < 25;

  fav();
}
function setupPagination() {
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render(currentPage);
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    currentPage++;
    render(currentPage);
  });
}
function fav() {
  const favIcons = document.querySelectorAll(".fav-icon");

  favIcons.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.stopPropagation();

      const row = icon.closest("tr");
      const coinId = row.dataset.id;

      const coinData = {
        id: coinId,
        position: row.children[0].textContent.trim(),
        image: row.children[1].querySelector("img").src,
        name: row.children[2].textContent.trim(),
        price: row.children[3].textContent.trim(),
        volume: row.children[4].textContent.trim(),
        marketCap: row.children[5].textContent.trim(),
      };

      let favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];

      if (icon.style.color === "red") {
        favorites = favorites.filter((fav) => fav.id !== coinId);
        icon.style.color = "grey";
      } else {
        favorites.push(coinData);
        icon.style.color = "red";
      }

      sessionStorage.setItem("favorites", JSON.stringify(favorites));
      console.log("Updated Favorites:", favorites);
    });
  });
}

async function setupSearch() {
  const searchBox = document.querySelector("#search-box");
  const searchDialog = document.querySelector("#search-dialog");
  const searchResults = document.querySelector("#search-results");

  searchBox.addEventListener("input", async () => {
    const query = searchBox.value.trim();

    
    searchResults.innerHTML = "";

    if (query.length === 0) {
      searchDialog.style.display = "none"; 
      return;
    }

    try {
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (data.coins && data.coins.length > 0) {
        searchDialog.style.display = "block";
        data.coins.forEach((coin) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${coin.name} (${coin.symbol})`;
          searchResults.appendChild(listItem);
        });
      } else {
        searchDialog.style.display = "block";
        searchResults.innerHTML = "<li>No results found</li>";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      searchResults.innerHTML = "<li>Error fetching results</li>";
    }
  });

  document.querySelector("#close-dialog").addEventListener("click", () => {
    searchDialog.style.display = "none";
  });
}

function sorting() {
  const sortCoinByField = (field, order) => {
    coinsData.sort((a, b) => {
      return order === "asc" ? a[field] - b[field] : b[field] - a[field];
    });
    render(currentPage, false);
  };

  document
    .querySelector("#sort-price-asc")
    .addEventListener("click", () => sortCoinByField("current_price", "asc"));

  document
    .querySelector("#sort-price-desc")
    .addEventListener("click", () => sortCoinByField("current_price", "desc"));

  document
    .querySelector("#sort-volume-asc")
    .addEventListener("click", () => sortCoinByField("total_volume", "asc"));

  document
    .querySelector("#sort-volume-desc")
    .addEventListener("click", () => sortCoinByField("total_volume", "desc"));

  document
    .querySelector("#sort-market-asc")
    .addEventListener("click", () => sortCoinByField("market_cap", "asc"));

  document
    .querySelector("#sort-market-desc")
    .addEventListener("click", () => sortCoinByField("market_cap", "desc"));
}
function setupLikedLink() {
  const likedLink = document.getElementById("liked-link");

  likedLink.addEventListener("click", () => {
    let favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];

    window.location.href = "liked.html";
  });
}

setupSearch();
render(currentPage);
setupPagination();
sorting();
setupLikedLink();
