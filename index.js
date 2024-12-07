function init() {
    // Set dimensions and margins for the chart
    const w = 500; 
    const h = 300; 
    const margin = { top: 20, right: 20, bottom: 60, left: 50 };

    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    // Placeholder for the dataset
    let dataset = [];

    // Load CSV data
    d3.csv("Table_Input.csv", d => ({
        index: d.Index,
        value: +d.Value // Convert 'Value' to a number
    })).then(data => {
        // Filter out invalid or missing data
        dataset = data.filter(d => !isNaN(d.value));

        if (dataset.length === 0) {
            console.error("Dataset is empty. Check the CSV file or data loading logic.");
            return;
        }

        // Create scales
        const xScale = d3.scaleBand()
            .domain(dataset.map(d => d.index))
            .range([0, innerWidth])
            .padding(0.05);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.value)])
            .range([innerHeight, 0]);

        // Create SVG container
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Append axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        chartGroup.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Add axis labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -innerHeight / 2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Values");

        chartGroup.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Index");

        // Function to render bars
        function renderBars() {
            const bars = chartGroup.selectAll("rect").data(dataset);

            // Enter and merge bars
            const barsEnter = bars.enter()
                .append("rect")
                .merge(bars);

            barsEnter
                .transition()
                .duration(500)
                .attr("x", d => xScale(d.index))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => innerHeight - yScale(d.value))
                .attr("fill", "rgb(106, 90, 205)");

            // Add hover interactions
            barsEnter.merge(bars)
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", "orange");

                    const xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
                    const yPosition = yScale(d.value) - 5;

                    // Append tooltip
                    chartGroup.append("text")
                        .attr("id", "tooltip")
                        .attr("x", xPosition)
                        .attr("y", yPosition)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .text(d.value);
                })
                .on("mouseout", function () {
                    d3.select("#tooltip").remove();
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr("fill", "rgb(106, 90, 205)");
                });

            // Remove old bars
            bars.exit().remove();
        }

        // Render bars initially
        renderBars();

        // Create table1 dictionary for calculations
        const table1Dict = {};
        dataset.forEach(row => {
            table1Dict[row.index] = row.value;
        });

        // Calculate Table 2 values
        const alpha = table1Dict["A5"] + table1Dict["A20"]; 
        const beta = Math.round(table1Dict["A15"] / table1Dict["A7"]);
        const charlie = table1Dict["A13"] * table1Dict["A12"];

        const table2Data = [
            { category: "Alpha", value: alpha },
            { category: "Beta", value: beta },
            { category: "Charlie", value: charlie }
        ];

        // Populate Table 2
        const table2Body = d3.select("#table2 tbody");

        table2Data.forEach(row => {
            const tr = table2Body.append("tr");

            tr.append("td")
                .text(row.category)
                .style("border", "1px solid black")
                .style("padding", "8px");

            tr.append("td")
                .text(row.value)
                .style("border", "1px solid black")
                .style("padding", "8px");
        });
    }).catch(error => {
        console.error("Error loading CSV data:", error);
    });
}

// Initialize the visualization on page load
window.onload = init;
