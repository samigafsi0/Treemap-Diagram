const urlKickstarter =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const urlMovie =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const urlVideoGame =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const canvas = d3.select("#canvas");
const legend = d3.select("#legend");
const tooltip = d3.select("#tooltip").style("visibility", "hidden");
let text1 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text1")
  .attr("class", "info")
  .text(".");
let text2 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text2")
  .attr("class", "info")
  .text(".");
let text3 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text3")
  .attr("class", "info")
  .text(".");

const canvasWidth = 1200;
const canvasHeight = 650;
const legendWidth = 600;
const legendHeight = 150;

let dataRawKickstarter;
let kickstarterCategoryList;
let dataRawMovie;
let movieCategoryList;
let dataRawVideoGame;
let gameCategoryList;

Promise.all([
  d3.json(urlKickstarter),
  d3.json(urlMovie),
  d3.json(urlVideoGame),
]).then(([firstResult, secondResult, thirdResult], error) => {
  if (error) {
    console.log(error);
  } else {
    dataRawKickstarter = firstResult;
    dataRawMovie = secondResult;
    dataRawVideoGame = thirdResult;
    cleanData();
    drawSpace();
    drawTreeMap();
    drawLegend();
  }
});

const drawSpace = () => {
  canvas.attr("width", canvasWidth).attr("height", canvasHeight);
  legend.attr("width", legendWidth).attr("height", legendHeight);
};

const cleanData = () => {
  movieCategoryList = dataRawMovie.children.map((item) => {
    return item.name;
  });
  console.log(movieCategoryList);
};

const drawTreeMap = () => {
  let hierarchy = d3
    .hierarchy(dataRawMovie, (node) => {
      return node.children;
    })
    .sum((node) => {
      return node.value;
    })
    .sort((node1, node2) => {
      return node2.value - node1.value;
    });

  let createTreeMap = d3.treemap().size([canvasWidth, canvasHeight]);
  createTreeMap(hierarchy);

  let movieTiles = hierarchy.leaves();
  console.log(movieTiles);

  let canvasBlock = canvas
    .selectAll("g")
    .data(movieTiles)
    .enter()
    .append("g")
    .attr("transform", (movie) => {
      return "translate(" + movie.x0 + ", " + movie.y0 + ")";
    })
    .on("mouseover", (nothing, movie) => {
      tooltip.style("visibility", "visible");
      let r = document.querySelector("#canvas").getBoundingClientRect();

      tooltip.style("top", r.y + movie.y0 + 5 + "px");
      tooltip.style("left", r.x + movie.x1 + 5 + "px");
      text1.text("Name : " + movie.data.name);
      text2.text("Category : " + movie.data.category);
      text3.text("Value : " + Math.round(movie.data.value / 1000000) / 100);
      document
        .querySelector("#tooltip")
        .setAttribute("data-value", movie.data.value);
    });

  canvasBlock
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (movie) => {
      return colorPicker(movie.data.category);
    })
    .attr("data-name", (movie) => {
      return movie.data.name;
    })
    .attr("data-category", (movie) => {
      return movie.data.category;
    })
    .attr("data-value", (movie) => {
      return movie.data.value;
    })
    .attr("width", (movie) => {
      return movie.x1 - movie.x0 - 0.5;
    })
    .attr("height", (movie) => {
      return movie.y1 - movie.y0 - 0.5;
    })

    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  canvasBlock
    .append("text")
    .text((movie) => {
      return movie.data.name;
    })
    .attr("x", 5)
    .attr("y", 20)
    .style("font-size", "0.8em");
};

const colorPicker = (item) => {
  let pickedColor = "";
  switch (item) {
    case "Action":
      pickedColor = "blue";
      break;
    case "Comedy":
      pickedColor = "yellow";
      break;
    case "Drama":
      pickedColor = "purple";
      break;
    case "Adventure":
      pickedColor = "green";
      break;
    case "Family":
      pickedColor = "orange";
      break;
    case "Animation":
      pickedColor = "pink";
      break;
    case "Biography":
      pickedColor = "grey";
      break;
  }
  return pickedColor;
};

const drawLegend = () => {
  let rowUnit =
    legendHeight / (Math.ceil(movieCategoryList.length / 4) * 3 - 1);
  if (rowUnit > 10) {
    rowUnit = 10;
  }
  console.log(rowUnit);
  let legendBlock = legend
    .selectAll("g")
    .data(movieCategoryList)
    .enter()
    .append("g");

  legendBlock
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", rowUnit * 2)
    .attr("height", rowUnit * 2)
    .attr("fill", (category) => {
      return colorPicker(category);
    })
    .attr("x", (d, i) => {
      return (i % 4) * (legendWidth / 4);
    })
    .attr("y", (d, i) => {
      return Math.floor(i / 4) * (rowUnit * 3);
    });
  legendBlock
    .append("text")
    .text((category) => {
      return category;
    })
    .attr("x", (d, i) => {
      return (i % 4) * (legendWidth / 4) + rowUnit * 2 + 5;
    })
    .attr("y", (d, i) => {
      return Math.floor(i / 4) * (rowUnit * 3) + rowUnit + 5;
    });
};
