// Load the data and create the side-by-side boxplot
d3.csv("socialMedia.csv").then(function(data) {
    data.forEach(d => d.Likes = +d.Likes); // Convert Likes to numeric values

    // Set up SVG canvas and margins
    const margin = {top: 60, right: 30, bottom: 90, left: 60},
          width = 700 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Unique platforms
        .range([0, width])
        .padding(0.2);

    // Expand the Y-scale to ensure whiskers fit
    const yMax = d3.max(data, d => d.Likes);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1]) // Expanding scale by 10% for padding
        .range([height, 0]);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    // Add Y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Likes Distribution Across Platforms");

    // Add X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Platform");

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Likes");

    // Function to calculate quartiles for boxplot
    const rollupFunction = groupData => {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        return {
            min: d3.min(values),
            q1: d3.quantile(values, 0.25),
            median: d3.quantile(values, 0.5),
            q3: d3.quantile(values, 0.75),
            max: d3.max(values)
        };
    };

    // Group data by Platform and calculate quartiles for each
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    // Iterate over each group to draw boxplot elements
    quartilesByPlatform.forEach((q, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical whisker line (min to max)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(q.min))
            .attr("y2", yScale(q.max))
            .attr("stroke", "black");

        // Draw rectangle (box from Q1 to Q3)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(q.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(q.q1) - yScale(q.q3)) // Height is Q1 - Q3
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(q.median))
            .attr("y2", yScale(q.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});



// Side-by-side Bar Plot with Legend
d3.csv("SocialMediaAvg.csv").then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const margin = {top: 60, right: 140, bottom: 90, left: 60}, // Increased right margin for legend
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain([...new Set(data.map(d => d.Platform))]).range([0, width]).padding(0.2);
    const x1 = d3.scaleBand().domain([...new Set(data.map(d => d.PostType))]).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).range([height, 0]);
    const color = d3.scaleOrdinal().domain([...new Set(data.map(d => d.PostType))]).range(["#4e79a7", "#f28e2b", "#76b7b2"]);

    svg.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    svg.append("g").call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -40) // Move title higher
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Average Likes by Platform and Post Type");

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 40) // Move x-axis label lower
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Platform");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Likes");

    const platforms = d3.groups(data, d => d.Platform);

    svg.selectAll("g.platform")
        .data(platforms)
        .enter().append("g")
        .attr("transform", d => `translate(${x0(d[0])},0)`)
        .selectAll("rect")
        .data(d => d[1])
        .enter().append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // --- LEGEND ADDED BELOW ---
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, ${height / 4})`); // Adjust positioning of legend

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 25)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(type));

      legend.append("text")
          .attr("x", 25)
          .attr("y", i * 25 + 12)
          .text(type)
          .attr("alignment-baseline", "middle")
          .style("font-size", "14px");
    });
});

// Line Plot with Fixed X-Axis Label Cutoff
d3.csv("SocialMediaTime.csv").then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const margin = {top: 60, right: 30, bottom: 130, left: 80},  // Increased left margin to avoid cutoff
          width = 700 - margin.left - margin.right,  // Increased width
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(data.map(d => d.Date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end")
        .attr("dy", "15px")  // Push text downward more
        .attr("dx", "10px"); // Shift text slightly right to avoid cutting first label

    svg.append("g").call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Trend of Average Likes Over Time");

    // X-axis label (moved even lower)
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 80) // Lower the label further
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Date");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 25) // Shift y-label to avoid overlapping
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Likes");

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line().x(d => x(d.Date)).y(d => y(d.AvgLikes)).curve(d3.curveNatural));
});
